import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InstallerProfileModelAction } from './actions/installer-profile.action';
import { InverterAssignmentModelAction } from './actions/inverter-assignment.action';
import { InstallerProfile } from './entities/installer_profiles.entity';
import { InverterAssignment } from './entities/inverter-assignment.entity';
import { InstallerStatus } from '../../common/enums/installer-status.enum';
import { AssignmentStatus } from '../../common/enums/assignment-status.enum';
import { UserRole } from '../../common/enums/user-role';
import { SYS_MSG } from '../../common/constants/sys-msg';
import { noTransaction } from '../../common/constants/transaction-options';
import { InvertersService } from '../inverters/inverters.service';
import { UsersService } from '../users/users.service';
import { CreateInstallerProfileDto } from './dto/create-installer-profile.dto';
import { QueryInstallersDto } from './dto/query-installers.dto';
import { UpdateInstallerStatusDto } from './dto/update-installer-status.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class InstallersService {
  constructor(
    private readonly profileAction: InstallerProfileModelAction,
    private readonly assignmentAction: InverterAssignmentModelAction,
    private readonly invertersService: InvertersService,
    private readonly usersService: UsersService,
  ) {}

  // ── Lookups ─────────────────────────────────────────────────────────────────

  async findProfileById(id: string): Promise<InstallerProfile> {
    const profile = await this.profileAction.get({ identifierOptions: { id } });
    if (!profile) throw new NotFoundException(SYS_MSG.NOT_FOUND);
    return profile;
  }

  async findProfileByUserId(userId: string): Promise<InstallerProfile | null> {
    return this.profileAction.get({ identifierOptions: { userId } });
  }

  // ── Super-admin: summary ─────────────────────────────────────────────────────

  async getSummary() {
    const repository = this.profileAction['repository'];

    const result = await repository
      .createQueryBuilder('p')
      .select('COUNT(*)', 'total')
      .addSelect(`COUNT(*) FILTER (WHERE p.type = 'partner')`, 'partners')
      .addSelect(`COUNT(*) FILTER (WHERE p.type = 'technician')`, 'technicians')
      .addSelect(`COUNT(*) FILTER (WHERE p.status = 'pending')`, 'pending')
      .addSelect(`COUNT(*) FILTER (WHERE p.status = 'active')`, 'active')
      .addSelect(`COUNT(*) FILTER (WHERE p.status = 'suspended')`, 'suspended')
      .where('p.deleted_at IS NULL')
      .getRawOne<Record<string, string>>();

    return {
      total: parseInt(result?.['total'] ?? '0', 10),
      partners: parseInt(result?.['partners'] ?? '0', 10),
      technicians: parseInt(result?.['technicians'] ?? '0', 10),
      pending: parseInt(result?.['pending'] ?? '0', 10),
      active: parseInt(result?.['active'] ?? '0', 10),
      suspended: parseInt(result?.['suspended'] ?? '0', 10),
    };
  }

  // ── Super-admin: list ────────────────────────────────────────────────────────

  async findAll(query: QueryInstallersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    // brand filter requires an array contains check — drop to QueryBuilder
    // for that case and also when search is combined with other filters.
    if (query.brand || query.search) {
      const repository = this.profileAction['repository'];
      const qb = repository
        .createQueryBuilder('p')
        .where('p.deleted_at IS NULL');

      if (query.type) qb.andWhere('p.type = :type', { type: query.type });
      if (query.status)
        qb.andWhere('p.status = :status', { status: query.status });
      if (query.state) qb.andWhere('p.state = :state', { state: query.state });
      if (query.brand)
        qb.andWhere(':brand = ANY(p.supported_brands)', {
          brand: query.brand,
        });

      if (query.search) {
        const t = `%${query.search}%`;
        qb.andWhere(
          '(p.contact_name ILIKE :t OR p.email ILIKE :t OR p.company_name ILIKE :t)',
          { t },
        );
      }

      const total = await qb.getCount();
      const payload = await qb
        .orderBy('p.created_at', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return {
        payload,
        paginationMeta: {
          total,
          page,
          limit,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    }

    // Simple filter path — use SDK list()
    return this.profileAction.list({
      filterRecordOptions: {
        ...(query.type && { type: query.type }),
        ...(query.status && { status: query.status }),
        ...(query.state && { state: query.state }),
      },
      paginationPayload: { page, limit },
      order: { createdAt: 'DESC' },
    });
  }

  // ── Super-admin: detail ──────────────────────────────────────────────────────

  async findOne(id: string): Promise<InstallerProfile> {
    const repository = this.profileAction['repository'];

    const profile = await repository.findOne({
      where: { id },
      relations: {
        user: true,
        assignments: true,
      },
    });

    if (!profile) throw new NotFoundException(SYS_MSG.NOT_FOUND);
    return profile;
  }

  // ── Super-admin: create profile ──────────────────────────────────────────────

  async createProfile(
    dto: CreateInstallerProfileDto,
  ): Promise<InstallerProfile> {
    // The user account must already exist
    const user = await this.usersService.findOne(dto.userId);
    if (!user) throw new NotFoundException(SYS_MSG.NOT_FOUND);

    // One profile per user
    const existing = await this.findProfileByUserId(dto.userId);
    if (existing) throw new ConflictException(SYS_MSG.CONFLICT);

    // Promote the user to installer role
    await this.usersService.promoteUser(dto.userId, {
      role: UserRole.INSTALLER,
    });

    return this.profileAction.create({
      ...noTransaction(),
      createPayload: {
        userId: dto.userId,
        type: dto.type,
        companyName: dto.companyName ?? null,
        contactName: dto.contactName,
        email: dto.email,
        phoneNumber: dto.phoneNumber ?? null,
        state: dto.state ?? null,
        region: dto.region ?? null,
        supportedBrands:
          (dto.supportedBrands as InstallerProfile['supportedBrands']) ?? [],
        notes: dto.notes ?? null,
        // new profiles start as PENDING until super-admin activates them
        status: InstallerStatus.PENDING,
      },
    });
  }

  // ── Super-admin: update status ───────────────────────────────────────────────

  async updateStatus(
    id: string,
    dto: UpdateInstallerStatusDto,
  ): Promise<InstallerProfile> {
    const profile = await this.findProfileById(id);

    // When suspending, revoke all active assignments for this installer
    if (dto.status === InstallerStatus.SUSPENDED) {
      await this._revokeAllAssignmentsForProfile(id);
    }

    const updated = await this.profileAction.update({
      ...noTransaction(),
      identifierOptions: { id: profile.id },
      updatePayload: { status: dto.status },
    });

    if (!updated) throw new NotFoundException(SYS_MSG.NOT_FOUND);
    return updated;
  }

  // ── Assignments: create ──────────────────────────────────────────────────────

  async createAssignment(
    dto: CreateAssignmentDto,
    requestingUserId: string,
  ): Promise<InverterAssignment> {
    // Verify the inverter exists and belongs to the requesting user
    const inverter = await this.invertersService.findOne(dto.inverterId);
    if (inverter.userId !== requestingUserId) {
      throw new ForbiddenException(SYS_MSG.FORBIDDEN);
    }

    // Installer profile must exist and be ACTIVE
    const profile = await this.findProfileById(dto.installerProfileId);
    if (profile.status !== InstallerStatus.ACTIVE) {
      throw new ConflictException(
        'Installer profile is not active and cannot be assigned.',
      );
    }

    // Guard against duplicate active assignment (DB index also enforces this)
    const existing = await this.assignmentAction.get({
      identifierOptions: {
        inverterId: dto.inverterId,
        installerProfileId: dto.installerProfileId,
        status: AssignmentStatus.ACTIVE,
      },
    });
    if (existing) {
      throw new ConflictException(
        'This installer already has an active assignment on this inverter.',
      );
    }

    return this.assignmentAction.create({
      ...noTransaction(),
      createPayload: {
        inverterId: dto.inverterId,
        installerProfileId: dto.installerProfileId,
        assignedByUserId: requestingUserId,
        role: dto.role,
        status: AssignmentStatus.ACTIVE,
        assignedAt: new Date(),
        revokedAt: null,
      },
    });
  }

  // ── Assignments: revoke ──────────────────────────────────────────────────────

  async revokeAssignment(
    assignmentId: string,
    requestingUserId: string,
  ): Promise<InverterAssignment> {
    const assignment = await this.assignmentAction.get({
      identifierOptions: { id: assignmentId },
    });
    if (!assignment) throw new NotFoundException(SYS_MSG.NOT_FOUND);

    // Only the inverter owner can revoke
    const inverter = await this.invertersService.findOne(assignment.inverterId);
    if (inverter.userId !== requestingUserId) {
      throw new ForbiddenException(SYS_MSG.FORBIDDEN);
    }

    if (assignment.status === AssignmentStatus.REVOKED) {
      throw new ConflictException('Assignment is already revoked.');
    }

    const updated = await this.assignmentAction.update({
      ...noTransaction(),
      identifierOptions: { id: assignmentId },
      updatePayload: {
        status: AssignmentStatus.REVOKED,
        revokedAt: new Date(),
      },
    });

    if (!updated) throw new NotFoundException(SYS_MSG.NOT_FOUND);
    return updated;
  }

  // ── Assignments: list for an inverter ────────────────────────────────────────

  async getAssignmentsForInverter(
    inverterId: string,
    requestingUserId: string,
  ): Promise<InverterAssignment[]> {
    // Verify ownership
    const inverter = await this.invertersService.findOne(inverterId);
    if (inverter.userId !== requestingUserId) {
      throw new ForbiddenException(SYS_MSG.FORBIDDEN);
    }

    const { payload } = await this.assignmentAction.list({
      filterRecordOptions: {
        inverterId,
        status: AssignmentStatus.ACTIVE,
      },
      relations: { installerProfile: true },
      order: { assignedAt: 'DESC' },
    });

    return payload;
  }

  // ── Assignments: list for an installer ──────────────────────────────────────

  async getAssignmentsForInstaller(
    installerProfileId: string,
  ): Promise<InverterAssignment[]> {
    const { payload } = await this.assignmentAction.list({
      filterRecordOptions: {
        installerProfileId,
        status: AssignmentStatus.ACTIVE,
      },
      relations: { inverter: true },
      order: { assignedAt: 'DESC' },
    });

    return payload;
  }

  // ── Internal helpers ─────────────────────────────────────────────────────────

  private async _revokeAllAssignmentsForProfile(
    installerProfileId: string,
  ): Promise<void> {
    const repository = this.assignmentAction['repository'];
    await repository.update(
      { installerProfileId, status: AssignmentStatus.ACTIVE },
      { status: AssignmentStatus.REVOKED, revokedAt: new Date() },
    );
  }
}

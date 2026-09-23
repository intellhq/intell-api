import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InstallerProfileModelAction } from './actions/installer-profile.action';
import { InverterAssignmentModelAction } from './actions/inverter-assignment.action';
import { InstallerProfile } from './entities/installer_profiles.entity';
import { InverterAssignment } from './entities/inverter-assignment.entity';
import { InstallerStatus } from '../../common/enums/installer-status.enum';
import { AssignmentStatus } from '../../common/enums/assignment-status.enum';
import { UserRole } from '../../common/enums/user-role';
import { User } from '../users/entities/user.entity';
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
    @InjectDataSource() private readonly dataSource: DataSource,
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

    // Refuse to overwrite a privileged role — only USER or INSTALLER accounts
    // may be promoted to the INSTALLER role.
    const promotableRoles: UserRole[] = [UserRole.USER, UserRole.INSTALLER];
    if (!promotableRoles.includes(user.role)) {
      throw new ConflictException(
        'This account has a privileged role and cannot be assigned an installer profile.',
      );
    }

    // One profile per user
    const existing = await this.findProfileByUserId(dto.userId);
    if (existing) throw new ConflictException(SYS_MSG.CONFLICT);

    // Promote role and create profile atomically — if either write fails
    // the user must not be left with INSTALLER role without a profile
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .update(User)
        .set({ role: UserRole.INSTALLER })
        .where('id = :id', { id: dto.userId })
        .execute();

      const profile = queryRunner.manager.create(InstallerProfile, {
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
        status: InstallerStatus.PENDING,
      });

      const saved = await queryRunner.manager.save(InstallerProfile, profile);
      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ── Super-admin: update status ───────────────────────────────────────────────

  async updateStatus(
    id: string,
    dto: UpdateInstallerStatusDto,
  ): Promise<InstallerProfile> {
    // For suspension, we need to atomically lock the profile, revoke all
    // assignments, and persist the status change so no new assignments
    // can be created against a profile mid-suspension.
    if (dto.status === InstallerStatus.SUSPENDED) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Lock the profile row for the duration of the transaction
        const profile = await queryRunner.manager
          .createQueryBuilder(InstallerProfile, 'p')
          .setLock('pessimistic_write')
          .where('p.id = :id', { id })
          .getOne();

        if (!profile) throw new NotFoundException(SYS_MSG.NOT_FOUND);

        // Bulk-revoke all active assignments within the same transaction
        await queryRunner.manager
          .createQueryBuilder()
          .update(InverterAssignment)
          .set({ status: AssignmentStatus.REVOKED, revokedAt: new Date() })
          .where('installer_profile_id = :id AND status = :status', {
            id,
            status: AssignmentStatus.ACTIVE,
          })
          .execute();

        // Persist the suspended status
        await queryRunner.manager
          .createQueryBuilder()
          .update(InstallerProfile)
          .set({ status: InstallerStatus.SUSPENDED })
          .where('id = :id', { id })
          .execute();

        await queryRunner.commitTransaction();

        return { ...profile, status: InstallerStatus.SUSPENDED };
      } catch (err) {
        if (queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction();
        }
        throw err;
      } finally {
        await queryRunner.release();
      }
    }

    // Non-suspension status changes need no locking
    const profile = await this.findProfileById(id);
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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Acquire a pessimistic write lock on the profile so concurrent
      // createAssignment calls for the same profile are serialized, and so
      // this transaction blocks against any concurrent suspension transaction
      // that also holds a write lock on the profile row.
      const profile = await queryRunner.manager
        .createQueryBuilder(InstallerProfile, 'p')
        .setLock('pessimistic_write')
        .where('p.id = :id', { id: dto.installerProfileId })
        .getOne();

      if (!profile) throw new NotFoundException(SYS_MSG.NOT_FOUND);

      if (profile.status !== InstallerStatus.ACTIVE) {
        throw new ConflictException(
          'Installer profile is not active and cannot be assigned.',
        );
      }

      // Guard against duplicate active assignment
      const existing = await queryRunner.manager.findOne(InverterAssignment, {
        where: {
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

      const assignment = queryRunner.manager.create(InverterAssignment, {
        inverterId: dto.inverterId,
        installerProfileId: dto.installerProfileId,
        assignedByUserId: requestingUserId,
        role: dto.role,
        status: AssignmentStatus.ACTIVE,
        assignedAt: new Date(),
        revokedAt: null,
      });

      const saved = await queryRunner.manager.save(
        InverterAssignment,
        assignment,
      );
      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ── Assignments: revoke ──────────────────────────────────────────────────────

  async revokeAssignment(
    assignmentId: string,
    requestingUserId: string,
    expectedInverterId?: string,
  ): Promise<InverterAssignment> {
    const assignment = await this.assignmentAction.get({
      identifierOptions: { id: assignmentId },
    });
    if (!assignment) throw new NotFoundException(SYS_MSG.NOT_FOUND);

    // Reject if the assignment does not belong to the inverter named in the URL
    if (
      expectedInverterId !== undefined &&
      assignment.inverterId !== expectedInverterId
    ) {
      throw new NotFoundException(SYS_MSG.NOT_FOUND);
    }

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
}

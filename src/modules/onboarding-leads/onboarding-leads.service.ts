import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ILike, FindOptionsWhere } from 'typeorm';
import { OnboardingLeadModelAction } from './actions/onboarding-lead.action';
import { CreateOnboardingLeadDto } from './dto/create-onboarding-lead.dto';
import { QueryOnboardingLeadsDto } from './dto/query-onboarding-leads.dto';
import { UpdateOnboardingLeadStatusDto } from './dto/update-onboarding-lead-status.dto';
import { OnboardingLead } from './entities/onboarding-lead.entity';
import { SYS_MSG } from '../../common/constants/sys-msg';
import { noTransaction } from '../../common/constants/transaction-options';

@Injectable()
export class OnboardingLeadsService {
  constructor(
    private readonly onboardingLeadAction: OnboardingLeadModelAction,
  ) {}

  async create(dto: CreateOnboardingLeadDto): Promise<OnboardingLead> {
    return this.onboardingLeadAction.create({
      ...noTransaction(),
      createPayload: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        state: dto.state,
        inverterType: dto.inverterType,
        interest: dto.interest,
        source: dto.source,
        ...(dto.message && { message: dto.message }),
      },
    });
  }

  async getSummary() {
    const repository = this.onboardingLeadAction['repository'];
    const result = await repository
      .createQueryBuilder('l')
      .select("COUNT(*)", 'total')
      .addSelect("COUNT(*) FILTER (WHERE l.status = 'new')", 'new')
      .addSelect("COUNT(*) FILTER (WHERE l.status = 'contacted')", 'contacted')
      .addSelect("COUNT(*) FILTER (WHERE l.status = 'qualified')", 'qualified')
      .addSelect("COUNT(*) FILTER (WHERE l.status = 'converted')", 'converted')
      .addSelect("COUNT(*) FILTER (WHERE l.status = 'closed')", 'closed')
      .where('l.deleted_at IS NULL')
      .getRawOne<Record<string, string>>();

    return {
      total: parseInt(result?.['total'] ?? '0', 10),
      new: parseInt(result?.['new'] ?? '0', 10),
      contacted: parseInt(result?.['contacted'] ?? '0', 10),
      qualified: parseInt(result?.['qualified'] ?? '0', 10),
      converted: parseInt(result?.['converted'] ?? '0', 10),
      closed: parseInt(result?.['closed'] ?? '0', 10),
    };
  }

  findAll(query: QueryOnboardingLeadsDto) {
    const where: FindOptionsWhere<OnboardingLead>[] = [];

    const base: FindOptionsWhere<OnboardingLead> = {
      ...(query.status && { status: query.status }),
      ...(query.interest && { interest: query.interest }),
      ...(query.source && { source: query.source }),
      ...(query.state && { state: query.state }),
      ...(query.inverterType && { inverterType: query.inverterType }),
    };

    if (query.search) {
      const term = query.search;
      where.push(
        { ...base, firstName: ILike(`%${term}%`) },
        { ...base, lastName: ILike(`%${term}%`) },
        { ...base, email: ILike(`%${term}%`) },
      );
    } else {
      where.push(base);
    }

    return this.onboardingLeadAction.list({
      filterRecordOptions: where,
      paginationPayload: {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<OnboardingLead> {
    const lead = await this.onboardingLeadAction.get({
      identifierOptions: { id },
    });
    if (!lead) throw new NotFoundException(SYS_MSG.NOT_FOUND);
    return lead;
  }

  async updateStatus(
    id: string,
    dto: UpdateOnboardingLeadStatusDto,
  ): Promise<OnboardingLead> {
    const lead = await this.findOne(id);
    const updated = await this.onboardingLeadAction.update({
      ...noTransaction(),
      identifierOptions: { id: lead.id },
      updatePayload: { status: dto.status },
    });
    if (!updated) throw new NotFoundException(SYS_MSG.NOT_FOUND);
    return updated;
  }
}

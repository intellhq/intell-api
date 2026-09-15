import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  FindOptionsWhere,
  ILike,
  MoreThanOrEqual,
  LessThanOrEqual,
  Between,
} from 'typeorm';
import { FeedbackModelAction } from './actions/feedback.action';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { QueryFeedbackDto } from './dto/query-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { FeedbackStatus } from '../../common/enums/feedback-status.enum';
import { SYS_MSG } from '../../common/constants/sys-msg';
import { noTransaction } from '../../common/constants/transaction-options';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackAction: FeedbackModelAction,
    private readonly usersService: UsersService,
  ) {}

  async create(
    dto: CreateFeedbackDto,
    currentUser: AuthenticatedUser,
    // userName: { firstName: string; lastName: string } | null,
  ): Promise<Feedback> {
    const user = await this.usersService.findByEmail(currentUser.email);
    if (!user) throw new UnauthorizedException(SYS_MSG.UNAUTHORIZED);
    const { firstName, lastName } = user;
    return this.feedbackAction.create({
      ...noTransaction(),
      createPayload: {
        userId: currentUser.sub,
        email: currentUser.email,
        name: `${firstName} ${lastName}`,
        category: dto.category,
        priority: dto.priority,
        message: dto.message,
      },
    });
  }

  async getSummary() {
    const repository = this.feedbackAction['repository'];
    const result = await repository
      .createQueryBuilder('f')
      .select('COUNT(*)', 'total')
      .addSelect("COUNT(*) FILTER (WHERE f.status = 'open')", 'open')
      .addSelect(
        "COUNT(*) FILTER (WHERE f.status = 'in_progress')",
        'inProgress',
      )
      .addSelect("COUNT(*) FILTER (WHERE f.status = 'resolved')", 'resolved')
      .addSelect("COUNT(*) FILTER (WHERE f.priority = 'high')", 'highPriority')
      .where('f.deleted_at IS NULL')
      .getRawOne<Record<string, string>>();

    return {
      total: parseInt(result?.['total'] ?? '0', 10),
      open: parseInt(result?.['open'] ?? '0', 10),
      inProgress: parseInt(result?.['inProgress'] ?? '0', 10),
      resolved: parseInt(result?.['resolved'] ?? '0', 10),
      highPriority: parseInt(result?.['highPriority'] ?? '0', 10),
    };
  }

  findAll(query: QueryFeedbackDto) {
    const where: FindOptionsWhere<Feedback>[] = [];

    const base: FindOptionsWhere<Feedback> = {
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
      ...(query.category && { category: ILike(`%${query.category}%`) }),
      ...(query.startDate &&
        query.endDate && {
          createdAt: Between(
            new Date(query.startDate),
            new Date(query.endDate),
          ),
        }),
      ...(query.startDate &&
        !query.endDate && {
          createdAt: MoreThanOrEqual(new Date(query.startDate)),
        }),
      ...(!query.startDate &&
        query.endDate && {
          createdAt: LessThanOrEqual(new Date(query.endDate)),
        }),
    };

    if (query.search) {
      const term = query.search;

      where.push({ ...base, name: ILike(`%${term}%`) }, {
        ...base,
        email: ILike(`%${term}%`),
      });
      if (!query.category) {
        where.push({ ...base, category: ILike(`%${term}%`) });
      }
    } else {
      where.push(base);
    }

    return this.feedbackAction.list({
      filterRecordOptions: where,
      paginationPayload: {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Feedback> {
    const feedback = await this.feedbackAction.get({
      identifierOptions: { id },
    });
    if (!feedback) throw new NotFoundException(SYS_MSG.NOT_FOUND);
    return feedback;
  }

  async update(
    id: string,
    dto: UpdateFeedbackDto,
    adminId: string,
  ): Promise<Feedback> {
    const feedback = await this.findOne(id);

    const transitioningToResolved =
      dto.status === FeedbackStatus.RESOLVED &&
      feedback.status !== FeedbackStatus.RESOLVED;

    const transitioningFromResolved =
      dto.status !== undefined &&
      dto.status !== FeedbackStatus.RESOLVED &&
      feedback.status === FeedbackStatus.RESOLVED;

    const updated = await this.feedbackAction.update({
      ...noTransaction(),
      identifierOptions: { id: feedback.id },
      updatePayload: {
        ...(dto.status && { status: dto.status }),
        ...(dto.priority && { priority: dto.priority }),
        ...(dto.adminNote !== undefined && { adminNote: dto.adminNote }),
        ...(transitioningToResolved && {
          resolvedAt: new Date(),
        ...(transitioningFromResolved && {
          resolvedAt: null,
          resolvedByAdminId: null,
        }),
          resolvedByAdminId: undefined,
        }),
      },
    });
    if (!updated) throw new NotFoundException(SYS_MSG.NOT_FOUND);
    return updated;
  }
}

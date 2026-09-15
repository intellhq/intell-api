import { AbstractModelAction } from '@hng-sdk/orm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { SubscriptionPlan } from '../../../common/enums/subscription-plan.enum';
import { SubscriptionStatus } from '../../../common/enums/subscription-status.enum';

@Injectable()
export class SubscriptionModelAction extends AbstractModelAction<Subscription> {
  constructor(
    @InjectRepository(Subscription) repository: Repository<Subscription>,
  ) {
    super(repository, Subscription);
  }

  getCurrentSubscription(userId: string): Promise<Subscription | null> {
    return this.repository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      order: { startedAt: 'DESC' },
    });
  }

  async getPlanCounts(): Promise<{ free: number; paid: number }> {
    const now = new Date();
    const rows = await this.repository
      .createQueryBuilder('s')
      .select('s.user_id', 'userId')
      .addSelect('s.plan', 'plan')
      .where('s.status = :status', { status: SubscriptionStatus.ACTIVE })
      .andWhere('s.deleted_at IS NULL')
      .andWhere('(s.expires_at IS NULL OR s.expires_at > :now)', { now })
      .distinctOn(['s.user_id'])
      .orderBy('s.user_id')
      .addOrderBy('s.started_at', 'DESC')
      .getRawMany<{ userId: string; plan: SubscriptionPlan }>();

    let free = 0;
    let paid = 0;
    for (const row of rows) {
      if (row.plan === SubscriptionPlan.FREE) {
        free++;
      } else {
        paid++;
      }
    }
    return { free, paid };
  }
}

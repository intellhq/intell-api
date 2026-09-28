import { AbstractModelAction } from '@hng-sdk/orm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { SubscriptionPlan } from '../../../common/enums/subscription-plan.enum';
import { SubscriptionStatus } from '../../../common/enums/subscription-status.enum';
import { ChartPeriod } from '../../super-admin/dto/users-chart-query.dto';

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

  /**
   * Returns free vs paid user counts bucketed by the requested period.
   *
   * Strategy:
   *   1. CTE `latest` — for each (user_id, time_bucket) pair, pick the row
   *      with the latest started_at so we get one plan per user per bucket.
   *   2. Outer query — count free vs paid per bucket label.
   *
   * The label format matches what the frontend chart expects:
   *   weekly  → "2026-W38"
   *   monthly → "Sep 2026"
   *   yearly  → "2026"
   */
  async getPlanCountsByPeriod(
    period: ChartPeriod,
    startDate?: string,
    endDate?: string,
  ): Promise<Array<{ label: string; free: number; paid: number }>> {
    // Choose the DATE_TRUNC precision and the TO_CHAR format for the label
    const truncMap: Record<ChartPeriod, string> = {
      [ChartPeriod.WEEKLY]: 'week',
      [ChartPeriod.MONTHLY]: 'month',
      [ChartPeriod.YEARLY]: 'year',
    };
    const labelMap: Record<ChartPeriod, string> = {
      [ChartPeriod.WEEKLY]: `'IYYY-"W"IW'`,
      [ChartPeriod.MONTHLY]: `'Mon YYYY'`,
      [ChartPeriod.YEARLY]: `'YYYY'`,
    };
    const trunc = truncMap[period];
    const labelFmt = labelMap[period];

    const now = new Date();

    // Build the inner CTE via raw SQL — TypeORM's QB doesn't support CTEs
    // natively, so we use a single raw query with a subquery instead.
    const params: (string | Date)[] = [SubscriptionStatus.ACTIVE, now];
    let dateFilter = '';

    if (startDate) {
      params.push(new Date(startDate));
      dateFilter += ` AND s.started_at >= $${params.length}`;
    }
    if (endDate) {
      // Make endDate inclusive by going to end of that day in UTC,
      // matching how DATE_TRUNC operates on the stored timestamptz values.
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      params.push(end);
      dateFilter += ` AND s.started_at <= $${params.length}`;
    }

    const sql = `
      SELECT
        TO_CHAR(DATE_TRUNC('${trunc}', bucket), ${labelFmt}) AS label,
        COUNT(*) FILTER (WHERE plan = 'free')::int             AS free,
        COUNT(*) FILTER (WHERE plan != 'free')::int            AS paid
      FROM (
        SELECT DISTINCT ON (user_id, DATE_TRUNC('${trunc}', started_at))
          user_id,
          plan,
          DATE_TRUNC('${trunc}', started_at) AS bucket
        FROM subscriptions s
        WHERE
          status = $1
          AND deleted_at IS NULL
          AND (expires_at IS NULL OR expires_at > $2)
          ${dateFilter}
        ORDER BY user_id, DATE_TRUNC('${trunc}', started_at), started_at DESC
      ) latest
      GROUP BY bucket
      ORDER BY bucket ASC
    `;

    type ChartRow = { label: string; free: number; paid: number };
    const rows = (await this.repository.query(
      sql,
      params,
    )) as unknown as ChartRow[];

    return rows.map((r) => ({
      label: r.label,
      free: Number(r.free),
      paid: Number(r.paid),
    }));
  }
}

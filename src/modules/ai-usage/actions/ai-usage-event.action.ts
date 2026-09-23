import { AbstractModelAction } from '@hng-sdk/orm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiUsageEvent } from '../entities/ai-usage-event.entity';

export interface TokenSummary {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface TokenChartPoint {
  label: string;
  inputTokens: number;
  outputTokens: number;
}

@Injectable()
export class AiUsageEventModelAction extends AbstractModelAction<AiUsageEvent> {
  constructor(
    @InjectRepository(AiUsageEvent)
    repository: Repository<AiUsageEvent>,
  ) {
    super(repository, AiUsageEvent);
  }

  /**
   * Returns lifetime token totals across all users and all event types.
   * Used by GET /super-admin/dashboard/summary → aiUsage.
   */
  async getGlobalTokenSummary(): Promise<TokenSummary> {
    const result = await this.repository
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.input_tokens), 0)', 'inputTokens')
      .addSelect('COALESCE(SUM(e.output_tokens), 0)', 'outputTokens')
      .addSelect('COALESCE(SUM(e.total_tokens), 0)', 'totalTokens')
      .where('e.deleted_at IS NULL')
      .getRawOne<Record<string, string>>();

    return {
      inputTokens: parseInt(result?.['inputTokens'] ?? '0', 10),
      outputTokens: parseInt(result?.['outputTokens'] ?? '0', 10),
      totalTokens: parseInt(result?.['totalTokens'] ?? '0', 10),
    };
  }

  /**
   * Returns input/output token totals bucketed by period.
   * Used by GET /super-admin/dashboard/ai-usage-chart.
   *
   * Label formats match the users-chart convention:
   *   weekly  → "2026-W38"
   *   monthly → "Sep 2026"
   *   yearly  → "2026"
   */
  async getTokenCountsByPeriod(
    trunc: 'week' | 'month' | 'year',
    labelFmt: string,
    startDate?: string,
    endDate?: string,
  ): Promise<TokenChartPoint[]> {
    const now = new Date();
    const params: (string | Date)[] = [now];
    let dateFilter = '';

    if (startDate) {
      params.push(new Date(startDate));
      dateFilter += ` AND e.created_at >= $${params.length}`;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      params.push(end);
      dateFilter += ` AND e.created_at <= $${params.length}`;
    }

    const sql = `
      SELECT
        TO_CHAR(DATE_TRUNC('${trunc}', e.created_at), ${labelFmt}) AS label,
        COALESCE(SUM(e.input_tokens), 0)                      AS "inputTokens",
        COALESCE(SUM(e.output_tokens), 0)                     AS "outputTokens"
      FROM ai_usage_events e
      WHERE
        e.deleted_at IS NULL
        AND e.created_at <= $1
        ${dateFilter}
      GROUP BY DATE_TRUNC('${trunc}', e.created_at)
      ORDER BY DATE_TRUNC('${trunc}', e.created_at) ASC
    `;

    type Row = { label: string; inputTokens: number; outputTokens: number };
    const rows = (await this.repository.query(sql, params)) as unknown as Row[];

    return rows.map((r) => ({
      label: r.label,
      inputTokens: Number(r.inputTokens),
      outputTokens: Number(r.outputTokens),
    }));
  }
}

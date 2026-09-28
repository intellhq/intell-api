import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ChartPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class UsersChartQueryDto {
  @ApiPropertyOptional({
    enum: ChartPeriod,
    default: ChartPeriod.MONTHLY,
    description: 'Bucket granularity for the chart data points',
  })
  @IsOptional()
  @IsEnum(ChartPeriod)
  period?: ChartPeriod = ChartPeriod.MONTHLY;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Inclusive start date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Inclusive end date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

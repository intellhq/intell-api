import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.do';
import { OnboardingLeadStatus } from '../../../common/enums/onboarding-lead-status.enum';

export class QueryOnboardingLeadsDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: OnboardingLeadStatus })
  @IsOptional()
  @IsEnum(OnboardingLeadStatus)
  status?: OnboardingLeadStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  interest?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inverterType?: string;
}

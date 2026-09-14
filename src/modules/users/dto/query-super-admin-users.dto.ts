import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.do';

export enum UserPlanFilter {
  FREE = 'free',
  PLUS = 'plus',
  PRO = 'pro',
}

export enum UserStatusFilter {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

export class QuerySuperAdminUsersDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: UserPlanFilter })
  @IsOptional()
  @IsEnum(UserPlanFilter)
  plan?: UserPlanFilter;

  @ApiPropertyOptional({ enum: UserStatusFilter })
  @IsOptional()
  @IsEnum(UserStatusFilter)
  status?: UserStatusFilter;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;
}

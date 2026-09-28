import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.do';
import { UserRole } from '../../../common/enums';
import { AdminStatus } from '../../../common/enums/admin-status.enum';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN] as const;

export class QueryAdminUsersDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ADMIN_ROLES })
  @IsOptional()
  @IsIn(ADMIN_ROLES)
  role?: UserRole.ADMIN | UserRole.SUPER_ADMIN;

  @ApiPropertyOptional({ enum: AdminStatus })
  @IsOptional()
  @IsEnum(AdminStatus)
  status?: AdminStatus;
}

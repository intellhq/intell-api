import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.do';
import { UserRole } from '../../../common/enums';
import { AdminStatus } from '../../../common/enums/admin-status.enum';

export class QueryAdminUsersDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole.ADMIN | UserRole.SUPER_ADMIN;

  @ApiPropertyOptional({ enum: AdminStatus })
  @IsOptional()
  @IsEnum(AdminStatus)
  status?: AdminStatus;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '../../../common/enums';

export class UpdateAdminRoleDto {
  @ApiProperty({ enum: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })
  @IsEnum(UserRole)
  role: UserRole.ADMIN | UserRole.SUPER_ADMIN;
}

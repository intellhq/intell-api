import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../../../common/enums';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN] as const;

export class CreateAdminDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  lastName: string;

  @ApiProperty({ example: 'jane@intell.africa' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ enum: ADMIN_ROLES, default: UserRole.ADMIN })
  @IsIn(ADMIN_ROLES)
  role: UserRole.ADMIN | UserRole.SUPER_ADMIN;
}

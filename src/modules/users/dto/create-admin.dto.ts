import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../../../common/enums';

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

  @ApiProperty({ enum: [UserRole.ADMIN, UserRole.SUPER_ADMIN], default: UserRole.ADMIN })
  @IsEnum(UserRole)
  role: UserRole.ADMIN | UserRole.SUPER_ADMIN;
}

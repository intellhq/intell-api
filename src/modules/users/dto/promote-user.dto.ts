import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';
import { IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class PromoteUserDto {
  @ApiProperty({ example: UserRole.INSTALLER })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return false;
    if (typeof value === 'string') return value.toLowerCase();
    return false;
  })
  @IsEnum(UserRole)
  role: UserRole;
}

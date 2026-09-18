import { ApiProperty } from '@nestjs/swagger';
import { InstallerStatus } from '../../../common/enums';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateInstallerStatusDto {
  @ApiProperty({ example: InstallerStatus.ACTIVE })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return false;
    if (typeof value === 'string') return value.toLowerCase();
    return false;
  })
  @IsEnum(InstallerStatus)
  status: InstallerStatus;

  @ApiProperty({ example: 'No longer active' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  reason?: string;
}

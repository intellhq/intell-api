import { ApiProperty } from '@nestjs/swagger';
import {
  InstallerStatus,
  InstallerType,
  InverterBrand,
} from '../../../common/enums';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryInstallersDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ example: 'Badmus' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  search?: string;

  @ApiProperty({ example: InstallerType.PARTNER })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return false;
    if (typeof value === 'string') return value.toLowerCase();
    return false;
  })
  @IsEnum(InstallerType)
  type?: InstallerType;

  @ApiProperty({ example: InstallerStatus.ACTIVE })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return false;
    if (typeof value === 'string') return value.toLowerCase();
    return false;
  })
  @IsEnum(InstallerStatus)
  status?: InstallerStatus;

  @ApiProperty({ example: 'Lagos' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  state?: string;

  @ApiProperty({ example: 'VICTRON' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return false;
    if (typeof value === 'string') return value.toUpperCase();
    return false;
  })
  @IsEnum(InverterBrand)
  brand?: InverterBrand;
}

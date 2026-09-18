import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { InstallerType, InverterBrand } from '../../../common/enums';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export class CreateInstallerProfileDto {
  @ApiProperty({ example: randomUUID() })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: InstallerType.PARTNER })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return false;
    if (typeof value === 'string') return value.toLowerCase();
    return false;
  })
  @IsEnum(InstallerType)
  type: InstallerType;

  @ApiProperty({ example: 'Intell' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  companyName?: string;

  @ApiProperty({ example: 'Habibat' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  contactName: string;

  @ApiProperty({ example: 'Habibat@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+23419052026' })
  @IsOptional()
  @IsPhoneNumber()
  @MinLength(1)
  @MaxLength(20)
  phoneNumber?: string;

  @ApiProperty({ example: 'Lagos' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(45)
  state?: string;

  @ApiProperty({ example: 'Ikorodu' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(45)
  region?: string;

  @ApiProperty({
    example: [InverterBrand.VICTRON],
    enum: InverterBrand,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(InverterBrand, { each: true })
  supportedBrands?: InverterBrand[];

  @ApiProperty({ example: 'Ikorodu' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  notes?: string;
}

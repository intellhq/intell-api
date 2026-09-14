import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const VALID_SOURCES = [
  'LinkedIn',
  'Instagram',
  'Twitter (X)',
  'Google',
  'WhatsApp',
  'Friends or colleagues',
  'Installer referral',
] as const;

const VALID_INTERESTS = [
  'home',
  'business',
  'multi-site',
  'installer partner',
  'demo',
] as const;

export class CreateOnboardingLeadDto {
  @ApiProperty({ example: 'Blessing' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  firstName: string;

  @ApiProperty({ example: 'Adeyemi' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  lastName: string;

  @ApiProperty({ example: 'blessing@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: '+2348109001188' })
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  phoneNumber: string;

  @ApiProperty({ example: 'Lagos' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  state: string;

  @ApiProperty({ example: 'Deye hybrid inverter' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  inverterType: string;

  @ApiProperty({ example: 'home', enum: VALID_INTERESTS })
  @IsIn(VALID_INTERESTS)
  interest: string;

  @ApiProperty({ example: 'Instagram', enum: VALID_SOURCES })
  @IsIn(VALID_SOURCES)
  source: string;

  @ApiPropertyOptional({ example: 'I want to track battery drain and savings.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}

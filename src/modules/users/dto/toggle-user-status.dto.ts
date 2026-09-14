import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum UserActiveStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class ToggleUserStatusDto {
  @ApiProperty({ enum: UserActiveStatus })
  @IsEnum(UserActiveStatus)
  status: UserActiveStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

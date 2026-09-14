import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AdminStatus } from '../../../common/enums/admin-status.enum';

export class UpdateAdminStatusDto {
  @ApiProperty({ enum: AdminStatus })
  @IsEnum(AdminStatus)
  status: AdminStatus;
}

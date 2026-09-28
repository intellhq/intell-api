import { IsEnum, IsUUID } from 'class-validator';
import { AssignmentRole } from '../../../common/enums';
import { Transform } from 'class-transformer';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';

export class CreateAssignmentDto {
  @ApiProperty({ example: randomUUID() })
  @IsUUID()
  inverterId: string;

  @ApiProperty({ example: randomUUID() })
  @IsUUID()
  installerProfileId: string;

  @ApiProperty({ example: AssignmentRole.TECHNICIAN })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return false;
    if (typeof value === 'string') return value.toLowerCase();
    return false;
  })
  @IsEnum(AssignmentRole)
  role: AssignmentRole;
}

/**
 * Body DTO for POST /installers/:id/assignments.
 * inverterId is supplied by the route parameter, not the request body,
 * so it is excluded here to keep Swagger and validation accurate.
 */
export class CreateAssignmentBodyDto extends OmitType(CreateAssignmentDto, [
  'inverterId',
] as const) {}

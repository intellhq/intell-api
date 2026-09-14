import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OnboardingLeadStatus } from '../../../common/enums/onboarding-lead-status.enum';

export class UpdateOnboardingLeadStatusDto {
  @ApiProperty({ enum: OnboardingLeadStatus })
  @IsEnum(OnboardingLeadStatus)
  status: OnboardingLeadStatus;
}

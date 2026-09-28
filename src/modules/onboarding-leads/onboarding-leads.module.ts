import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingLeadsController } from './onboarding-leads.controller';
import { OnboardingLeadsService } from './onboarding-leads.service';
import { OnboardingLeadModelAction } from './actions/onboarding-lead.action';
import { OnboardingLead } from './entities/onboarding-lead.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OnboardingLead])],
  controllers: [OnboardingLeadsController],
  providers: [OnboardingLeadsService, OnboardingLeadModelAction],
  exports: [OnboardingLeadsService, OnboardingLeadModelAction],
})
export class OnboardingLeadsModule {}

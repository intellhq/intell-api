import { AbstractModelAction } from '@hng-sdk/orm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingLead } from '../entities/onboarding-lead.entity';

@Injectable()
export class OnboardingLeadModelAction extends AbstractModelAction<OnboardingLead> {
  constructor(
    @InjectRepository(OnboardingLead) repository: Repository<OnboardingLead>,
  ) {
    super(repository, OnboardingLead);
  }
}

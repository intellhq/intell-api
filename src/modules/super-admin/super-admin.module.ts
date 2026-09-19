import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminAction } from './actions/super-admin.action';
import { User } from '../users/entities/user.entity';
import { FeedbackModule } from '../feedback/feedback.module';
import { OnboardingLeadsModule } from '../onboarding-leads/onboarding-leads.module';
import { UsersModule } from '../users/users.module';
import { InstallersModule } from '../installers/installers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    FeedbackModule,
    OnboardingLeadsModule,
    UsersModule,
    InstallersModule,
  ],
  providers: [SuperAdminService, SuperAdminAction],
  controllers: [SuperAdminController],
})
export class SuperAdminModule {}

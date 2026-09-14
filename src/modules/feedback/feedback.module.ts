import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { FeedbackModelAction } from './actions/feedback.action';
import { Feedback } from './entities/feedback.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback]), UsersModule],
  controllers: [FeedbackController],
  providers: [FeedbackService, FeedbackModelAction],
  exports: [FeedbackService, FeedbackModelAction],
})
export class FeedbackModule {}

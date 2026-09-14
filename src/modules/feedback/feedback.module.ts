import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { FeedbackModelAction } from './actions/feedback.action';
import { Feedback } from './entities/feedback.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback])],
  controllers: [FeedbackController],
  providers: [FeedbackService, FeedbackModelAction],
  exports: [FeedbackService, FeedbackModelAction],
})
export class FeedbackModule {}

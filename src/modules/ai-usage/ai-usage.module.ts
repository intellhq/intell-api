import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiUsageEvent } from './entities/ai-usage-event.entity';
import { AiUsageEventModelAction } from './actions/ai-usage-event.action';

@Module({
  imports: [TypeOrmModule.forFeature([AiUsageEvent])],
  providers: [AiUsageEventModelAction],
  exports: [AiUsageEventModelAction],
})
export class AiUsageModule {}

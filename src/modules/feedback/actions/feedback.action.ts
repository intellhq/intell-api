import { AbstractModelAction } from '@hng-sdk/orm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../entities/feedback.entity';

@Injectable()
export class FeedbackModelAction extends AbstractModelAction<Feedback> {
  constructor(
    @InjectRepository(Feedback) repository: Repository<Feedback>,
  ) {
    super(repository, Feedback);
  }
}

import { AbstractModelAction } from '@hng-sdk/orm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InverterAssignment } from '../entities/inverter-assignment.entity';

@Injectable()
export class InverterAssignmentModelAction extends AbstractModelAction<InverterAssignment> {
  constructor(
    @InjectRepository(InverterAssignment)
    repository: Repository<InverterAssignment>,
  ) {
    super(repository, InverterAssignment);
  }
}

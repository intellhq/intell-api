import { AbstractModelAction } from '@hng-sdk/orm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstallerProfile } from '../entities/installer_profiles.entity';

@Injectable()
export class InstallerProfileModelAction extends AbstractModelAction<InstallerProfile> {
  constructor(
    @InjectRepository(InstallerProfile)
    repository: Repository<InstallerProfile>,
  ) {
    super(repository, InstallerProfile);
  }
}

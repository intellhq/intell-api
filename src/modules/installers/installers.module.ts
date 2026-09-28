import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallerProfile } from './entities/installer_profiles.entity';
import { InverterAssignment } from './entities/inverter-assignment.entity';
import { InstallerProfileModelAction } from './actions/installer-profile.action';
import { InverterAssignmentModelAction } from './actions/inverter-assignment.action';
import { InstallersService } from './installers.service';
import { InstallersController } from './installers.controller';
import { InvertersModule } from '../inverters/inverters.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InstallerProfile, InverterAssignment]),
    InvertersModule,
    UsersModule,
  ],
  providers: [
    InstallerProfileModelAction,
    InverterAssignmentModelAction,
    InstallersService,
  ],
  exports: [
    InstallersService,
    InstallerProfileModelAction,
    InverterAssignmentModelAction,
  ],
  controllers: [InstallersController],
})
export class InstallersModule {}

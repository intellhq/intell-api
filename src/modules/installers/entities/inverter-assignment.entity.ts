import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/abstract-base.entity';
import { AssignmentRole } from '../../../common/enums/assignment-role.enum';
import { AssignmentStatus } from '../../../common/enums/assignment-status.enum';
import { Inverter } from '../../inverters/entities/inverters.entity';
import { User } from '../../users/entities/user.entity';
import { InstallerProfile } from './installer_profiles.entity';

@Entity('inverter_assignments')
@Index(['inverterId', 'installerProfileId'], {
  unique: true,
  where: `"status" = 'active'`,
})
@Index(['installerProfileId', 'status'])
@Index(['inverterId', 'status'])
export class InverterAssignment extends AbstractBaseEntity {
  @Column({ type: 'uuid' })
  inverterId: string;

  @Column({ type: 'uuid' })
  installerProfileId: string;

  @Column({ type: 'uuid' })
  assignedByUserId: string;

  @Column({
    type: 'enum',
    enum: AssignmentRole,
    default: AssignmentRole.TECHNICIAN,
  })
  role: AssignmentRole;

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.ACTIVE,
  })
  status: AssignmentStatus;

  @Column({ type: 'timestamptz' })
  assignedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @ManyToOne(() => Inverter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inverter_id' })
  inverter: Inverter;

  @ManyToOne(() => InstallerProfile, (profile) => profile.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'installer_profile_id' })
  installerProfile: InstallerProfile;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_by_user_id' })
  assignedBy: User;
}

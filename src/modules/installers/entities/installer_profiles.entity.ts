import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/abstract-base.entity';
import { InstallerType } from '../../../common/enums/installer-type.enum';
import { InstallerStatus } from '../../../common/enums/installer-status.enum';
import { InverterBrand } from '../../../common/enums/inverter-brand.enum';
import { User } from '../../users/entities/user.entity';
import { InverterAssignment } from './inverter-assignment.entity';

@Entity('installer_profiles')
@Index(['userId'], { unique: true })
@Index(['email'])
@Index(['status'])
export class InstallerProfile extends AbstractBaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: InstallerType })
  type: InstallerType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  companyName: string | null;

  @Column({ type: 'varchar', length: 255 })
  contactName: string;

  @Column({ type: 'citext' })
  email: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region: string | null;

  @Column({ type: 'text', array: true, default: '{}' })
  supportedBrands: InverterBrand[];

  @Column({
    type: 'enum',
    enum: InstallerStatus,
    default: InstallerStatus.PENDING,
  })
  status: InstallerStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(
    () => InverterAssignment,
    (assignment) => assignment.installerProfile,
  )
  assignments: InverterAssignment[];
}

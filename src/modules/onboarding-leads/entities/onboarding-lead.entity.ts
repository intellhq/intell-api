import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/abstract-base.entity';
import { OnboardingLeadStatus } from '../../../common/enums/onboarding-lead-status.enum';
import { User } from '../../users/entities/user.entity';

@Entity('onboarding_leads')
@Index(['email'])
@Index(['status'])
export class OnboardingLead extends AbstractBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'citext' })
  email: string;

  @Column({ type: 'varchar', length: 30 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 255 })
  inverterType: string;

  @Column({ type: 'varchar', length: 255 })
  interest: string;

  @Column({ type: 'varchar', length: 100 })
  source: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({
    type: 'enum',
    enum: OnboardingLeadStatus,
    default: OnboardingLeadStatus.NEW,
  })
  status: OnboardingLeadStatus;

  @Column({ type: 'uuid', nullable: true })
  assignedAdminId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_admin_id' })
  assignedAdmin?: User;
}

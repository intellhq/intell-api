import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/abstract-base.entity';
import { SubscriptionPlan } from '../../../common/enums/subscription-plan.enum';
import { SubscriptionStatus } from '../../../common/enums/subscription-status.enum';
import { User } from './user.entity';

@Entity('subscriptions')
@Index(['userId', 'status'])
@Index(['userId', 'plan'])
export class Subscription extends AbstractBaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  plan: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentRef: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  provider: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

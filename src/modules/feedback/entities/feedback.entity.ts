import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/abstract-base.entity';
import { FeedbackStatus } from '../../../common/enums/feedback-status.enum';
import { FeedbackPriority } from '../../../common/enums/feedback-priority.enum';
import { User } from '../../users/entities/user.entity';

@Entity('feedback')
@Index(['status'])
@Index(['priority'])
export class Feedback extends AbstractBaseEntity {
  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'citext', nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({
    type: 'enum',
    enum: FeedbackPriority,
    default: FeedbackPriority.MEDIUM,
  })
  priority: FeedbackPriority;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: FeedbackStatus,
    default: FeedbackStatus.OPEN,
  })
  status: FeedbackStatus;

  @Column({ type: 'text', nullable: true })
  adminNote?: string;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt?: Date | null;

  @Column({ type: 'uuid', nullable: true })
  resolvedByAdminId?: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resolved_by_admin_id' })
  resolvedByAdmin?: User;
}

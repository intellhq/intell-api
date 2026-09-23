import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/abstract-base.entity';
import { AiUsageEventType } from '../../../common/enums/ai-usage-event-type.enum';
import { User } from '../../users/entities/user.entity';
import { Chat } from '../../chatbot/entities/chat.entity';

/**
 * Immutable audit record of a single LLM API call.
 *
 * One row is written per call — not per session or per chat.
 * The ReAct agent may make multiple model round-trips per user message
 * (tool calls, reflection steps), so a single user message can produce
 * more than one row.  Aggregate at query time with SUM() as needed.
 *
 * updatedAt and deletedAt are inherited from AbstractBaseEntity but are
 * intentionally never set — rows are written once and never modified.
 */
@Entity('ai_usage_events')
@Index(['userId', 'createdAt'])  // per-user time-series queries
@Index(['createdAt'])            // global aggregate queries
export class AiUsageEvent extends AbstractBaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  /**
   * The chat that triggered this call, if applicable.
   * Null for calls that happen outside a chat context (none currently,
   * but kept nullable to avoid a hard FK failure if a chat is deleted
   * before the event is written).
   */
  @Column({ type: 'uuid', nullable: true })
  chatId: string | null;

  @Column({ type: 'enum', enum: AiUsageEventType })
  eventType: AiUsageEventType;

  /** Tokens in the prompt / input sent to the model */
  @Column({ type: 'int', default: 0 })
  inputTokens: number;

  /** Tokens in the model's response / output */
  @Column({ type: 'int', default: 0 })
  outputTokens: number;

  /** inputTokens + outputTokens (stored for cheap SUM queries) */
  @Column({ type: 'int', default: 0 })
  totalTokens: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Chat, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat | null;
}

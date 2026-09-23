export enum AiUsageEventType {
  /** Main agent call triggered by a user chat message */
  CHAT_MESSAGE = 'chat_message',
  /** Short LLM call that generates a chat title from the first message */
  TITLE_GENERATION = 'title_generation',
  /** Structured-output call that generates insight cards after a response */
  CARD_GENERATION = 'card_generation',
}

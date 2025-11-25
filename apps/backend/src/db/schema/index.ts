import { pgTable, text, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import type { MessageContent } from '@repo/shared/types';

export const chatPrivacyEnum = pgEnum('chat_privacy', [
  'private',
  'unlisted',
  'public',
]);

/**
 * Chats table - Simplified without user authentication
 */
export const chats = pgTable('chats', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  privacy: chatPrivacyEnum('privacy').default('private').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant']);

/**
 * Messages table
 * Content now stores complete message parts (text, reasoning, tool-calls, files) as JSONB
 */
export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  chatId: text('chat_id')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),
  role: messageRoleEnum('role').notNull(),
  content: jsonb('content').$type<MessageContent>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

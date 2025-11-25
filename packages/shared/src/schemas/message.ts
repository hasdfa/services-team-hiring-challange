import { z } from 'zod';

export const messageRoleSchema = z.enum(['user', 'assistant']);

// Part type schemas
export const textPartSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
});

export const reasoningPartSchema = z.object({
  type: z.literal('reasoning'),
  text: z.string(),
});

export const toolCallPartSchema = z.object({
  type: z.literal('tool-call'),
  toolCallId: z.string(),
  toolName: z.string(),
  args: z.record(z.string(), z.unknown()),
  result: z.string().optional(),
  error: z.string().optional(),
});

export const filePartSchema = z.object({
  type: z.literal('file'),
  filePath: z.string(),
  content: z.string(),
});

export const messagePartSchema = z.discriminatedUnion('type', [
  textPartSchema,
  reasoningPartSchema,
  toolCallPartSchema,
  filePartSchema,
]);

// New format only (no legacy support)
export const messageContentSchema = z.object({
  parts: z.array(messagePartSchema),
});

export const messageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  role: messageRoleSchema,
  content: messageContentSchema,
  createdAt: z.iso.datetime(),
});

export const messageCreateSchema = z.object({
  chatId: z.string(),
  role: z.literal('user'),
  content: z.string(),
  options: z
    .object({
      reasoningEffort: z
        .enum(['low', 'medium', 'high'])
        .optional()
        .default('low'),
    })
    .optional(),
});

// Export types
export type MessageRole = z.infer<typeof messageRoleSchema>;
export type TextPart = z.infer<typeof textPartSchema>;
export type ReasoningPart = z.infer<typeof reasoningPartSchema>;
export type ToolCallPart = z.infer<typeof toolCallPartSchema>;
export type FilePart = z.infer<typeof filePartSchema>;
export type MessagePart = z.infer<typeof messagePartSchema>;
export type MessageContent = z.infer<typeof messageContentSchema>;
export type Message = z.infer<typeof messageSchema>;
export type MessageCreate = z.infer<typeof messageCreateSchema>;

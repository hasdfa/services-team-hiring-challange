import { z } from 'zod';

export const chatPrivacySchema = z.enum(['private', 'unlisted', 'public']);

export const chatSchema = z.object({
  id: z.string(),
  title: z.string(),
  privacy: chatPrivacySchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const chatCreateSchema = z.object({
  title: z.string().min(1).max(200),
  privacy: chatPrivacySchema.default('private'),
});

export const chatUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  privacy: chatPrivacySchema.optional(),
});

export type ChatPrivacy = z.infer<typeof chatPrivacySchema>;
export type Chat = z.infer<typeof chatSchema>;
export type ChatCreate = z.infer<typeof chatCreateSchema>;
export type ChatUpdate = z.infer<typeof chatUpdateSchema>;

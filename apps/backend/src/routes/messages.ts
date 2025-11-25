import type z from 'zod';
import { and, eq, desc, isNotNull, not } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { chats, chatMessages as messages } from '../db/schema/index.js';
import { ResponseError } from '../lib/errors.js';
import { messageCreateSchema } from '@repo/shared/schemas';
import type { FastifyInstance } from 'fastify';
import * as muiAssistant from '../ai/agents/mui-assistant/index.js';
import { createUIMessageStreamResponse } from 'ai';
import { buildPartsFromStreamResult } from '../db/utils/message-transforms.js';

// const llmChatSchema = z.object({
//   chatId: z.string(),
//   message: z.string().min(1),
//   reasoningEffort: z.enum(['low', 'medium', 'high']).optional().default('low'),
// });

export default async function messagesRoutes(fastify: FastifyInstance) {
  // Get messages for a chat
  fastify.get<{ Params: { chatId: string } }>(
    '/chat/:chatId',
    async (request) => {
      const { chatId } = request.params;

      // Simple query - all data is in the message content JSONB
      const messagesList = await db
        .select()
        .from(messages)
        .where(eq(messages.chatId, chatId))
        .orderBy(desc(messages.createdAt));

      return { ok: true, data: messagesList };
    }
  );

  // Send a message
  fastify.post<{ Body: z.infer<typeof messageCreateSchema> }>(
    '/send',
    {
      schema: {
        body: messageCreateSchema,
      },
    },
    async (request) => {
      const { chatId, role, content: rawContent, options } = request.body;

      // Verify chat exists
      const chat = await db.query.chats.findFirst({
        where: eq(chats.id, chatId),
      });

      if (!chat) {
        throw new ResponseError('Chat not found', 404);
      }

      // User messages are stored with a simple text part
      const content = {
        parts: [
          {
            type: 'text' as const,
            text: rawContent,
          },
        ],
      };

      const messageId = nanoid();
      const [newMessage] = await db
        .insert(messages)
        .values({
          id: messageId,
          chatId,
          role,
          content,
        })
        .returning();

      const last10Messages = await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.chatId, chatId),
            isNotNull(messages.content),
            not(eq(messages.id, newMessage.id))
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(10);

      const { stream } = await muiAssistant.generateResponse(
        [
          ...last10Messages
            .map((message) => {
              // Extract text from parts for LLM context
              const textPart = message.content.parts.find(
                (p) => p.type === 'text'
              );
              return {
                role: message.role as 'user' | 'assistant',
                content: textPart?.text || '',
              };
            })
            .reverse(),
          {
            role: 'user',
            content: rawContent,
          },
        ],
        options,
        {
          onFinish: async (result, generatedFiles) => {
            try {
              const assistantMessageId = nanoid();

              // Extract all parts from streaming result
              const parts = await buildPartsFromStreamResult(
                result,
                generatedFiles
              );

              // Save message with complete parts array (no files table insert)
              await db.insert(messages).values({
                id: assistantMessageId,
                chatId,
                role: 'assistant',
                content: { parts },
              });
            } catch (error) {
              fastify.log.error(error, 'Failed to persist assistant message');
            }
          },
        }
      );

      return createUIMessageStreamResponse({
        status: 200,
        statusText: 'OK',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
        stream,
      });
    }
  );
}

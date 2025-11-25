import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { chats } from '../db/schema/index.js';
import { chatCreateSchema, chatUpdateSchema } from '@repo/shared/schemas';
import { ResponseError } from '../lib/errors.js';

export default async function chatsRoutes(fastify: FastifyInstance) {
  // List all chats
  fastify.get('/', async () => {
    const allChats = await db
      .select()
      .from(chats)
      .orderBy(desc(chats.updatedAt));

    return { ok: true, data: allChats };
  });

  // Get single chat
  fastify.get<{ Params: { id: string } }>('/:id', async (request) => {
    const { id } = request.params;

    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, id),
    });

    if (!chat) {
      throw new ResponseError('Chat not found', 404);
    }

    return { ok: true, data: chat };
  });

  // Create chat
  fastify.post<{ Body: z.infer<typeof chatCreateSchema> }>(
    '/',
    {
      schema: {
        body: chatCreateSchema,
      },
    },
    async (request) => {
      const { title, privacy } = request.body;

      const newChat = await db
        .insert(chats)
        .values({
          id: nanoid(),
          title,
          privacy: privacy || 'private',
        })
        .returning();

      return { ok: true, data: newChat[0] };
    }
  );

  // Update chat
  fastify.patch<{
    Params: { id: string };
    Body: z.infer<typeof chatUpdateSchema>;
  }>(
    '/:id',
    {
      schema: {
        body: chatUpdateSchema,
      },
    },
    async (request) => {
      const { id } = request.params;

      // Check if chat exists
      const chat = await db.query.chats.findFirst({
        where: eq(chats.id, id),
      });

      if (!chat) {
        throw new ResponseError('Chat not found', 404);
      }

      const updated = await db
        .update(chats)
        .set(request.body)
        .where(eq(chats.id, id))
        .returning();

      return { ok: true, data: updated[0] };
    }
  );

  // Delete chat
  fastify.delete<{ Params: { id: string } }>('/:id', async (request) => {
    const { id } = request.params;

    // Check if chat exists
    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, id),
    });

    if (!chat) {
      throw new ResponseError('Chat not found', 404);
    }

    await db.delete(chats).where(eq(chats.id, id));

    return { ok: true, message: 'Chat deleted' };
  });
}

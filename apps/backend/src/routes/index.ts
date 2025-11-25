import type { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  // Register API routes (no authentication required)
  await fastify.register(import('./chats.js'), { prefix: '/chats' });
  await fastify.register(import('./messages.js'), { prefix: '/messages' });
}

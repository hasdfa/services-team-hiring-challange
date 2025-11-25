import Fastify from 'fastify';
import cors from '@fastify/cors';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { ResponseError } from './lib/errors.js';

export async function createServer() {
  const server = Fastify({
    // logger: {
    //   level: process.env.LOG_LEVEL || 'info',
    // },
    logger: false,
  }).withTypeProvider<ZodTypeProvider>();

  // Set up Zod validation
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  // CORS configuration
  await server.register(cors, {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      /localhost:\d+/,
    ],
    credentials: true,
  });

  // Health check
  server.get('/health', async () => {
    return { ok: true, timestamp: new Date().toISOString() };
  });

  // Error handler
  server.setErrorHandler((error, _request, reply) => {
    if (error instanceof ResponseError) {
      return reply.status(error.statusCode).send(error.toJSON());
    }

    server.log.error(error);

    return reply.status(500).send({
      ok: false,
      message: 'Internal server error',
      statusCode: 500,
    });
  });

  // Register API routes
  await server.register(import('./routes/index.js'), { prefix: '/api' });

  return server;
}

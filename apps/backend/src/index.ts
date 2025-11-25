import 'dotenv/config';
import { createServer } from './server.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || 'localhost';

async function start() {
  try {
    // Initialize worker (it starts automatically)
    console.info('🔄 Initializing message queue worker...');

    const server = await createServer();
    await server.listen({ port: PORT, host: HOST });

    console.info(`🚀 Server listening at http://${HOST}:${PORT}`);
    console.info(`📊 Health check: http://${HOST}:${PORT}/health`);
    console.info('✅ Message queue worker ready');

    // Graceful shutdown
    const shutdown = async () => {
      console.info('Shutting down gracefully...');
      await server.close();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

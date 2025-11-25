import { createGateway } from 'ai';

const gateway = createGateway({
  apiKey: process.env.VERCEL_AI_GATEWAY_API_KEY!,
});

// export const defaultModel = gateway('openai/gpt-oss-120b');
export const defaultModel = gateway('anthropic/claude-haiku-4.5');

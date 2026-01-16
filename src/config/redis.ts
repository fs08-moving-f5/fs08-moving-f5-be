import { createClient } from 'redis';

if (!process.env.REDIS_HOST) {
  throw new Error('REDIS_HOST is not defined');
}

export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    connectTimeout: 5_000, // 5초 타임아웃
  },
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('connect', () => {
  console.log('[Redis] connected');
});

redisClient.on('error', (err) => {
  console.error('[Redis] error', err);
});

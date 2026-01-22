import app from './app';
import { env, logger } from './config/index';
import prisma from './config/prisma';
import { redisClient } from './config/redis';

async function bootstrap() {
  try {
    // Redis 연결
    await prisma.$connect();
    await redisClient.connect();

    logger.info('Prisma connected');
    logger.info('Redis connected');

    // 서버 실행
    const port = env.PORT || 4000;
    app.listen(port, () => {
      logger.info(`Server listening on http://localhost:${port}`);
    });
  } catch (error) {
    logger.error('Failed to bootstrap server', error);
    process.exit(1);
  }
}

bootstrap();

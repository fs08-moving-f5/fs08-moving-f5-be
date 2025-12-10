// 예시 파일입니다. 자유롭게 사용하세요.
import pino from 'pino';
import { env } from './env';

export const logger = pino({
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  level: env.NODE_ENV === 'test' ? 'silent' : 'info',
});

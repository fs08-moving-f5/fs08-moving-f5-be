import { Application } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import express from 'express';
import { morganMiddleware } from './morgan.js';

export function applySecurity(app: Application) {
  // SSE 스트림 경로는 helmet의 noSniff를 비활성화
  app.use('/api/notifications/stream', (req, res, next) => {
    // 이 경로에서는 noSniff 헤더를 설정하지 않도록 함
    next();
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
        },
      },
      noSniff: true,
    }),
  );

  // SSE 스트림 경로에서 noSniff 헤더 제거 (helmet 적용 후)
  app.use('/api/notifications/stream', (req, res, next) => {
    res.removeHeader('X-Content-Type-Options');
    next();
  });

  app.use(
    compression({
      filter: (req, res) => {
        if (req.path?.includes('notifications/stream')) {
          return false;
        }
        return compression.filter(req, res);
      },
    }),
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morganMiddleware);
}

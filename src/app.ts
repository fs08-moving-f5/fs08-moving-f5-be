import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { env, logger, corsOptions, swaggerSpec } from './config/index';
import { PRESIGN_EXPIRE_SECONDS } from './constants/presignExpire.constant';
import {
  errorHandler,
  notFoundHandler,
  applySecurity,
  presignImageUrlsMiddleware,
} from './middlewares/index';

import apiRouter from './api/index';

const app: Application = express();

// 1. 공통 미들웨어
applySecurity(app); // helmet, compression, body parser 등
app.use(cors(corsOptions)); // CORS (TS 호환 방식)
app.use(cookieParser()); // 쿠키 파싱

// 2. 헬스 체크
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 3. API Router
app.use(
  '/api',
  presignImageUrlsMiddleware({ expiresInSeconds: PRESIGN_EXPIRE_SECONDS }),
  apiRouter,
);

// 4. Swagger 문서
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/openapi.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(swaggerSpec);
});

// 5. 404 + Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

// 6. 서버 실행
const port = env.PORT || 4000;
const host = env.HOST || '0.0.0.0'; // Docker 컨테이너에서 외부 접근을 위해 필요

try {
  app.listen(port, host, () => {
    logger.info(`Server listening on http://${host}:${port}`);
  });
} catch (error) {
  logger.error('Failed to start server:', error);
  process.exit(1);
}

export default app;

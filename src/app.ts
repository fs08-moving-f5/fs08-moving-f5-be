// src/app.ts
import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { env } from './config/env';
import { logger } from './config/logger';
import { corsOptions } from './config/cors';
import { errorHandler, notFoundHandler } from './middlewares/index';

import apiRouter from './api/index';
import { applySecurity } from './middlewares/index';

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
app.use('/api', apiRouter);

// 4. 404 + Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

// 5. 서버 실행
const port = env.PORT || 4000;

app.listen(port, () => {
  logger.info(`Server listening on http://localhost:${port}`);
});

export default app;

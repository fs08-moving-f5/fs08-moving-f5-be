import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { env, logger, corsOptions, swaggerSpec } from './config/index';
import { errorHandler, notFoundHandler, applySecurity } from './middlewares/index';

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
app.use('/api', apiRouter);

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

try {
  app.listen(port, () => {
    logger.info(`Server listening on http://localhost:${port}`);
  });
} catch (error) {
  logger.error('Failed to start server:', error);
  process.exit(1);
}

export default app;

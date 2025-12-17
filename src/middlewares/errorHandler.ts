// 예시 파일입니다. 자유롭게 사용하세요.
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';

export function notFoundHandler(req: Request, res: Response) {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    logger.warn(`Validation failed: ${req.method} ${req.originalUrl}`, { errors: err.flatten() });
    return res.status(400).json({
      message: 'Validation failed',
      statusCode: 400,
      errors: err.flatten(),
    });
  }

  if (err?.code === 'LIMIT_FILE_SIZE') {
    logger.warn(`File too large: ${req.method} ${req.originalUrl}`);
    return res.status(413).json({
      message: 'File too large',
      statusCode: 413,
    });
  }

  // AppError의 statusCode를 우선적으로 사용
  const status =
    err.statusCode || (err.code && Number.isInteger(err.code) ? err.code : err.status) || 500;

  // 500 에러는 error 레벨, 그 외는 warn 레벨
  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${err.message}`);
  }

  const payload: any = {
    message: err.message || 'Internal server error',
    statusCode: status,
    name: err.name || 'Error',
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}

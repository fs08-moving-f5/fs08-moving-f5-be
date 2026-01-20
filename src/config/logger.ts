import fs from 'fs';
import path from 'path';
import { env } from './env';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, label, printf, colorize, errors } = winston.format;

const isProd = env.NODE_ENV === 'production';

// log 파일 경로 생성
const logDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = printf((info) => {
  const systemLabel = info.label ?? 'server';
  const ts = info.timestamp ?? '';
  const level = info.level ?? '';
  const message = info.message ?? '';

  return `${ts} [${systemLabel}] ${level}: ${message}`;
});

const consoleFormat = isProd
  ? combine(
      label({ label: 'api' }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      logFormat,
    )
  : combine(
      colorize(),
      label({ label: 'api' }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      logFormat,
    );

const fileFormat = combine(
  label({ label: 'api' }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  logFormat,
);

export const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',

  transports: [
    new winston.transports.Console({ format: consoleFormat }),

    new DailyRotateFile({
      dirname: logDir,
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }),

    new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
      level: 'error',
    }),
  ],

  // uncaughtException 처리
  exceptionHandlers: [
    new DailyRotateFile({
      dirname: logDir,
      filename: 'exception-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }),
    new winston.transports.Console({ format: consoleFormat }),
  ],

  rejectionHandlers: [
    new DailyRotateFile({
      dirname: logDir,
      filename: 'rejection-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }),
    new winston.transports.Console({ format: consoleFormat }),
  ],
});

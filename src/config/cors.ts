// 예시 파일입니다. 자유롭게 사용하세요.
import cors, { CorsOptionsDelegate, CorsOptions } from 'cors';
import { env } from './env.js';

const allowedOrigins = env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map((o) => o.trim()) : [];

const corsOptionsDelegate: CorsOptionsDelegate = (req, callback) => {
  const requestOrigin = req.headers.origin as string | undefined;

  let corsOptions: CorsOptions;

  if (!requestOrigin || env.CORS_ORIGIN === '*' || allowedOrigins.includes(requestOrigin)) {
    corsOptions = { origin: true, credentials: true };
  } else {
    corsOptions = { origin: false };
  }

  callback(null, corsOptions);
};

export const corsOptions = corsOptionsDelegate;

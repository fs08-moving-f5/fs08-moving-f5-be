// 예시 파일입니다. 자유롭게 사용하세요.
import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().optional(),
  // Frontend URL (and CORS origin). Example: http://localhost:3000 or http://localhost:3000,https://example.com
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:3000')
    .refine(
      (val) => {
        if (val === '*') return true;
        const origins = val.split(',').map((o) => o.trim());
        return origins.every((origin) => {
          try {
            new URL(origin);
            return true;
          } catch {
            return false;
          }
        });
      },
      { message: 'CORS_ORIGIN must be a valid URL or comma-separated URLs' },
    ),

  // Backend base URL
  SERVER_URL: z.string().url().default('http://localhost:4000'),

  // DB
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // JWT
  JWT_SECRET: z.string().min(10, 'JWT_SECRET is required (>=10 chars)'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET is required (>=10 chars)'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  KAKAO_CLIENT_ID: z.string().optional(),
  KAKAO_CLIENT_SECRET: z.string().optional(),

  NAVER_CLIENT_ID: z.string().optional(),
  NAVER_CLIENT_SECRET: z.string().optional(),

  // AWS S3
  // AWS_REGION: z.string().min(1, 'AWS_REGION is required').optional(),
  // AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required').optional(),
  // AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required').optional(),
  // S3_BUCKET: z.string().min(1, 'S3_BUCKET is required').optional(),
});

const parseResult = schema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Environment variable validation failed:');
  parseResult.error.issues.forEach((issue) => {
    const path = issue.path.join('.') || 'root';
    console.error(`  - ${path}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parseResult.data;

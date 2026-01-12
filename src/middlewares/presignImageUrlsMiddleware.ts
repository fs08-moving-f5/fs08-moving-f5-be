import type { NextFunction, Request, Response } from 'express';

import { createPresignedGetUrlForKey } from '@/config/s3';
import { env } from '@/config/env';

type Options = {
  expiresInSeconds?: number;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object') return false;
  return Object.prototype.toString.call(value) === '[object Object]';
};

const isPresignCandidateKeyString = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const lower = value.toLowerCase();
  if (!lower) return false;
  if (lower.startsWith('http://') || lower.startsWith('https://')) return false;
  if (lower.startsWith('data:')) return false;
  return true;
};

const presignImageUrlsDeep = async (input: unknown, expiresInSeconds: number): Promise<unknown> => {
  if (Array.isArray(input)) {
    return await Promise.all(input.map((item) => presignImageUrlsDeep(item, expiresInSeconds)));
  }

  // Date/Buffer/클래스 인스턴스 등은 건드리지 않음
  if (!isPlainObject(input)) {
    return input;
  }

  const entries = await Promise.all(
    Object.entries(input).map(async ([key, value]) => {
      if (key === 'imageUrl' && isPresignCandidateKeyString(value)) {
        const signed = await createPresignedGetUrlForKey(value, expiresInSeconds);
        return [key, signed] as const;
      }

      return [key, await presignImageUrlsDeep(value, expiresInSeconds)] as const;
    }),
  );

  return Object.fromEntries(entries);
};

export const presignImageUrlsMiddleware = (options?: Options) => {
  const expiresInSeconds = options?.expiresInSeconds ?? 60 * 60;

  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = (body: unknown) => {
      // S3 환경이 없으면 변환 없이 그대로 응답
      if (!env.S3_BUCKET || !env.AWS_REGION) {
        return originalJson(body);
      }

      presignImageUrlsDeep(body, expiresInSeconds)
        .then((transformed) => {
          originalJson(transformed);
        })
        .catch((error) => {
          next(error);
        });

      // Express의 res.json 시그니처를 맞추기 위해 Response를 반환
      return res;
    };

    next();
  };
};

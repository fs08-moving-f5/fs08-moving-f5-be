import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { env } from './env.js';
import { PRESIGN_EXPIRE_SECONDS } from '../constants/presignExpire.constant.js';
import AppError from '../utils/AppError.js';
import HTTP_STATUS from '../constants/http.constant.js';

const requireS3Env = () => {
  const { AWS_REGION, S3_BUCKET } = env;

  if (!AWS_REGION) {
    throw new AppError('AWS_REGION이 설정되어 있지 않습니다', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  if (!S3_BUCKET) {
    throw new AppError('S3_BUCKET이 설정되어 있지 않습니다', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  return { AWS_REGION, S3_BUCKET };
};

export const createS3Client = () => {
  const { AWS_REGION } = requireS3Env();

  const commonOptions = {
    region: AWS_REGION,
    requestChecksumCalculation: 'WHEN_REQUIRED' as const,
    responseChecksumValidation: 'WHEN_REQUIRED' as const,
  };

  if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
    return new S3Client({
      ...commonOptions,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  return new S3Client({
    ...commonOptions,
  });
};

export const getS3PublicUrlForKey = (key: string) => {
  const { AWS_REGION, S3_BUCKET } = requireS3Env();

  const baseUrl = env.S3_PUBLIC_BASE_URL
    ? env.S3_PUBLIC_BASE_URL.replace(/\/+$/, '')
    : `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`;

  return `${baseUrl}/${key.replace(/^\/+/, '')}`;
};

export const createPresignedGetUrlForKey = async (
  key: string,
  expiresInSeconds = PRESIGN_EXPIRE_SECONDS,
) => {
  const { S3_BUCKET } = requireS3Env();

  const s3 = createS3Client();
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
};

export const isLikelyS3ObjectKey = (value: string) => {
  if (!value) return false;
  const lower = value.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://')) return false;
  if (lower.startsWith('data:')) return false;
  return true;
};

export const presignGetUrlIfKey = async (
  value: string | null | undefined,
  expiresInSeconds = PRESIGN_EXPIRE_SECONDS,
) => {
  if (value == null) return value;
  if (!isLikelyS3ObjectKey(value)) return value;
  return await createPresignedGetUrlForKey(value, expiresInSeconds);
};

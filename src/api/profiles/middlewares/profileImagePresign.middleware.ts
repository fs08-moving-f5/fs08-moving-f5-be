import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';

import asyncHandler from '@/middlewares/asyncHandler';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';
import { PRESIGN_EXPIRE_SECONDS_PUT } from '@/constants/presignExpire.constant';
import { env } from '@/config/env';
import { createS3Client, getS3PublicUrlForKey } from '@/config/s3';

declare global {
  namespace Express {
    interface Locals {
      profileImagePutPresign?: {
        key: string;
        uploadUrl: string;
        fileUrl: string;
      };
    }
  }
}

const requireAuthUser = (user: unknown): { id: string } => {
  if (!user || typeof user !== 'object' || !(user as any).id) {
    throw new AppError('인증이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
  }
  return user as { id: string };
};

const isAllowedImageContentType = (contentType: string) => contentType.startsWith('image/');

export const createProfileImagePutPresignSchema = z.object({
  contentType: z.string().min(1),
  fileName: z.string().optional(),
});

// 프로필 이미지 PUT presign 생성 미들웨어
export const createProfileImagePutPresign = asyncHandler(async (req, res, next) => {
  const user = requireAuthUser(req.currentUser);

  if (!env.S3_BUCKET || !env.AWS_REGION) {
    throw new AppError(
      'S3 설정이 서버에 구성되어 있지 않습니다',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  const { contentType } = createProfileImagePutPresignSchema.parse(req.body);
  if (!isAllowedImageContentType(contentType)) {
    throw new AppError('이미지 파일만 업로드할 수 있습니다', HTTP_STATUS.BAD_REQUEST);
  }

  // 유저별 고정 key로 업로드(덮어쓰기)하여 기존 이미지를 별도 삭제하지 않고 교체
  const key = `profile/profile-images/${user.id}/current`;

  const s3 = createS3Client();
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: PRESIGN_EXPIRE_SECONDS_PUT });
  const fileUrl = getS3PublicUrlForKey(key);

  res.locals.profileImagePutPresign = { key, uploadUrl, fileUrl };
  next();
});

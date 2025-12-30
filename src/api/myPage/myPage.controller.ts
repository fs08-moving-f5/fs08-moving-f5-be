import { getMyPageDataService, getMyPageReviewsService } from './myPage.service';
import AppError from '@/utils/AppError';
import asyncHandler from '@/middlewares/asyncHandler';
import HTTP_STATUS from '@/constants/http.constant';

import type { Request, Response } from 'express';
import type { User } from '@/generated/client';

// loadUser 미들웨어를 거친 후 req.user는 전체 User 정보를 포함합니다
type RequestWithFullUser = Request & { user: Omit<User, 'password'> };

// ========== MyPage Controllers ==========

/**
 * 드라이버 마이페이지 전체 데이터 조회
 * GET /api/my-page
 */
export const getMyPageController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as Omit<User, 'password'>;

  if (!user) {
    throw new AppError('인증이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
  }

  if (user.type !== 'DRIVER') {
    throw new AppError('드라이버만 접근할 수 있습니다', HTTP_STATUS.FORBIDDEN);
  }

  const myPageData = await getMyPageDataService(user.id);

  res.json({
    success: true,
    data: myPageData,
  });
});

/**
 * 드라이버 마이페이지 리뷰 목록 조회 (페이지네이션)
 * GET /api/my-page/reviews?page=1&limit=10
 */
export const getMyPageReviewsController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as Omit<User, 'password'>;

  if (!user) {
    throw new AppError('인증이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
  }

  if (user.type !== 'DRIVER') {
    throw new AppError('드라이버만 접근할 수 있습니다', HTTP_STATUS.FORBIDDEN);
  }

  // 쿼리 파라미터에서 페이지 정보 추출
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const reviewsData = await getMyPageReviewsService(user.id, page, limit);

  res.json({
    success: true,
    data: reviewsData,
  });
});

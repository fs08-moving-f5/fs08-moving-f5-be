import { Request, Response } from 'express';
import * as service from './review.service';
import asyncHandler from '@/middlewares/asyncHandler';
import HTTP_STATUS from '@/constants/http.constant';
import * as validator from './validators/review.validators';
import type { ReviewSort, GetReviewParams, UpdateReviewParams } from '@/types/review';

// 내가 작성한 리뷰 목록 조회 (일반 유저)
export const getReviewWritten = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const query = validator.paginationQueryValidator.parse(req.query);

  const params: GetReviewParams = {
    userId,
    offset: query.offset ?? 0,
    limit: query.limit ?? 10,
  };

  const reviews = await service.getReviewWrittenService(params);

  res.status(HTTP_STATUS.OK).json({ success: true, data: reviews });
});

// 리뷰 작성 가능한 견적 목록 조회 (일반 유저)
export const getReviewWritable = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const query = validator.paginationQueryValidator.parse(req.query);

  const params: GetReviewParams = {
    userId,
    offset: query.offset ?? 0,
    limit: query.limit ?? 10,
  };

  const reviews = await service.getReviewWritableService(params);

  res.status(HTTP_STATUS.OK).json({ success: true, data: reviews });
});

// 리뷰 작성 (일반 유저)
export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = validator.reviewIdParamsValidator.parse(req.params);
  const body = validator.updateReviewBodyValidator.parse(req.body);

  const data: UpdateReviewParams = {
    reviewId,
    rating: body.rating,
    content: body.content,
  };

  const review = await service.updateReviewService(data);

  res.status(HTTP_STATUS.OK).json({ success: true, data: review });
});

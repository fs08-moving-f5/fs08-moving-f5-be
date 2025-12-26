import { Request, Response } from 'express';
import * as service from './review.service';
import asyncHandler from '../../middlewares/asyncHandler';
import { ReviewSort, GetReviewParams, CreateReviewParams } from '../../types/review';
import HTTP_STATUS from '@/constants/http.constant';

// 내가 작성한 리뷰 목록 조회 (일반 유저)
export const getReviewWritten = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const params: GetReviewParams = {
    userId,
    sort: req.query.sort as ReviewSort,
    offset: req.query.offset ? Number(req.query.offset) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  };

  const reviews = await service.getReviewWrittenService(params);

  res.status(HTTP_STATUS.OK).json({ success: true, data: reviews });
});

// 작성 가능한 리뷰 목록 조회 (일반 유저)
export const getReviewWritable = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const params: GetReviewParams = {
    userId,
    sort: req.query.sort as ReviewSort,
    offset: req.query.offset ? Number(req.query.offset) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  };

  const reviews = await service.getReviewWritableService(params);

  res.status(HTTP_STATUS.OK).json({ success: true, data: reviews });
});

// 리뷰 작성 (일반 유저)
export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const data: CreateReviewParams = {
    estimateId: req.body.estimateId,
    rating: Number(req.body.rating),
    content: String(req.body.content),
    userId,
  };

  const review = await service.createReviewService(data);

  res.status(HTTP_STATUS.OK).json({ success: true, data: review });
});

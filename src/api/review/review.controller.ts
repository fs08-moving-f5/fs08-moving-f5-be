import { Request, Response } from 'express';
import * as service from './review.service';
import asyncHandler from '../../middlewares/asyncHandler';
import { ReviewSort, getReviewWrittenParams } from '../../types/review';

// 내가 작성한 리뷰 목록 조회 (일반 유저)
export const getReviewWritten = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const params: getReviewWrittenParams = {
    userId,
    sort: req.query.sort as ReviewSort,
    offset: req.query.offset ? Number(req.query.offset) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  };

  const reviews = await service.getReviewWrittenService(params);

  res.status(200).json({ message: '내가 작성한 리뷰 목록 조회 성공', data: reviews });
});

// 작성 가능한 리뷰 목록 조회 (일반 유저)

// 리뷰 작성 (일반 유저)

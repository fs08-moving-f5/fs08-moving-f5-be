import * as repo from './review.repository';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';
import ERROR_MESSAGE from '@/constants/errorMessage.constant';
import { GetReviewParams, CreateReviewParams } from '../../types/review';

// 내가 작성한 리뷰 목록 조회 (일반 유저)
export async function getReviewWrittenService(params: GetReviewParams) {
  if (!params.userId) {
    throw new AppError(ERROR_MESSAGE.USER_REQUIRED, HTTP_STATUS.UNAUTHORIZED);
  }

  return repo.getReviewWrittenRepository(params);
}

// 작성 가능한 리뷰 목록 조회 (일반 유저)
export async function getReviewWritableService(params: GetReviewParams) {
  if (!params.userId) {
    throw new AppError(ERROR_MESSAGE.USER_REQUIRED, HTTP_STATUS.UNAUTHORIZED);
  }

  return repo.getReviewWritableRepository(params);
}

// 리뷰 작성 (일반 유저)
export async function createReviewService(data: CreateReviewParams) {
  const { estimateId, userId, rating, content } = data;

  if (!data.userId) {
    throw new AppError(ERROR_MESSAGE.USER_REQUIRED, HTTP_STATUS.UNAUTHORIZED);
  }

  if (!estimateId || !userId || rating == null || content == null) {
    throw new AppError(ERROR_MESSAGE.REQUIRED_FIELD_MISSING, HTTP_STATUS.BAD_REQUEST);
  }

  return repo.createReviewRepository(data);
}

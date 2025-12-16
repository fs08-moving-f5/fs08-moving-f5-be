import * as repo from './review.repository';
import { HttpError } from '../../types/error';
import { GetReviewParams, CreateReviewParams } from '../../types/review';

// 내가 작성한 리뷰 목록 조회 (일반 유저)
export async function getReviewWrittenService(params: GetReviewParams) {
  if (!params.userId) {
    throw new HttpError('유저 로그인이 필요합니다.', 401);
  }

  return repo.getReviewWrittenRepository(params);
}

// 작성 가능한 리뷰 목록 조회 (일반 유저)
export async function getReviewWritableService(params: GetReviewParams) {
  if (!params.userId) {
    throw new HttpError('유저 로그인이 필요합니다.', 401);
  }

  return repo.getReviewWritableRepository(params);
}

// 리뷰 작성 (일반 유저)
export async function createReviewService(data: CreateReviewParams) {
  const { estimateId, userId, rating, content } = data;

  if (!data.userId) {
    throw new HttpError('유저 로그인이 필요합니다.', 401);
  }

  if (!estimateId || !userId || rating == null || content == null) {
    throw new HttpError('필수 데이터가 누락되었습니다.', 400);
  }

  return repo.createReviewRepository(data);
}

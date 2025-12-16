import * as repo from './review.repository';
import { HttpError } from '../../types/error';
import { GetReviewParams } from '../../types/review';

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

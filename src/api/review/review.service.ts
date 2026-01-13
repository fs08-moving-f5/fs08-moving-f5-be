import prisma from '../../config/prisma';
import * as repo from './review.repository';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';
import {
  GetReviewParams,
  UpdateReviewParams,
  WrittenReviewListResult,
  WritableReviewListResult,
} from '../../types/review';
import splitAddresses from '@/utils/splitAddresses';
import { NotificationType } from '../../generated/enums';
import { createNotificationAndPushUnreadService } from '../notification/notification.service';

// 내가 작성한 리뷰 목록 조회 (일반 유저)
export async function getReviewWrittenService(
  params: GetReviewParams,
): Promise<WrittenReviewListResult> {
  const { reviews, total } = await repo.getReviewWrittenRepository(params);

  const mapped = reviews.map((review) => {
    const { from, to } = splitAddresses(review.estimate.estimateRequest.addresses);

    return {
      id: review.id,
      rating: review.rating,
      content: review.content,
      updatedAt: review.updatedAt,
      driver: {
        id: review.estimate.driver.id,
        name: review.estimate.driver.name,
        shortIntro: review.estimate.driver.driverProfile?.shortIntro ?? null,
        imageUrl: review.estimate.driver.driverProfile?.imageUrl ?? null,
      },
      movingType: review.estimate.estimateRequest.movingType,
      movingDate: review.estimate.estimateRequest.movingDate,
      isDesignated: review.estimate.estimateRequest.isDesignated,
      from: from ? { sido: from.sido, sigungu: from.sigungu } : null,
      to: to ? { sido: to.sido, sigungu: to.sigungu } : null,
    };
  });

  return { reviews: mapped, total };
}

// 리뷰 작성 가능한 견적 목록 조회 (일반 유저)
export async function getReviewWritableService(
  params: GetReviewParams,
): Promise<WritableReviewListResult> {
  const { estimates, total } = await repo.getReviewWritableRepository(params);

  const mapped = estimates.map((estimate) => {
    if (!estimate.review) {
      throw new AppError(
        '서버 내부 상태가 올바르지 않습니다.', // 확정 견적에 리뷰 테이블이 존재하지 않음
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const { from, to } = splitAddresses(estimate.estimateRequest.addresses);

    return {
      id: estimate.id,
      reviewId: estimate.review.id,
      price: estimate.price,
      createdAt: estimate.createdAt,
      driver: {
        id: estimate.driver.id,
        name: estimate.driver.name,
        shortIntro: estimate.driver.driverProfile?.shortIntro ?? null,
        imageUrl: estimate.driver.driverProfile?.imageUrl ?? null,
      },
      movingType: estimate.estimateRequest.movingType,
      movingDate: estimate.estimateRequest.movingDate,
      isDesignated: estimate.estimateRequest.isDesignated,
      from: from ? { sido: from.sido, sigungu: from.sigungu } : null,
      to: to ? { sido: to.sido, sigungu: to.sigungu } : null,
    };
  });

  return { estimates: mapped, total };
}

// 리뷰 작성 (일반 유저)
export async function updateReviewService(params: UpdateReviewParams) {
  const { reviewId, rating, content } = params;

  if (!reviewId || rating == null || content == null) {
    throw new AppError('필수 데이터가 누락되었습니다.', HTTP_STATUS.BAD_REQUEST);
  }

  const review = await repo.findReviewForWriteRepository({
    reviewId,
  });

  if (!review) {
    throw new AppError('해당 리뷰가 존재하지 않습니다.', HTTP_STATUS.NOT_FOUND);
  }

  if (review.rating !== null || review.content !== null) {
    throw new AppError('이미 해당 견적에 리뷰를 제출했습니다.', HTTP_STATUS.BAD_REQUEST);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await repo.updateReviewRepository({
      reviewId: review.id,
      rating,
      content,
      tx,
    });

    await createNotificationAndPushUnreadService({
      userId: review.estimate.driverId,
      type: NotificationType.NEW_REVIEW,
      message: '새로운 리뷰가 등록되었습니다.',
      tx,
    });

    return updated;
  });

  return result;
}

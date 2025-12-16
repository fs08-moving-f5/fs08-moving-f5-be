import prisma from '../../config/prisma';
import { Prisma, Review } from '../../generated/client';
import { ServiceEnum, EstimateStatus } from '../../generated/enums';
import { HttpError } from '../../types/error';
import {
  GetReviewParams,
  WrittenReviewListResult,
  WritableReviewListResult,
} from '../../types/review';
import splitAddresses from '../../utils/splitAddresses';

// 내가 작성한 리뷰 목록 조회 (일반 유저)
export async function getReviewWrittenRepository({
  userId,
  sort = 'latest',
  offset = 0,
  limit = 10,
}: GetReviewParams): Promise<WrittenReviewListResult> {
  // offset, limit를 숫자로 변환
  const parsedOffset = typeof offset === 'string' ? parseInt(offset, 10) : offset;
  const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;

  const finalOffset = isNaN(parsedOffset) ? 0 : parsedOffset;
  const finalLimit = isNaN(parsedLimit) ? 10 : parsedLimit;

  const where: Prisma.ReviewWhereInput = {
    userId,
    estimate: {
      isDelete: false,
      status: EstimateStatus.CONFIRMED,
    },
  };

  let orderBy = {};
  switch (sort) {
    case 'latest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      select: {
        rating: true,
        content: true,
        createdAt: true,

        estimate: {
          select: {
            driver: { select: { name: true, driverProfile: { select: { shortIntro: true } } } },

            estimateRequest: {
              select: {
                movingDate: true,
                movingType: true,
                isDesignated: true,

                addresses: { select: { addressType: true, sido: true, sigungu: true } },
              },
            },
          },
        },
      },
      orderBy,
      skip: finalOffset,
      take: finalLimit,
    }),
    prisma.review.count({ where }),
  ]);

  const mappedReviews = reviews.map((review) => {
    const addresses = review.estimate.estimateRequest.addresses;
    const { from, to } = splitAddresses(addresses);

    return {
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt,

      driver: {
        name: review.estimate.driver.name,
        shortIntro: review.estimate.driver.driverProfile?.shortIntro ?? null,
      },

      movingType: review.estimate.estimateRequest.movingType,
      movingDate: review.estimate.estimateRequest.movingDate,
      isDesignated: review.estimate.estimateRequest.isDesignated,

      from: from ? { sido: from.sido, sigungu: from.sigungu } : null,
      to: to ? { sido: to.sido, sigungu: to.sigungu } : null,
    };
  });

  return {
    reviews: mappedReviews,
    total,
  };
}

// 작성 가능한 리뷰 목록 조회 (일반 유저)
export async function getReviewWritableRepository({
  userId,
  sort = 'latest',
  offset = 0,
  limit = 10,
}: GetReviewParams): Promise<WritableReviewListResult> {
  // offset, limit를 숫자로 변환
  const parsedOffset = typeof offset === 'string' ? parseInt(offset, 10) : offset;
  const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;

  const finalOffset = isNaN(parsedOffset) ? 0 : parsedOffset;
  const finalLimit = isNaN(parsedLimit) ? 10 : parsedLimit;

  const where: Prisma.EstimateWhereInput = {
    estimateRequest: {
      userId,
      isDelete: false,
    },
    status: EstimateStatus.CONFIRMED,
    review: null,
    isDelete: false,
  };

  let orderBy = {};
  switch (sort) {
    case 'latest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  const [estimates, total] = await prisma.$transaction([
    prisma.estimate.findMany({
      where,
      select: {
        id: true,
        price: true,
        createdAt: true,

        driver: { select: { name: true, driverProfile: { select: { shortIntro: true } } } },

        estimateRequest: {
          select: {
            movingDate: true,
            movingType: true,
            isDesignated: true,

            addresses: { select: { addressType: true, sido: true, sigungu: true } },
          },
        },
      },

      orderBy,
      skip: finalOffset,
      take: finalLimit,
    }),
    prisma.estimate.count({ where }),
  ]);

  const mappedReviews = estimates.map((estimate) => {
    const addresses = estimate.estimateRequest.addresses;
    const { from, to } = splitAddresses(addresses);

    return {
      id: estimate.id,
      price: estimate.price,
      createdAt: estimate.createdAt,

      driver: {
        name: estimate.driver.name,
        shortIntro: estimate.driver.driverProfile?.shortIntro ?? null,
      },

      movingType: estimate.estimateRequest.movingType,
      movingDate: estimate.estimateRequest.movingDate,
      isDesignated: estimate.estimateRequest.isDesignated,

      from: from ? { sido: from.sido, sigungu: from.sigungu } : null,
      to: to ? { sido: to.sido, sigungu: to.sigungu } : null,
    };
  });

  return {
    estimates: mappedReviews,
    total,
  };
}

export interface CreateReviewParams {
  estimateId: string;
  userId: string;
  rating?: number | undefined;
  content?: string | undefined;
}

// 리뷰 작성 (일반 유저)
export async function postReviewRepository({
  estimateId,
  rating,
  content,
  userId,
}: CreateReviewParams) {
  if (!estimateId) {
    throw new HttpError('estimateId가 필요합니다.', 400);
  }

  const review = await prisma.review.findFirst({
    where: {
      estimateId,
      userId,
    },
  });

  if (!review) {
    throw new HttpError('리뷰 대상이 존재하지 않습니다.', 404);
  }

  if (review.rating !== null || review.content !== null) {
    throw new HttpError('이미 해당 견적에 리뷰를 제출했습니다.', 400);
  }

  return prisma.review.update({
    where: { id: review.id },
    data: {
      rating,
      content,
    },
    include: { estimate: true },
  });
}

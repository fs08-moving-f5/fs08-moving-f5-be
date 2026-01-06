import prisma from '../../config/prisma';
import { Prisma } from '../../generated/client';
import { EstimateStatus } from '../../generated/enums';
import { GetReviewParams } from '../../types/review';

// 내가 작성한 리뷰 목록 조회 (일반 유저)
export async function getReviewWrittenRepository({
  userId,
  sort = 'latest',
  offset = 0,
  limit = 10,
}: GetReviewParams) {
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

  const reviews = await prisma.review.findMany({
    where,
    select: {
      id: true,
      rating: true,
      content: true,
      createdAt: true,
      estimate: {
        select: {
          driver: {
            select: {
              id: true,
              name: true,
              driverProfile: { select: { imageUrl: true, shortIntro: true } },
            },
          },
          estimateRequest: {
            select: {
              movingDate: true,
              movingType: true,
              isDesignated: true,
              addresses: {
                select: {
                  addressType: true,
                  sido: true,
                  sigungu: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy,
    skip: finalOffset,
    take: finalLimit,
  });

  const total = await prisma.review.count({ where });

  return { reviews, total };
}

// 작성 가능한 리뷰 목록 조회 (일반 유저)
export async function getReviewWritableRepository({
  userId,
  sort = 'latest',
  offset = 0,
  limit = 10,
}: GetReviewParams) {
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

  const estimates = await prisma.estimate.findMany({
    where,
    select: {
      id: true,
      price: true,
      createdAt: true,
      driver: {
        select: {
          id: true,
          name: true,
          driverProfile: { select: { imageUrl: true, shortIntro: true } },
        },
      },
      estimateRequest: {
        select: {
          movingDate: true,
          movingType: true,
          isDesignated: true,
          addresses: {
            select: {
              addressType: true,
              sido: true,
              sigungu: true,
            },
          },
        },
      },
    },
    orderBy,
    skip: finalOffset,
    take: finalLimit,
  });

  const total = await prisma.estimate.count({ where });

  return { estimates, total };
}

// 리뷰 존재 여부 조회
export async function findReviewForWriteRepository({
  estimateId,
  userId,
}: {
  estimateId: string;
  userId: string;
}) {
  return await prisma.review.findFirst({
    where: { estimateId, userId },
    include: {
      estimate: { select: { driverId: true } },
    },
  });
}

// 리뷰 작성 (일반 유저)
export async function updateReviewRepository({
  reviewId,
  rating,
  content,
  tx,
}: {
  reviewId: string;
  rating: number;
  content: string;
  tx?: Prisma.TransactionClient;
}) {
  return await (tx ?? prisma).review.update({
    where: { id: reviewId },
    data: { rating, content },
  });
}

// 히스토리 생성
export async function createReviewHistoryRepository({
  entityId,
  tx,
}: {
  entityId: string;
  tx?: Prisma.TransactionClient;
}) {
  return await (tx ?? prisma).history.create({
    data: {
      entityId,
      entityType: 'Review',
      actionType: 'CREATE_Review',
      actionDesc: '리뷰 작성',
    },
  });
}

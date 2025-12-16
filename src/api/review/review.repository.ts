import prisma from '../../config/prisma';
import { Prisma } from '../../generated/client';
import { getReviewWrittenParams, WrittenReviewListResult } from '../../types/review';
import splitAddresses from '../../utils/splitAddresses';

// 내가 작성한 리뷰 목록 조회 (일반 유저)
export async function getReviewWrittenRepository({
  userId,
  sort = 'latest',
  offset = 0,
  limit = 10,
}: getReviewWrittenParams): Promise<WrittenReviewListResult> {
  // offset, limit를 숫자로 변환
  const parsedOffset = typeof offset === 'string' ? parseInt(offset, 10) : offset;
  const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;

  const finalOffset = isNaN(parsedOffset) ? 0 : parsedOffset;
  const finalLimit = isNaN(parsedLimit) ? 10 : parsedLimit;

  const where: Prisma.ReviewWhereInput = {
    userId,
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
            price: true,

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

      price: review.estimate.price,

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

// 리뷰 작성 (일반 유저)

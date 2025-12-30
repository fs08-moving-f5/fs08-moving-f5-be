import prisma from '@/config/prisma';

import type { User, DriverProfile, Review } from '@/generated/client';

// 리뷰 별점 분포 타입
interface ReviewDistribution {
  [key: number]: number;
}

// 리뷰 별점 초기 분포
const INITIAL_REVIEW_DISTRIBUTION = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
};

// ========== MyPage Repository ==========

// 드라이버 기본 정보 조회 (프로필 포함)
export const findDriverWithProfileRepository = async (
  driverId: string,
): Promise<
  | (User & {
      driverProfile: DriverProfile | null;
    })
  | null
> => {
  return prisma.user.findUnique({
    where: { id: driverId, type: 'DRIVER' },
    include: {
      driverProfile: true,
    },
  });
};

// 드라이버의 확정된 견적서 수 조회
export const countConfirmedEstimatesRepository = async (driverId: string): Promise<number> => {
  return prisma.estimate.count({
    where: {
      driverId,
      status: 'CONFIRMED',
      isDelete: false,
    },
  });
};

// 드라이버의 리뷰 평점 목록 조회 (통계 계산용)
export const findDriverReviewRatingsRepository = async (
  driverId: string,
): Promise<Array<{ rating: number | null }>> => {
  return prisma.review.findMany({
    where: {
      estimate: {
        driverId,
        isDelete: false,
      },
    },
    select: {
      rating: true,
    },
  });
};

// 드라이버의 리뷰 목록 조회
export const findDriverReviewsRepository = async (
  driverId: string,
  skip: number,
  take: number,
): Promise<
  (Review & {
    user: {
      id: string;
      name: string;
    };
  })[]
> => {
  return prisma.review.findMany({
    where: {
      estimate: {
        driverId,
        isDelete: false,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take,
  });
};

// 드라이버의 리뷰 총 개수 조회
export const countDriverReviewsRepository = async (driverId: string): Promise<number> => {
  return prisma.review.count({
    where: {
      estimate: {
        driverId,
        isDelete: false,
      },
    },
  });
};

// 드라이버의 리뷰 별점 분포 조회
export const getDriverReviewDistributionRepository = async (
  driverId: string,
): Promise<ReviewDistribution> => {
  const reviews = await prisma.review.findMany({
    where: {
      estimate: {
        driverId,
        isDelete: false,
      },
    },
    select: {
      rating: true,
    },
  });

  const distribution: ReviewDistribution = { ...INITIAL_REVIEW_DISTRIBUTION };

  reviews.forEach((review) => {
    if (review.rating) {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    }
  });

  return distribution;
};

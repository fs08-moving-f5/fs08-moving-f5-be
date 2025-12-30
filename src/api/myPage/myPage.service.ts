import {
  findDriverWithProfileRepository,
  countConfirmedEstimatesRepository,
  findDriverReviewRatingsRepository,
  findDriverReviewsRepository,
  countDriverReviewsRepository,
  getDriverReviewDistributionRepository,
} from './myPage.repository';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';

import type { RegionEnum, ServiceEnum } from '@/generated/client';

// ========== MyPage Types ==========

interface MyPageData {
  profile: {
    id: string;
    name: string;
    imageUrl: string | null;
    career: string | null;
    shortIntro: string | null;
    description: string | null;
    services: ServiceEnum[];
    regions: RegionEnum[];
  };
  activity: {
    completedCount: number;
    averageRating: number;
    career: string | null;
  };
  reviewDistribution: {
    [key: number]: number;
  };
}

interface ReviewListData {
  reviews: Array<{
    id: string;
    rating: number | null;
    content: string | null;
    createdAt: Date;
    userName: string;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// ========== MyPage Constants ==========

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const MIN_PAGE = 1;
const MIN_LIMIT = 1;
const RATING_DECIMAL_PLACES = 10;

// ========== MyPage Service ==========

// 드라이버 마이페이지 데이터 조회
export const getMyPageDataService = async (driverId: string): Promise<MyPageData> => {
  // 1. 드라이버 기본 정보 및 프로필 조회
  const driverWithProfile = await findDriverWithProfileRepository(driverId);
  
  if (!driverWithProfile) {
    throw new AppError('드라이버를 찾을 수 없습니다', HTTP_STATUS.NOT_FOUND);
  }

  // 2. 활동 현황 데이터 병렬 조회
  const [completedCount, reviewRatings, reviewDistribution] = await Promise.all([
    countConfirmedEstimatesRepository(driverId),
    findDriverReviewRatingsRepository(driverId),
    getDriverReviewDistributionRepository(driverId),
  ]);

  // 3. 평균 평점 계산 (서비스 레이어에서 처리)
  const totalReviews = reviewRatings.length;
  const averageRating = totalReviews > 0
    ? reviewRatings.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews
    : 0;

  // 4. 데이터 조합
  const profile = driverWithProfile.driverProfile;

  return {
    profile: {
      id: driverWithProfile.id,
      name: driverWithProfile.name,
      imageUrl: profile?.imageUrl || null,
      career: profile?.career || null,
      shortIntro: profile?.shortIntro || null,
      description: profile?.description || null,
      services: profile?.services || [],
      regions: profile?.regions || [],
    },
    activity: {
      completedCount,
      averageRating: Math.round(averageRating * RATING_DECIMAL_PLACES) / RATING_DECIMAL_PLACES,
      career: profile?.career || null,
    },
    reviewDistribution,
  };
};

// 드라이버 리뷰 목록 조회 (페이지네이션)
export const getMyPageReviewsService = async (
  driverId: string,
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_LIMIT,
): Promise<ReviewListData> => {
  // 페이지 유효성 검사
  if (page < MIN_PAGE) page = DEFAULT_PAGE;
  if (limit < MIN_LIMIT || limit > MAX_LIMIT) limit = DEFAULT_LIMIT;

  // 페이지네이션 계산 (서비스에서 처리)
  const skip = (page - 1) * limit;

  // 데이터 조회
  const [reviews, total] = await Promise.all([
    findDriverReviewsRepository(driverId, skip, limit),
    countDriverReviewsRepository(driverId),
  ]);

  // 페이지네이션 정보 계산
  const totalPages = Math.ceil(total / limit);

  // 데이터 가공
  return {
    reviews: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt,
      userName: review.user.name,
    })),
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

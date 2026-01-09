import { ServiceEnum, EstimateStatus } from '../generated/enums';

export type ReviewSort = 'latest';

export interface PaginationParams {
  offset?: number | string;
  limit?: number | string;
}

export interface GetReviewParams extends PaginationParams {
  userId: string;
  sort?: ReviewSort;
}

export interface WrittenReviewItem {
  rating: number | null;
  content: string | null;
  updatedAt: Date;
  driver: {
    name: string;
    shortIntro: string | null;
  };
  movingType: ServiceEnum;
  movingDate: Date;
  isDesignated: boolean;
  from: { sido: string; sigungu: string } | null;
  to: { sido: string; sigungu: string } | null;
}

export interface WrittenReviewListResult {
  reviews: WrittenReviewItem[];
  total: number;
}

export interface WritableReviewItem {
  id: string;
  price: number | null;
  createdAt: Date;
  driver: {
    name: string;
    shortIntro: string | null;
  };
  movingType: ServiceEnum;
  movingDate: Date;
  isDesignated: boolean;
  from: { sido: string; sigungu: string } | null;
  to: { sido: string; sigungu: string } | null;
}

export interface WritableReviewListResult {
  estimates: WritableReviewItem[];
  total: number;
}

export interface CreateReviewParams {
  estimateId: string;
  userId: string;
  rating?: number | undefined;
  content?: string | undefined;
}

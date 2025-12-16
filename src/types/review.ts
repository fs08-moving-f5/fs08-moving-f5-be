import { ServiceEnum, EstimateStatus } from '../generated/enums';

export type ReviewSort = 'latest';

export interface getReviewWrittenParams {
  userId: string;
  sort?: ReviewSort;
  offset?: number | string;
  limit?: number | string;
}

export interface WrittenReviewItem {
  rating: number;
  content: string;
  createdAt: Date;
  price: number | null;
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

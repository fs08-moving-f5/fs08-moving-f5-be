import { ServiceEnum, EstimateStatus } from '../generated/enums';

export type EstimateSort = 'latest' | 'oldest' | 'moving-latest' | 'moving-oldest';

export interface GetEstimateRequestsParams {
  driverId: string;
  movingType?: ServiceEnum;
  movingDate?: Date;
  isDesignated?: boolean;
  status?: EstimateStatus;
  serviceRegionFilter?: boolean; // 체크박스 상태

  search?: string;
  sort?: EstimateSort;
  cursor?: string | null;
  take?: number | string;
}

export interface CreateEstimateParams {
  estimateRequestId: string;
  price: number;
  comment: string;
  driverId: string;
}

export interface CreateEstimateRejectParams {
  estimateRequestId: string;
  rejectReason: string;
  driverId: string;
}

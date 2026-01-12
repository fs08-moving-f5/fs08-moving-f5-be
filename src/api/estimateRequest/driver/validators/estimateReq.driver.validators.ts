import { z } from 'zod';
import { EstimateSort } from '@/types/driverEstimate';
import { EstimateStatus, ServiceEnum } from '@/generated/enums';

// pagination
export const cursorPaginationValidator = z.object({
  cursor: z.string().uuid('유효하지 않은 커서입니다').optional(),
  take: z.coerce.number().min(1).max(100).optional(),
});

// 받은 요청 목록 조회
export const getEstimateRequestsQueryValidator = cursorPaginationValidator.extend({
  movingTypes: z.union([z.array(z.nativeEnum(ServiceEnum)), z.nativeEnum(ServiceEnum)]).optional(),
  isDesignated: z.coerce.boolean().optional(),
  serviceRegionFilter: z.coerce.boolean().optional(),
  search: z.string().min(1).optional(),
  sort: z.enum(['latest', 'oldest', 'moving-latest', 'moving-oldest']).optional(),
});

// 견적 생성 및 반려
export const estimateRequestIdParamsValidator = z.object({
  estimateRequestId: z.string().uuid('유효하지 않은 견적 요청 ID입니다'),
});

export const createEstimateBodyValidator = z.object({
  price: z.coerce.number().positive('견적 금액은 0보다 커야 합니다'),
  comment: z.string().min(1, '코멘트는 필수입니다'),
});

export const createEstimateRejectBodyValidator = z.object({
  rejectReason: z.string().min(1, '반려 사유는 필수입니다'),
});

// 확정 견적 + 반려 견적 목록 조회
export const getEstimateListQueryValidator = cursorPaginationValidator.extend({
  sort: z.enum(['latest']).optional(),
});

export const estimateIdParamsValidator = z.object({
  estimateId: z.string().uuid('유효하지 않은 견적 ID입니다'),
});

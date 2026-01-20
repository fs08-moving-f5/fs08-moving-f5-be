import { z } from 'zod';
import { EstimateSort } from '@/types/driverEstimate';

const MIN_ESTIMATE_PRICE = 10_000; // 1만원
const MAX_ESTIMATE_PRICE = 100_000_000_000; //1천억

// 공통 cursor/take
const paginationSchema = {
  cursor: z.string().uuid().optional().nullable(),
  take: z.coerce.number().int().positive().max(50).optional(),
};

// 받은 요청 목록
export const getEstimateRequestsSchema = z.object({
  search: z.string().min(1).optional(),
  sort: z.enum(['latest', 'oldest', 'moving-latest', 'moving-oldest']).optional(),
  ...paginationSchema,
});

// 견적 생성
export const createEstimateSchema = z.object({
  params: z.object({
    estimateRequestId: z.string().uuid(),
  }),
  body: z.object({
    price: z.number().int('견적가는 정수여야 합니다.').min(MIN_ESTIMATE_PRICE, '견적가는 최소 10만원 이상이어야 합니다.')
    .max(MAX_ESTIMATE_PRICE, '견적가는 최대 1,000만원을 초과할 수 없습니다.').positive(),
    comment: z.string().trim().min(10, '코멘트는 최소 10자 이상 입력해야 합니다.').max(500, '견적 설명은 500자를 초과할 수 없습니다.'),
  }),
});

// 견적 반려
export const createEstimateRejectSchema = z.object({
  params: z.object({
    estimateRequestId: z.string().uuid(),
  }),
  body: z.object({
    rejectReason: z.string().trim().min(10, '반려 사유는 최소 10자 이상 입력해야 합니다.').max(300, '반려 사유는 300자를 초과할 수 없습니다.'),
  }),
});

// 확정/반려 목록
export const getEstimateListSchema = z.object({
  sort: z.enum(['latest']).optional(),
  ...paginationSchema,
});

// 확정 상세
export const getConfirmedEstimateDetailSchema = z.object({
  estimateId: z.string().uuid(),
});

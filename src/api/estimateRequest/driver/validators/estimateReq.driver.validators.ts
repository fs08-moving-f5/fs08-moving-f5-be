import { z } from 'zod';
import { EstimateSort } from '../../../../types/driverEstimate.js';

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
    price: z.number().int().positive(),
    comment: z.string().min(1).max(500),
  }),
});

// 견적 반려
export const createEstimateRejectSchema = z.object({
  params: z.object({
    estimateRequestId: z.string().uuid(),
  }),
  body: z.object({
    rejectReason: z.string().min(1).max(300),
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

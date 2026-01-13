import { z } from 'zod';

// pagination 공통
export const paginationQueryValidator = z.object({
  offset: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

// reviewId param
export const reviewIdParamsValidator = z.object({
  reviewId: z.string().uuid({
    message: '유효하지 않은 리뷰 ID입니다.',
  }),
});

// 리뷰 작성 body
export const updateReviewBodyValidator = z.object({
  rating: z.coerce.number().min(1).max(5),
  content: z.string().min(1, '리뷰 내용은 필수입니다'),
});

export type PaginationQuery = z.infer<typeof paginationQueryValidator>;
export type ReviewIdParams = z.infer<typeof reviewIdParamsValidator>;
export type UpdateReviewBody = z.infer<typeof updateReviewBodyValidator>;

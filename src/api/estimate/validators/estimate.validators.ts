import { z } from 'zod';

export const receiveEstimateRequestQueryValidator = z
  .object({
    cursor: z
      .string()
      .uuid({
        message: '유효하지 않은 커서입니다. 유효한 커서를 선택해주세요.',
      })
      .optional(),
    limit: z.number().min(1).max(100).default(15).optional(),
  })
  .optional();

export const estimateIdParamsValidator = z.object({
  estimateId: z.string().uuid({
    message: '유효하지 않은 견적 ID입니다. 유효한 견적 ID를 선택해주세요.',
  }),
});

export type ReceiveEstimateRequestQueryValidator = z.infer<
  typeof receiveEstimateRequestQueryValidator
>;
export type EstimateIdParamsValidator = z.infer<typeof estimateIdParamsValidator>;

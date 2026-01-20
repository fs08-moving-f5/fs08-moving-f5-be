import { z } from 'zod';

export const getFavoriteDriversQueryValidator = z
  .object({
    cursor: z
      .string()
      .uuid({
        message: '유효하지 않은 커서입니다. 유효한 커서를 선택해주세요.',
      })
      .optional(),
    limit: z.coerce.number().min(1).max(100).default(10).optional(),
  })
  .optional();

export const deleteManyFavoriteDriverBodyValidator = z
  .array(
    z.string().uuid({
      message: '유효하지 않은 드라이버 ID입니다. 유효한 드라이버 ID를 선택해주세요.',
    }),
  )
  .min(1, '최소 1개 이상의 드라이버 ID가 필요합니다.');

export const driverIdParamsValidator = z.object({
  driverId: z.string().uuid({
    message: '유효하지 않은 드라이버 ID입니다. 유효한 드라이버 ID를 선택해주세요.',
  }),
});

export type GetFavoriteDriversQueryValidator = z.infer<typeof getFavoriteDriversQueryValidator>;

export type DeleteManyFavoriteDriverBodyValidator = z.infer<
  typeof deleteManyFavoriteDriverBodyValidator
>;

export type DriverIdParamsValidator = z.infer<typeof driverIdParamsValidator>;

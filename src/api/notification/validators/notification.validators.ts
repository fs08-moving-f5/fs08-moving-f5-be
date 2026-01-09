import { z } from 'zod';

export const notificationIdParamsValidator = z.object({
  id: z.string().uuid({
    message: '유효하지 않은 알림 ID입니다. 유효한 알림 ID를 선택해주세요.',
  }),
});

export type NotificationIdParamsValidator = z.infer<typeof notificationIdParamsValidator>;

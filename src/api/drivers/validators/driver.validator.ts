import { z } from 'zod';

export const getDriversQueryValidator = z.object({
  region: z
    .enum(
      [
        'seoul',
        'gyeonggi',
        'incheon',
        'gangwon',
        'chungbuk',
        'chungnam',
        'daejeon',
        'sejong',
        'jeonbuk',
        'jeonnam',
        'gwangju',
        'gyeongbuk',
        'gyeongnam',
        'daegu',
        'busan',
        'ulsan',
        'jeju',
      ],
      {
        message: '유효하지 않은 지역입니다. 유효한 지역 중 하나를 선택해주세요.',
      },
    )
    .optional(),
  service: z
    .enum(['SMALL_MOVING', 'HOME_MOVING', 'OFFICE_MOVING'], {
      message: '유효하지 않은 서비스입니다. 유효한 서비스 중 하나를 선택해주세요.',
    })
    .optional(),
  sort: z
    .enum(['review', 'rating', 'career', 'confirmed-estimate'], {
      message: '유효하지 않은 정렬 기준입니다. 유효한 정렬 기준 중 하나를 선택해주세요.',
    })
    .optional(),
  cursor: z
    .string()
    .uuid({
      message: '유효하지 않은 커서입니다. 유효한 커서를 선택해주세요.',
    })
    .optional(),
  limit: z.coerce.number().min(1).max(100).default(15).optional(),
  search: z.string().optional(),
});

export type GetDriversQueryValidator = z.infer<typeof getDriversQueryValidator>;

export const updateDriverOfficeBodyValidator = z.object({
  officeAddress: z.string().min(1, '사무실 주소는 필수입니다'),
  officeZoneCode: z.string().optional(),
  officeSido: z.string().optional(),
  officeSigungu: z.string().optional(),
});

export type UpdateDriverOfficeBodyValidator = z.infer<typeof updateDriverOfficeBodyValidator>;

export const getNearbyRequestsQueryValidator = z.object({
  radiusKm: z.coerce.number().min(0).max(200).default(20).optional(),
});

export type GetNearbyRequestsQueryValidator = z.infer<typeof getNearbyRequestsQueryValidator>;

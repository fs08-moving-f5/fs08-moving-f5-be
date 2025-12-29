import { z } from 'zod';
import { RegionEnum, ServiceEnum } from '@/generated/enums';

// RegionEnum 배열 검증 스키마
export const regionsSchema = z
  .array(z.nativeEnum(RegionEnum, { message: '유효하지 않은 지역입니다' }))
  .min(1, '최소 1개 이상의 지역을 선택해야 합니다')
  .max(17, '최대 17개 지역까지 선택 가능합니다');

// ServiceEnum 배열 검증 스키마
export const servicesSchema = z
  .array(z.nativeEnum(ServiceEnum, { message: '유효하지 않은 서비스입니다' }))
  .min(1, '최소 1개 이상의 서비스를 선택해야 합니다')
  .max(3, '최대 3개 서비스까지 선택 가능합니다');

// 이미지 URL 검증 스키마 (선택적)
export const imageUrlSchema = z.string().url('올바른 URL 형식이 아닙니다').optional();

// ========== UserProfile Validators ==========

// 유저 프로필 생성 스키마
export const createUserProfileSchema = z.object({
  imageUrl: imageUrlSchema,
  regions: regionsSchema,
  services: servicesSchema,
});

// 유저 프로필 수정 스키마 (모든 필드 선택적)
export const updateUserProfileSchema = z.object({
  imageUrl: imageUrlSchema.or(z.literal(null)), // null 허용
  regions: regionsSchema.optional(),
  services: servicesSchema.optional(),
});

// ========== DriverProfile Validators ==========

// 기사 프로필 생성 스키마
export const createDriverProfileSchema = z.object({
  imageUrl: imageUrlSchema,
  career: z
    .string()
    .regex(/^[0-9]*$/, '숫자만 입력해주세요.')
    .max(500, '경력은 최대 500자까지 입력 가능합니다')
    .optional(),
  shortIntro: z
    .string()
    .min(8, '8자 이상 입력해주세요.')
    .max(100, '한줄 소개는 최대 100자까지 입력 가능합니다')
    .optional(),
  description: z
    .string()
    .min(10, '10자 이상 입력해주세요.')
    .max(2000, '상세 설명은 최대 2000자까지 입력 가능합니다')
    .optional(),
  regions: regionsSchema,
  services: servicesSchema,
});

// 기사 프로필 수정 스키마 (모든 필드 선택적)
export const updateDriverProfileSchema = z.object({
  imageUrl: imageUrlSchema.or(z.literal(null)), // null 허용
  career: z
    .string()
    .regex(/^[0-9]*$/, '숫자만 입력해주세요.')
    .max(500, '경력은 최대 500자까지 입력 가능합니다')
    .optional()
    .or(z.literal(null)),
  shortIntro: z
    .string()
    .min(8, '8자 이상 입력해주세요.')
    .max(100, '한줄 소개는 최대 100자까지 입력 가능합니다')
    .optional()
    .or(z.literal(null)),
  description: z
    .string()
    .min(10, '10자 이상 입력해주세요.')
    .max(2000, '상세 설명은 최대 2000자까지 입력 가능합니다')
    .optional()
    .or(z.literal(null)),
  regions: regionsSchema.optional(),
  services: servicesSchema.optional(),
});

// 타입 추출
export type CreateUserProfileInput = z.infer<typeof createUserProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type CreateDriverProfileInput = z.infer<typeof createDriverProfileSchema>;
export type UpdateDriverProfileInput = z.infer<typeof updateDriverProfileSchema>;

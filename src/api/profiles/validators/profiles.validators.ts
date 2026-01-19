import { z } from 'zod';
import { RegionEnum, ServiceEnum } from '../../../generated/enums.js';
import { passwordSchema } from '../../auth/validators/auth.validators.js';

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

// 이미지 Key 검증 스키마 (선택적)
// - 버킷을 private로 두기 위해 DB에는 URL이 아닌 S3 Object Key를 저장합니다.
// - data: URL(베이스64) 저장을 막습니다.
export const imageUrlSchema = z
  .string()
  .min(1, '이미지 key가 비어있습니다')
  .max(2048, '이미지 key가 너무 깁니다')
  .refine((v) => !v.toLowerCase().startsWith('data:'), {
    message: 'data URL은 허용하지 않습니다',
  })
  .refine(
    (v) => !(v.toLowerCase().startsWith('http://') || v.toLowerCase().startsWith('https://')),
    {
      message: 'URL이 아닌 S3 object key를 전달해주세요',
    },
  )
  .refine((v) => v.startsWith('profile/profile-images/') || v.startsWith('profile-images/'), {
    message: '프로필 이미지 key 형식이 올바르지 않습니다',
  })
  .optional();

// ========== UserProfile Validators ==========

// 유저 프로필 생성 스키마
export const createUserProfileSchema = z.object({
  imageUrl: imageUrlSchema,
  regions: regionsSchema,
  services: servicesSchema,
});

// 유저 프로필 수정 스키마 (모든 필드 선택적)
export const updateUserProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, '이름은 최소 2자 이상이어야 합니다')
      .max(100, '이름은 최대 100자까지 입력 가능합니다')
      .optional(),
    email: z.string().email('올바른 이메일 형식이 아닙니다').optional(),
    phone: z
      .string()
      .regex(/^[0-9-]+$/, '숫자만 입력해 주세요')
      .min(10, '전화번호는 최소 10자 이상이어야 합니다')
      .max(13, '전화번호는 최대 13자까지 허용합니다')
      .optional(),
    imageUrl: imageUrlSchema.or(z.literal(null)), // null 허용
    regions: regionsSchema.optional(),
    services: servicesSchema.optional(),
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요').optional(),
    newPassword: passwordSchema.optional(),
  })
  .refine(
    (data) => {
      // 새 비밀번호가 있으면 현재 비밀번호도 필수
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: '새 비밀번호를 변경하려면 현재 비밀번호를 입력해주세요',
      path: ['currentPassword'],
    },
  );

// ========== DriverProfile Validators ==========

// 기사 프로필 생성 스키마
export const createDriverProfileSchema = z.object({
  imageUrl: imageUrlSchema,
  career: z
    .number()
    .int('정수만 입력해주세요.')
    .min(0, '경력은 0 이상이어야 합니다')
    .max(100, '경력은 최대 100년까지 입력 가능합니다')
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
export const updateDriverProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, '이름은 최소 2자 이상이어야 합니다')
      .max(100, '이름은 최대 100자까지 입력 가능합니다')
      .optional(),
    email: z.string().email('올바른 이메일 형식이 아닙니다').optional(),
    phone: z
      .string()
      .regex(/^[0-9-]+$/, '숫자만 입력해 주세요')
      .min(10, '전화번호는 최소 10자 이상이어야 합니다')
      .max(13, '전화번호는 최대 13자까지 허용합니다')
      .optional(),
    imageUrl: imageUrlSchema.or(z.literal(null)), // null 허용
    career: z
      .number()
      .int('정수만 입력해주세요.')
      .min(0, '경력은 0 이상이어야 합니다')
      .max(100, '경력은 최대 100년까지 입력 가능합니다')
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
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요').optional(),
    newPassword: passwordSchema.optional(),
  })
  .refine(
    (data) => {
      // 새 비밀번호가 있으면 현재 비밀번호도 필수
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: '새 비밀번호를 변경하려면 현재 비밀번호를 입력해주세요',
      path: ['currentPassword'],
    },
  );

// 타입 추출
export type CreateUserProfileInput = z.infer<typeof createUserProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type CreateDriverProfileInput = z.infer<typeof createDriverProfileSchema>;
export type UpdateDriverProfileInput = z.infer<typeof updateDriverProfileSchema>;

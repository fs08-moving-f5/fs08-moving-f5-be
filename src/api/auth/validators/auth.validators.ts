import { z } from 'zod';
import { UserType } from '@/generated/client';

// 이메일 유효성 검사
export const emailSchema = z
  .string()
  .email('올바른 이메일 형식이 아닙니다')
  .min(1, '이메일은 필수입니다');

// 비밀번호 유효성 검사 (최소 8자, 영문, 숫자, 특수문자 포함)
export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .regex(/[a-zA-Z]/, '비밀번호는 영문을 포함해야 합니다')
  .regex(/[0-9]/, '비밀번호는 숫자를 포함해야 합니다')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, '비밀번호는 특수문자를 포함해야 합니다');

// 전화번호 유효성 검사 (숫자만 허용 및 변환)
export const phoneSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, '')); // 숫자 외 모든 문자 제거


// 이름 유효성 검사
export const nameSchema = z.string().min(2, '이름은 최소 2자 이상이어야 합니다');

// 유저 타입 유효성 검사
export const userTypeSchema = z.nativeEnum(UserType, {
  message: '유효하지 않은 유저 타입입니다',
});

// 회원가입 스키마
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  phone: phoneSchema,
  type: userTypeSchema.default(UserType.USER),
});

// 로그인 스키마
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호는 필수입니다'),
  type: userTypeSchema.default(UserType.USER),
});

// 토큰 갱신 스키마
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, '리프레시 토큰이 필요합니다'),
});

// 타입 추출
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

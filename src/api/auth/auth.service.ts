import {
  findUserByEmailRepository,
  findUserByIdRepository,
  createUserRepository,
  updateRefreshTokenRepository,
} from './auth.repository';
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyRefreshToken,
} from './utils/auth.utils';
import { LoginResponse, UserResponse, TokenResponse } from '@/types/auth';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';

import type { User, UserType } from '@/generated/client';

// User를 UserResponse로 변환하는 헬퍼 함수
const toUserResponse = (user: User): UserResponse => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    type: user.type,
    provider: user.provider,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// 일반 회원가입
export const signupService = async (data: {
  email: string;
  password: string;
  name: string;
  phone: string;
  type: UserType;
}): Promise<LoginResponse> => {
  // 이메일 중복 체크
  const existingUser = await findUserByEmailRepository(data.email);
  if (existingUser) {
    throw new AppError('이미 존재하는 이메일입니다', HTTP_STATUS.CONFLICT);
  }

  // 비밀번호 해싱
  const hashedPassword = await hashPassword(data.password);

  // 유저 생성
  const user = await createUserRepository({
    ...data,
    password: hashedPassword,
  });

  // 토큰 생성
  const tokens = generateTokens(user.id, user.email, user.type);

  // 리프레시 토큰 저장
  await updateRefreshTokenRepository(user.id, tokens.refreshToken);

  return {
    user: toUserResponse(user),
    tokens,
  };
};

// 일반 로그인
export const loginService = async (
  email: string,
  password: string,
  type: UserType,
): Promise<LoginResponse> => {
  // 유저 조회
  const user = await findUserByEmailRepository(email); // 서비스가 validation 체크하기 - 고민해보기 << 현상유지
  if (!user) {
    // 메세지를 백엔드에서 or 프론트엔드에서? ex)토스 << 개발자에게만 보여주는 메세지로 남겨놓기 (프론트에서 관리)
    throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다', HTTP_STATUS.UNAUTHORIZED);
  }

  // 유저 타입 확인
  if (user.type !== type) {
    throw new AppError('유저 타입이 일치하지 않습니다', HTTP_STATUS.FORBIDDEN);
  }

  // 비밀번호 확인
  if (!user.password) {
    throw new AppError('소셜 로그인 계정입니다', HTTP_STATUS.BAD_REQUEST);
  }

  const isPasswordValid = await verifyPassword(user.password, password);
  if (!isPasswordValid) {
    throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다', HTTP_STATUS.UNAUTHORIZED);
  }

  // 토큰 생성
  const tokens = generateTokens(user.id, user.email, user.type);

  // 리프레시 토큰 저장
  await updateRefreshTokenRepository(user.id, tokens.refreshToken);

  return {
    user: toUserResponse(user),
    tokens,
  };
};

// 로그아웃
export const logoutService = async (userId: string): Promise<void> => {
  await updateRefreshTokenRepository(userId, null);
};

// 토큰 갱신
export const refreshTokenService = async (refreshToken: string): Promise<TokenResponse> => {
  try {
    // 리프레시 토큰 검증
    const payload = verifyRefreshToken(refreshToken);

    // 유저 조회
    const user = await findUserByIdRepository(payload.userId);
    if (!user) {
      throw new AppError('유저를 찾을 수 없습니다', HTTP_STATUS.NOT_FOUND);
    }

    // 저장된 리프레시 토큰과 비교
    if (user.refreshTokens !== refreshToken) {
      throw new AppError('유효하지 않은 리프레시 토큰입니다', HTTP_STATUS.UNAUTHORIZED);
    }

    // 새 토큰 생성
    const tokens = generateTokens(user.id, user.email, user.type);

    // 새 리프레시 토큰 저장
    await updateRefreshTokenRepository(user.id, tokens.refreshToken);

    return tokens;
  } catch (error) {
    throw new AppError('토큰 갱신에 실패했습니다', HTTP_STATUS.UNAUTHORIZED);
  }
};

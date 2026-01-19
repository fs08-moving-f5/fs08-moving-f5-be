import { UserType } from '../generated/enums.js';

// JWT 토큰 페이로드
export interface JwtPayload {
  userId: string;
  email: string;
  type: UserType;
  iat?: number;
  exp?: number;
}

// 토큰 응답
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// 유저 응답 (비밀번호 제외)
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  type: UserType;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
  hasProfile?: boolean;
}

// 로그인 응답
export interface LoginResponse {
  user: UserResponse;
  tokens: TokenResponse;
}

import jwt, { SignOptions } from 'jsonwebtoken';
import argon2 from 'argon2';
import { env } from '@/config/env';
import { JwtPayload, TokenResponse } from '@/types/auth';
import { UserType } from '@/generated/client';

// 비밀번호 해싱
export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password);
};

// 비밀번호 검증
export const verifyPassword = async (hash: string, password: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
};

// Access Token 생성
export const generateAccessToken = (userId: string, email: string, type: UserType): string => {
  const payload: JwtPayload = {
    userId,
    email,
    type,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

// Refresh Token 생성
export const generateRefreshToken = (userId: string, email: string, type: UserType): string => {
  const payload: JwtPayload = {
    userId,
    email,
    type,
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

// 토큰 쌍 생성
export const generateTokens = (userId: string, email: string, type: UserType): TokenResponse => {
  return {
    accessToken: generateAccessToken(userId, email, type),
    refreshToken: generateRefreshToken(userId, email, type),
  };
};

// Access Token 검증
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

// Refresh Token 검증
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};

// 토큰에서 페이로드 추출 (검증 없이)
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};

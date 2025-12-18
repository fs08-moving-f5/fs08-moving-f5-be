import { signupService, loginService, logoutService, refreshTokenService } from './auth.service';
import { signupSchema, loginSchema } from './validators/auth.validators';
import AppError from '@/utils/AppError';
import { env } from '@/config/env';
import asyncHandler from '@/middlewares/asyncHandler';
import HTTP_STATUS from '@/constants/http.constant';

import type { Request, Response } from 'express';

// 회원가입
export const signupController = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = signupSchema.parse(req.body);

  const result = await signupService(validatedData);

  // 리프레시 토큰은 httpOnly 쿠키로 설정
  res.cookie('refreshToken', result.tokens.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
});

// 로그인
export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, type } = loginSchema.parse(req.body);

  const result = await loginService(email, password, type);

  // 리프레시 토큰은 httpOnly 쿠키로 설정
  res.cookie('refreshToken', result.tokens.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
  });

  res.json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
});

// 로그아웃
export const logoutController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('인증이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
  }

  await logoutService(req.user.id);

  // 쿠키 삭제
  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: '로그아웃되었습니다',
  });
});

// 토큰 갱신
export const refreshTokenController = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;  // 쿠키에서 리프레시 토큰 가져오기

  if (!refreshToken) {
    throw new AppError('리프레시 토큰이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
  }

  const tokens = await refreshTokenService(refreshToken);

  // 새 리프레시 토큰은 httpOnly 쿠키로 설정
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
  });

  res.status(HTTP_STATUS.OK).json({ // status 추가
    success: true,
    data: {
      accessToken: tokens.accessToken,
    },
  });
});

// 현재 유저 정보 조회
export const getMeController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('인증이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
  }

  res.json({
    success: true,
    data: req.user,
  });
});

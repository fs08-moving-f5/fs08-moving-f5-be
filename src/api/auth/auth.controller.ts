import {
  signupService,
  loginService,
  logoutService,
  logoutByRefreshTokenService,
  refreshTokenService,
} from './auth.service';
import { oauthLoginService } from './auth.service';
import { signupSchema, loginSchema } from './validators/auth.validators';
import AppError from '@/utils/AppError';
import asyncHandler from '@/middlewares/asyncHandler';
import HTTP_STATUS from '@/constants/http.constant';
import { getRefreshTokenCookieOptions, getClearCookieOptions } from '@/utils/cookieOptions';
import passport from 'passport';
import { env } from '@/config/env';
import type { OAuthProfile, OAuthProvider, OAuthUserType } from './strategies/passport';
import { decodeOAuthState, encodeOAuthState } from './utils/oauth.utils';

import type { Request, Response } from 'express';

// 회원가입
export const signupController = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = signupSchema.parse(req.body);

  const result = await signupService(validatedData);

  // 리프레시 토큰은 httpOnly 쿠키로 설정
  res.cookie('refreshToken', result.tokens.refreshToken, getRefreshTokenCookieOptions());

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
  res.cookie('refreshToken', result.tokens.refreshToken, getRefreshTokenCookieOptions());

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
  const refreshToken = req.cookies.refreshToken;

  // 인증/쿠키가 없거나 이미 로그아웃된 상태여도 성공 처리(idempotent)
  if (req.user?.id && refreshToken) {
    try {
      await logoutService(req.user.id, refreshToken);
    } catch {
      // 중복 호출/토큰 만료 등: 쿠키 삭제로 로그아웃 완료로 간주
    }
  } else if (refreshToken) {
    await logoutByRefreshTokenService(refreshToken);
  }

  // 쿠키 삭제
  res.clearCookie('refreshToken', getClearCookieOptions());

  res.status(HTTP_STATUS.NO_CONTENT).send();
});

// 토큰 갱신
export const refreshTokenController = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken; // 쿠키에서 리프레시 토큰 가져오기

  if (!refreshToken) {
    throw new AppError('리프레시 토큰이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
  }

  const tokens = await refreshTokenService(refreshToken);

  // 새 리프레시 토큰은 httpOnly 쿠키로 설정
  res.cookie('refreshToken', tokens.refreshToken, getRefreshTokenCookieOptions());

  res.status(HTTP_STATUS.OK).json({
    // status 추가
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

  const user = req.user;
  const hasProfile = Boolean(
    (user.type === 'USER' && user.userProfile) ||
    (user.type === 'DRIVER' && user.driverProfile)
  );

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      type: user.type,
      provider: user.provider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      hasProfile: hasProfile,
    },
  });
});

const getPassportOptions = (provider: OAuthProvider, state: string) => {
  if (provider === 'google') {
    return { scope: ['profile', 'email'], state };
  }
  if (provider === 'kakao') {
    return { scope: ['account_email', 'profile_nickname'], state };
  }

  return { scope: ['email'], state };
};

export const oauthStartController = asyncHandler(async (req: Request, res: Response) => {
  const provider = req.params.provider as OAuthProvider;
  const type = (req.query.type as OAuthUserType) ?? 'USER';

  if (provider !== 'google' && provider !== 'kakao' && provider !== 'naver') {
    throw new AppError('지원하지 않는 소셜 로그인 제공자입니다', HTTP_STATUS.BAD_REQUEST);
  }

  if (type !== 'USER' && type !== 'DRIVER') {
    throw new AppError('유저 타입이 올바르지 않습니다', HTTP_STATUS.BAD_REQUEST);
  }

  const state = encodeOAuthState({ type });
  const options = getPassportOptions(provider, state);

  return passport.authenticate(provider, options)(req, res);
});

export const oauthCallbackController = asyncHandler(async (req: Request, res: Response) => {
  const provider = req.params.provider as OAuthProvider;

  if (provider !== 'google' && provider !== 'kakao' && provider !== 'naver') {
    throw new AppError('지원하지 않는 소셜 로그인 제공자입니다', HTTP_STATUS.BAD_REQUEST);
  }

  const stateData = decodeOAuthState(req.query.state);
  const type = stateData?.type ?? 'USER';

  return passport.authenticate(
    provider,
    { session: false },
    async (err: unknown, profile: OAuthProfile | undefined) => {
      if (err) {
        throw new AppError('소셜 로그인에 실패했습니다', HTTP_STATUS.UNAUTHORIZED);
      }

      if (!profile) {
        throw new AppError('소셜 로그인 정보가 없습니다', HTTP_STATUS.UNAUTHORIZED);
      }

      const result = await oauthLoginService({ profile, type });

      res.cookie('refreshToken', result.tokens.refreshToken, getRefreshTokenCookieOptions());

      const redirectUrl = new URL('/oauth/callback', env.CORS_ORIGIN);
      redirectUrl.searchParams.set('accessToken', result.tokens.accessToken);

      res.redirect(redirectUrl.toString());
    },
  )(req, res);
});

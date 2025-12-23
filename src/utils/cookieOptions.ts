import { env } from '@/config/env';
import type { CookieOptions } from 'express';

const dayNum = 24 * 60 * 60 * 1000;
const refreshTokenExpireDay = parseInt(env.JWT_REFRESH_EXPIRES_IN) * dayNum;

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'strict',
  maxAge: refreshTokenExpireDay,
});

export const getClearCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'strict',
});

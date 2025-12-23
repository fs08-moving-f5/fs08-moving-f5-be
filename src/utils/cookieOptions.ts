import { env } from '@/config/env';
import type { CookieOptions } from 'express';

const dayNum = 24 * 60 * 60 * 1000;
const refreshTokenExpireDay = parseInt(env.JWT_REFRESH_EXPIRES_IN) * dayNum;

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: true,
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'none',
  maxAge: refreshTokenExpireDay,
});

export const getClearCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: true,
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'none',
});

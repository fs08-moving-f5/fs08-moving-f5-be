import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';

const normalizeOrigin = (value: string): string | null => {
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return null;
  }
};

export const getAllowedFrontendOrigins = (corsOrigin: string): string[] => {
  if (corsOrigin === '*') return ['*'];
  return corsOrigin
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
};

export const ensureRedirectOriginAllowed = (
  candidate: string | undefined,
  corsOrigin: string,
): string | undefined => {
  if (!candidate) return undefined;

  const normalized = normalizeOrigin(candidate);
  if (!normalized) {
    throw new AppError('redirectOrigin 값이 올바른 URL이 아닙니다', HTTP_STATUS.BAD_REQUEST);
  }

  const allowed = getAllowedFrontendOrigins(corsOrigin);
  if (allowed.includes('*')) return normalized;

  const allowedNormalized = allowed.map(normalizeOrigin).filter((v): v is string => Boolean(v));

  if (!allowedNormalized.includes(normalized)) {
    throw new AppError('허용되지 않은 redirectOrigin 입니다', HTTP_STATUS.BAD_REQUEST);
  }

  return normalized;
};

export const getOAuthRedirectBaseOrigin = (
  corsOrigin: string,
  redirectOriginFromState?: string,
): string => {
  const safeRedirectOrigin = ensureRedirectOriginAllowed(redirectOriginFromState, corsOrigin);
  if (safeRedirectOrigin) return safeRedirectOrigin;

  const allowed = getAllowedFrontendOrigins(corsOrigin);
  const first = allowed[0];
  const normalized = first ? normalizeOrigin(first) : null;
  return normalized || '';
};

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '@/config/env';

export type OAuthProvider = 'google' | 'kakao' | 'naver';
export type OAuthUserType = 'USER' | 'DRIVER';

export interface OAuthProfile {
  provider: OAuthProvider;
  providerId: string;
  email: string | null;
  name: string | null;
}

let isConfigured = false;

const toSafeString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const configurePassport = () => {
  if (isConfigured) return;
  isConfigured = true;

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${env.SERVER_URL}/api/auth/oauth/google/callback`,
        },
        (_accessToken, _refreshToken, profile, done) => {
          const email = toSafeString(profile.emails?.[0]?.value);
          const name = toSafeString(profile.displayName);

          const payload: OAuthProfile = {
            provider: 'google',
            providerId: profile.id,
            email,
            name,
          };

          done(null, payload);
        },
      ),
    );
  }

  if (env.KAKAO_CLIENT_ID) {
    // passport-kakao / passport-naver-v2는 타입 정의가 불완전할 수 있어 런타임 호환 위주로 처리합니다.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const KakaoPkg = require('passport-kakao');
    const KakaoStrategy = (KakaoPkg?.Strategy ?? KakaoPkg?.default ?? KakaoPkg) as any;

    passport.use(
      'kakao',
      new KakaoStrategy(
        {
          clientID: env.KAKAO_CLIENT_ID,
          clientSecret: env.KAKAO_CLIENT_SECRET,
          callbackURL: `${env.SERVER_URL}/api/auth/oauth/kakao/callback`,
        },
        (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
          const email = toSafeString(profile?._json?.kakao_account?.email);
          const name =
            toSafeString(profile?.displayName) ??
            toSafeString(profile?._json?.kakao_account?.profile?.nickname);

          const payload: OAuthProfile = {
            provider: 'kakao',
            providerId: String(profile?.id ?? ''),
            email,
            name,
          };

          done(null, payload);
        },
      ),
    );
  }

  if (env.NAVER_CLIENT_ID && env.NAVER_CLIENT_SECRET) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NaverPkg = require('passport-naver-v2');
    const NaverStrategy = (NaverPkg?.Strategy ?? NaverPkg?.default ?? NaverPkg) as any;

    passport.use(
      'naver',
      new NaverStrategy(
        {
          clientID: env.NAVER_CLIENT_ID,
          clientSecret: env.NAVER_CLIENT_SECRET,
          callbackURL: `${env.SERVER_URL}/api/auth/oauth/naver/callback`,
        },
        (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
          const email =
            toSafeString(profile?.emails?.[0]?.value) ??
            toSafeString(profile?._json?.email) ??
            toSafeString(profile?._json?.response?.email);

          const name =
            toSafeString(profile?.displayName) ??
            toSafeString(profile?._json?.name) ??
            toSafeString(profile?._json?.response?.name);

          const payload: OAuthProfile = {
            provider: 'naver',
            providerId: String(profile?.id ?? ''),
            email,
            name,
          };

          done(null, payload);
        },
      ),
    );
  }
};

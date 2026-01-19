import type { OAuthUserType } from '../strategies/passport.js';

export const encodeOAuthState = (data: { type: OAuthUserType; redirectOrigin?: string }) => {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
};

export const decodeOAuthState = (
  state: unknown,
): { type: OAuthUserType; redirectOrigin?: string } | null => {
  if (typeof state !== 'string' || state.length === 0) return null;

  try {
    const json = Buffer.from(state, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as { type?: unknown; redirectOrigin?: unknown };
    if (parsed.type === 'USER' || parsed.type === 'DRIVER') {
      return {
        type: parsed.type,
        redirectOrigin:
          typeof parsed.redirectOrigin === 'string' ? parsed.redirectOrigin : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
};

import type { OAuthUserType } from '../strategies/passport';

export const encodeOAuthState = (data: { type: OAuthUserType }) => {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
};

export const decodeOAuthState = (state: unknown): { type: OAuthUserType } | null => {
  if (typeof state !== 'string' || state.length === 0) return null;

  try {
    const json = Buffer.from(state, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as { type?: unknown };
    if (parsed.type === 'USER' || parsed.type === 'DRIVER') {
      return { type: parsed.type };
    }
    return null;
  } catch {
    return null;
  }
};

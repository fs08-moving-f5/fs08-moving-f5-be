import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { EMAIL_VERIFICATION_TOKEN_EXPIRES_IN } from '../emailVerification/emailVerification.constants';
import type { UserType } from '@/generated/client';

type EmailVerificationJwtPayload = {
  purpose: 'email_verify';
  userId: string;
  email: string;
  type: UserType;
  iat?: number;
  exp?: number;
};

export const generateEmailVerificationToken = (data: {
  userId: string;
  email: string;
  type: UserType;
}): string => {
  const payload: EmailVerificationJwtPayload = {
    purpose: 'email_verify',
    userId: data.userId,
    email: data.email,
    type: data.type,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: EMAIL_VERIFICATION_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyEmailVerificationToken = (token: string): EmailVerificationJwtPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET) as EmailVerificationJwtPayload;

  if (decoded.purpose !== 'email_verify') {
    throw new Error('Invalid token purpose');
  }

  return decoded;
};

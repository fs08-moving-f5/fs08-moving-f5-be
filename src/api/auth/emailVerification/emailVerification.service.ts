import { env } from '@/config/env';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';
import { logger } from '@/config/logger';
import { getMailer, getMailFrom } from '@/utils/mailer';
import {
  EMAIL_VERIFICATION_ALREADY_VERIFIED_MESSAGE,
  EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE,
  EMAIL_VERIFICATION_SEND_FAIL_MESSAGE,
  EMAIL_VERIFICATION_SUCCESS_MESSAGE,
} from './emailVerification.constants';
import {
  buildEmailVerificationMail,
  buildEmailVerificationUrl,
} from '../utils/emailVerificationEmail';
import {
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
} from '../utils/emailVerificationToken';
import { findUserByIdRepository, updateUserRepository } from '../auth.repository';
import { ensureFrontendOriginAllowed, getRedirectBaseOrigin } from '../utils/redirectOrigin.utils';

const getDefaultFrontendOrigin = (): string => {
  const base = getRedirectBaseOrigin(env.CORS_ORIGIN);
  return base || 'http://localhost:3000';
};

export const sendEmailVerificationEmailService = async (data: {
  userId: string;
  frontendOrigin?: string;
}): Promise<void> => {
  const user = await findUserByIdRepository(data.userId);

  if (!user) {
    throw new AppError('유저를 찾을 수 없습니다', HTTP_STATUS.NOT_FOUND);
  }

  if (user.isEmailVerified) {
    return;
  }

  const token = generateEmailVerificationToken({
    userId: user.id,
    email: user.email,
    type: user.type,
  });

  const frontendOrigin = data.frontendOrigin
    ? (ensureFrontendOriginAllowed(data.frontendOrigin, env.CORS_ORIGIN) ??
      getDefaultFrontendOrigin())
    : getDefaultFrontendOrigin();
  const verifyUrl = buildEmailVerificationUrl(frontendOrigin, token);
  const { subject, html } = buildEmailVerificationMail({ to: user.email, verifyUrl });

  try {
    const mailer = getMailer();

    await mailer.sendMail({
      from: getMailFrom(),
      to: user.email,
      subject,
      html,
    });
  } catch (error) {
    logger.error(`Failed to send verification email: ${user.email}`);
    throw new AppError(EMAIL_VERIFICATION_SEND_FAIL_MESSAGE, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const verifyEmailService = async (
  token: string,
): Promise<
  { message: string } & {
    userType: string;
  }
> => {
  try {
    const payload = verifyEmailVerificationToken(token);

    const user = await findUserByIdRepository(payload.userId);
    if (!user || user.email !== payload.email) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      return { message: EMAIL_VERIFICATION_ALREADY_VERIFIED_MESSAGE, userType: user.type };
    }

    await updateUserRepository(user.id, { isEmailVerified: true });

    return { message: EMAIL_VERIFICATION_SUCCESS_MESSAGE, userType: user.type };
  } catch {
    throw new AppError(EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE, HTTP_STATUS.BAD_REQUEST);
  }
};

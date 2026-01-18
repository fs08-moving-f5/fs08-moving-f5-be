import nodemailer from 'nodemailer';
import { env } from '@/config/env';

let cachedTransporter: nodemailer.Transporter | null = null;

const requireSmtpConfig = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP 설정이 필요합니다. (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)');
  }

  return { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS };
};

export const getMailer = (): nodemailer.Transporter => {
  if (cachedTransporter) return cachedTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = requireSmtpConfig();

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return cachedTransporter;
};

export const getMailFrom = (): string => {
  const from = env.SMTP_FROM;
  if (from) return from;

  const { SMTP_USER } = requireSmtpConfig();
  return SMTP_USER;
};

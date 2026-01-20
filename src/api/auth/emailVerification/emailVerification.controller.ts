import type { Request, Response } from 'express';
import { z } from 'zod';
import asyncHandler from '@/middlewares/asyncHandler';
import HTTP_STATUS from '@/constants/http.constant';
import { verifyEmailService } from './emailVerification.service';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'token is required'),
});

export const verifyEmailController = asyncHandler(async (req: Request, res: Response) => {
  const { token } = verifyEmailSchema.parse(req.body);

  const result = await verifyEmailService(token);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

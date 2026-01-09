import { ZodSchema, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';

const validateMiddleware = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const error = result.error as ZodError;

      // zod 에러 메시지를 추출하여 조합
      const errorMessages = error.issues.map((issue) => {
        const path = issue.path.join('.');
        return path ? `${path}: ${issue.message}` : issue.message;
      });

      const errorMessage =
        errorMessages.length > 0 ? errorMessages.join(', ') : '유효하지 않은 요청입니다.';

      return next(new AppError(errorMessage, HTTP_STATUS.BAD_REQUEST));
    }

    next();
  };
};

export default validateMiddleware;

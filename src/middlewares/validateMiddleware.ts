import { ZodSchema, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';

const createValidateMiddleware = (getData: (req: Request) => any) => {
  return (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const data = getData(req);
      const result = schema.safeParse(data);

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
};

// Query 파라미터 검증 (기본값, 기존 호환성 유지)
export const validateQueryMiddleware = createValidateMiddleware((req) => req.query);

// Params 검증
export const validateParamsMiddleware = createValidateMiddleware((req) => req.params);

// Body 검증
export const validateBodyMiddleware = createValidateMiddleware((req) => req.body);

// 기본 export는 query 검증 (기존 코드 호환성 유지)
const validateMiddleware = validateQueryMiddleware;

export default validateMiddleware;

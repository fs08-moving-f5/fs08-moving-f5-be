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
          const path = issue.path.length > 0 ? issue.path.join('.') : null;

          // 더 친절한 에러 메시지로 변환
          let message = issue.message;

          // invalid_type 에러 처리
          if (issue.code === 'invalid_type') {
            const invalidTypeIssue = issue as any; // ZodIssueInvalidType 타입
            if (invalidTypeIssue.received === 'undefined') {
              message = path ? `${path} 필드가 필요합니다` : '필수 데이터가 누락되었습니다';
            } else {
              message = path
                ? `${path} 필드는 ${invalidTypeIssue.expected} 타입이어야 합니다 (받은 값: ${invalidTypeIssue.received})`
                : `잘못된 타입입니다. ${invalidTypeIssue.expected} 타입이 필요합니다 (받은 값: ${invalidTypeIssue.received})`;
            }
          }

          if (path) {
            return `${path}: ${message}`;
          }
          return message;
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
export const validateQueryMiddleware = createValidateMiddleware((req) => {
  // req.query가 undefined인 경우 빈 객체로 처리하여 더 명확한 에러 메시지 제공
  if (req.query === undefined) {
    return {};
  }
  return req.query;
});

// Params 검증
export const validateParamsMiddleware = createValidateMiddleware((req) => {
  // req.params가 undefined인 경우 빈 객체로 처리하여 더 명확한 에러 메시지 제공
  if (req.params === undefined) {
    return {};
  }
  return req.params;
});

// Body 검증
export const validateBodyMiddleware = createValidateMiddleware((req) => {
  // req.body가 undefined인 경우 빈 객체로 처리하여 더 명확한 에러 메시지 제공
  if (req.body === undefined) {
    return {};
  }
  return req.body;
});

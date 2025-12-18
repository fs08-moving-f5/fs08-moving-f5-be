import { Request, Response, NextFunction } from 'express';
import { UserType } from '../generated/client';
import { verifyAccessToken } from '../api/auth/utils/auth.utils';
import AppError from '../utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';

// JWT 인증 미들웨어
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('인증 토큰이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.substring(7); // "Bearer " 제거

    // 토큰 검증
    const payload = verifyAccessToken(token);

    // 요청 객체에 유저 정보 추가
    req.user = {
      id: payload.userId,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('유효하지 않은 토큰입니다', HTTP_STATUS.UNAUTHORIZED);
  }
};

// 유저 타입 확인 미들웨어
export const authorizeUserType = (...allowedTypes: UserType[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('인증이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
    }

    // 토큰을 다시 검증하여 전체 payload 가져오기
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('인증 토큰이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    if (!allowedTypes.includes(payload.type)) {
      throw new AppError('접근 권한이 없습니다', HTTP_STATUS.FORBIDDEN);
    }

    next();
  };
};

// 일반 유저 전용 미들웨어
export const requireUser = authorizeUserType(UserType.USER);

// 기사님 전용 미들웨어
export const requireDriver = authorizeUserType(UserType.DRIVER);

// 관리자 전용 미들웨어
export const requireAdmin = authorizeUserType(UserType.ADMIN);

// 일반 유저 또는 기사님
export const requireUserOrDriver = authorizeUserType(UserType.USER, UserType.DRIVER);

import { Request, Response, NextFunction } from 'express';
import { findUserByIdRepository } from '@/api/auth/auth.repository';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';

export const loadUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('인증이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
    }

    // 데이터베이스에서 전체 유저 정보 조회
    const user = await findUserByIdRepository(req.user.id);

    if (!user) {
      throw new AppError('유저를 찾을 수 없습니다', HTTP_STATUS.NOT_FOUND);
    }

    // 비밀번호 제외하고 전체 유저 정보는 req.currentUser에 저장
    const { password, ...userWithoutPassword } = user;
    req.currentUser = userWithoutPassword;

    next();
  } catch (error) {
    next(error);
  }
};

import {
  getUserProfileService,
  getDriverProfileService,
  createUserProfileService,
  createDriverProfileService,
  updateUserProfileService,
  updateDriverProfileService,
  getDriverPublicProfileService,
  getProfileService,
} from './profiles.service';
import {
  createUserProfileSchema,
  updateUserProfileSchema,
  createDriverProfileSchema,
  updateDriverProfileSchema,
} from './validators/profiles.validators';
import AppError from '@/utils/AppError';
import asyncHandler from '@/middlewares/asyncHandler';
import HTTP_STATUS from '@/constants/http.constant';

import { mapNullableProfileImage } from '@/utils/profileImage';

import type { Request, Response } from 'express';
import type { User } from '@/generated/client';

// ========== Profile Image Presign Controllers ==========
export const createProfileImagePutPresignController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = res.locals.profileImagePutPresign;
    if (!data) {
      throw new AppError('presign 생성에 실패했습니다', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data,
    });
  },
);

// loadUser 미들웨어를 거친 후 req.currentUser는 전체 User 정보를 포함합니다

// ========== 공통 프로필 조회 (유저 타입에 따라 자동 조회) ==========
export const getMyProfileController = asyncHandler(async (req: Request, res: Response) => {
  // loadUser 미들웨어를 거쳐서 전체 user 정보가 있음
  const user = req.currentUser;
  if (!user) {
    throw new AppError('인증이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
  }

  const profile = await getProfileService(user.id, user.type);

  if (!profile) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: '프로필을 찾을 수 없습니다',
    });
    return;
  }

  const mappedProfile = await mapNullableProfileImage(profile);
  const profileAll = {
    ...(mappedProfile),
    name: user.name,
    email: user.email,
    phone: user.phone,
  } as any;

  res.json({
    success: true,
    data: profileAll,
  });
});

// ========== UserProfile Controllers ==========

// 유저 프로필 조회
export const getUserProfileController = asyncHandler(async (req: Request, res: Response) => {
  // loadUser 미들웨어를 거쳐서 전체 user 정보가 있음
  const user = req.currentUser;
  if (!user) {
    throw new AppError('인증이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
  }

  if (user.type !== 'USER') {
    throw new AppError('일반 유저만 접근할 수 있습니다', HTTP_STATUS.FORBIDDEN);
  }

  const profile = await getUserProfileService(user.id);

  if (!profile) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: '프로필을 찾을 수 없습니다',
    });
    return;
  }

  // user 필드 병합
  const mappedProfile = await mapNullableProfileImage(profile as any);
  const merged = {
    ...(mappedProfile as any),
    name: user.name,
    email: user.email,
    phone: user.phone,
  } as any;

  res.json({
    success: true,
    data: merged,
  });
});

// 유저 프로필 생성
export const createUserProfileController = asyncHandler(async (req: Request, res: Response) => {
  // loadUser 미들웨어를 거쳐서 전체 user 정보가 있음
  const user = req.currentUser;
  if (!user) {
    throw new AppError('인증이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
  }

  if (user.type !== 'USER') {
    throw new AppError('일반 유저만 접근할 수 있습니다', HTTP_STATUS.FORBIDDEN);
  }

  const validatedData = createUserProfileSchema.parse(req.body);

  const profile = await createUserProfileService(user.id, validatedData);
  const mappedProfile = await mapNullableProfileImage(profile as any);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: mappedProfile,
  });
});

// 유저 프로필 수정
export const updateUserProfileController = asyncHandler(async (req: Request, res: Response) => {
  // loadUser 미들웨어를 거쳐서 전체 user 정보가 있음
  const user = req.currentUser;
  if (!user) {
    throw new AppError('인증이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
  }

  if (user.type !== 'USER') {
    throw new AppError('일반 유저만 접근할 수 있습니다', HTTP_STATUS.FORBIDDEN);
  }

  const validatedData = updateUserProfileSchema.parse(req.body);

  const profile = await updateUserProfileService(user.id, validatedData);
  const mappedProfile = await mapNullableProfileImage(profile as any);

  res.json({
    success: true,
    data: mappedProfile,
  });
});

// ========== DriverProfile Controllers ==========

// 기사 프로필 조회
export const getDriverProfileController = asyncHandler(async (req: Request, res: Response) => {
  // loadUser 미들웨어를 거쳐서 전체 user 정보가 있음
  const user = req.currentUser;
  if (!user) {
    throw new AppError('인증이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
  }

  if (user.type !== 'DRIVER') {
    throw new AppError('기사님만 접근할 수 있습니다', HTTP_STATUS.FORBIDDEN);
  }

  const profile = await getDriverProfileService(user.id);

  if (!profile) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: '프로필을 찾을 수 없습니다',
    });
    return;
  }

  // driver(User) 정보도 병합해서 반환
  const mappedProfile = await mapNullableProfileImage(profile as any);
  const merged = {
    ...(mappedProfile as any),
    name: user.name,
    email: user.email,
    phone: user.phone,
  } as any;

  res.json({
    success: true,
    data: merged,
  });
});

// 기사 프로필 생성
export const createDriverProfileController = asyncHandler(async (req: Request, res: Response) => {
  // loadUser 미들웨어를 거쳐서 전체 user 정보가 있음
  const user = req.currentUser;
  if (!user) {
    throw new AppError('인증이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
  }

  if (user.type !== 'DRIVER') {
    throw new AppError('기사님만 접근할 수 있습니다', HTTP_STATUS.FORBIDDEN);
  }

  const validatedData = createDriverProfileSchema.parse(req.body);

  const profile = await createDriverProfileService(user.id, validatedData);
  const mappedProfile = await mapNullableProfileImage(profile as any);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: mappedProfile,
  });
});

// 기사 프로필 수정
export const updateDriverProfileController = asyncHandler(async (req: Request, res: Response) => {
  // loadUser 미들웨어를 거쳐서 전체 user 정보가 있음
  const user = req.currentUser;
  if (!user) {
    throw new AppError('인증이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
  }

  if (user.type !== 'DRIVER') {
    throw new AppError('기사님만 접근할 수 있습니다', HTTP_STATUS.FORBIDDEN);
  }

  const validatedData = updateDriverProfileSchema.parse(req.body);

  const profile = await updateDriverProfileService(user.id, validatedData);
  const mappedProfile = await mapNullableProfileImage(profile as any);

  res.json({
    success: true,
    data: mappedProfile,
  });
});

// 공개 기사 프로필 조회
export const getDriverPublicProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const { driverId } = req.params as { driverId?: string };

    if (!driverId) {
      throw new AppError('driverId가 필요합니다', HTTP_STATUS.BAD_REQUEST);
    }

    const data = await getDriverPublicProfileService(driverId);

    if (!data) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: '프로필을 찾을 수 없습니다',
      });
      return;
    }

    const mappedProfile = await mapNullableProfileImage((data.driverProfile as any) ?? null);

    res.json({
      success: true,
      data: {
        ...data,
        driverProfile: mappedProfile,
      },
    });
  },
);


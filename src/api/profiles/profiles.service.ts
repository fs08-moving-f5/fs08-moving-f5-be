import {
  findUserProfileByUserIdRepository,
  findDriverProfileByDriverIdRepository,
  createUserProfileRepository,
  createDriverProfileRepository,
  updateUserProfileRepository,
  updateDriverProfileRepository,
} from './profiles.repository';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';

import type { UserProfile, DriverProfile, UserType } from '@/generated/client';
import type {
  CreateUserProfileInput,
  UpdateUserProfileInput,
  CreateDriverProfileInput,
  UpdateDriverProfileInput,
} from './validators/profiles.validators';

// ========== UserProfile Service ==========

// 유저 프로필 조회
export const getUserProfileService = async (userId: string): Promise<UserProfile | null> => {
  const profile = await findUserProfileByUserIdRepository(userId);
  return profile;
};

// 유저 프로필 생성
export const createUserProfileService = async (
  userId: string,
  data: CreateUserProfileInput,
): Promise<UserProfile> => {
  // 이미 프로필이 있는지 확인
  const existingProfile = await findUserProfileByUserIdRepository(userId);
  if (existingProfile) {
    throw new AppError('이미 프로필이 존재합니다', HTTP_STATUS.CONFLICT);
  }

  const profile = await createUserProfileRepository({
    user: {
      connect: { id: userId },
    },
    imageUrl: data.imageUrl,
    regions: data.regions,
    services: data.services,
  });

  return profile;
};

// 유저 프로필 수정
export const updateUserProfileService = async (
  userId: string,
  data: UpdateUserProfileInput,
): Promise<UserProfile> => {
  // 프로필 존재 확인
  const existingProfile = await findUserProfileByUserIdRepository(userId);
  if (!existingProfile) {
    throw new AppError('프로필을 찾을 수 없습니다', HTTP_STATUS.NOT_FOUND);
  }

  // 업데이트할 데이터 준비
  const updateData: any = {};
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.regions !== undefined) updateData.regions = data.regions;
  if (data.services !== undefined) updateData.services = data.services;

  const profile = await updateUserProfileRepository(userId, updateData);

  return profile;
};

// ========== DriverProfile Service ==========

// 기사 프로필 조회
export const getDriverProfileService = async (driverId: string): Promise<DriverProfile | null> => {
  const profile = await findDriverProfileByDriverIdRepository(driverId);
  return profile;
};

// 기사 프로필 생성
export const createDriverProfileService = async (
  driverId: string,
  data: CreateDriverProfileInput,
): Promise<DriverProfile> => {
  // 이미 프로필이 있는지 확인
  const existingProfile = await findDriverProfileByDriverIdRepository(driverId);
  if (existingProfile) {
    throw new AppError('이미 프로필이 존재합니다', HTTP_STATUS.CONFLICT);
  }

  const profile = await createDriverProfileRepository({
    driver: {
      connect: { id: driverId },
    },
    imageUrl: data.imageUrl,
    career: data.career,
    shortIntro: data.shortIntro,
    description: data.description,
    regions: data.regions,
    services: data.services,
  });

  return profile;
};

// 기사 프로필 수정
export const updateDriverProfileService = async (
  driverId: string,
  data: UpdateDriverProfileInput,
): Promise<DriverProfile> => {
  // 프로필 존재 확인
  const existingProfile = await findDriverProfileByDriverIdRepository(driverId);
  if (!existingProfile) {
    throw new AppError('프로필을 찾을 수 없습니다', HTTP_STATUS.NOT_FOUND);
  }

  // 업데이트할 데이터 준비
  const updateData: any = {};
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.career !== undefined) updateData.career = data.career;
  if (data.shortIntro !== undefined) updateData.shortIntro = data.shortIntro;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.regions !== undefined) updateData.regions = data.regions;
  if (data.services !== undefined) updateData.services = data.services;

  const profile = await updateDriverProfileRepository(driverId, updateData);

  return profile;
};

// 통합 프로필 조회 (유저 타입에 따라 자동 판별)
export const getProfileService = async (
  userId: string,
  userType: UserType,
): Promise<UserProfile | DriverProfile | null> => {
  if (userType === 'USER') {
    return getUserProfileService(userId);
  } else if (userType === 'DRIVER') {
    return getDriverProfileService(userId);
  }
  throw new AppError('유효하지 않은 유저 타입입니다', HTTP_STATUS.BAD_REQUEST);
};

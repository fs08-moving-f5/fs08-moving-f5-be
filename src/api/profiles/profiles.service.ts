import {
  findUserProfileByUserIdRepository,
  findDriverProfileByDriverIdRepository,
  findDriverWithProfileByDriverIdRepository,
  createUserProfileRepository,
  createDriverProfileRepository,
  updateUserProfileRepository,
  updateDriverProfileRepository,
  updateUserRepository,
  findUserByIdRepository,
} from './profiles.repository';
import { verifyPassword, hashPassword } from '@/api/auth/utils/auth.utils';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';

import { bumpDriverListCacheVersion } from '@/cache/invalidate/driverList.invalidate';

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

  // 비밀번호 변경 처리
  if (data.newPassword) {
    if (!data.currentPassword) {
      throw new AppError('현재 비밀번호를 입력해주세요', HTTP_STATUS.BAD_REQUEST);
    }

    // 현재 사용자 정보 조회 (비밀번호 확인용)
    const user = await findUserByIdRepository(userId);
    if (!user || !user.password) {
      throw new AppError(
        '소셜 로그인 계정은 비밀번호를 변경할 수 없습니다',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // 현재 비밀번호 확인
    const isPasswordValid = await verifyPassword(user.password, data.currentPassword);
    if (!isPasswordValid) {
      throw new AppError('현재 비밀번호가 올바르지 않습니다', HTTP_STATUS.UNAUTHORIZED);
    }

    // 새 비밀번호 해싱
    const hashedPassword = await hashPassword(data.newPassword);
    await updateUserRepository(userId, { password: hashedPassword });
  }

  // 사용자(User)와 프로필(UserProfile) 업데이트 데이터 분리
  const userUpdateData: any = {};
  const profileUpdateData: any = {};

  if (data.name !== undefined) userUpdateData.name = data.name;
  if (data.email !== undefined) userUpdateData.email = data.email;
  if (data.phone !== undefined) userUpdateData.phone = data.phone;

  if (data.imageUrl !== undefined) profileUpdateData.imageUrl = data.imageUrl;
  if (data.regions !== undefined) profileUpdateData.regions = data.regions;
  if (data.services !== undefined) profileUpdateData.services = data.services;

  // User 업데이트는 별도 레포지토리 호출로 처리
  if (Object.keys(userUpdateData).length > 0) {
    await updateUserRepository(userId, userUpdateData);
  }

  const profile = await updateUserProfileRepository(userId, profileUpdateData);

  return profile;
};

// ========== DriverProfile Service ==========

// 기사 프로필 조회
export const getDriverProfileService = async (driverId: string): Promise<DriverProfile | null> => {
  const profile = await findDriverProfileByDriverIdRepository(driverId);
  return profile;
};

// 기사 프로필 (공개용) 조회: 기사 ID로 기사 이름 + driverProfile 반환
export const getDriverPublicProfileService = async (
  driverId: string,
): Promise<{ id: string; name: string; driverProfile: DriverProfile | null } | null> => {
  return await findDriverWithProfileByDriverIdRepository(driverId);
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

  // 비밀번호 변경 처리
  if (data.newPassword) {
    if (!data.currentPassword) {
      throw new AppError('현재 비밀번호를 입력해주세요', HTTP_STATUS.BAD_REQUEST);
    }

    // 현재 사용자 정보 조회 (비밀번호 확인용)
    const user = await findUserByIdRepository(driverId);
    if (!user || !user.password) {
      throw new AppError(
        '소셜 로그인 계정은 비밀번호를 변경할 수 없습니다',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // 현재 비밀번호 확인
    const isPasswordValid = await verifyPassword(user.password, data.currentPassword);
    if (!isPasswordValid) {
      throw new AppError('현재 비밀번호가 올바르지 않습니다', HTTP_STATUS.UNAUTHORIZED);
    }

    // 새 비밀번호 해싱
    const hashedPassword = await hashPassword(data.newPassword);
    await updateUserRepository(driverId, { password: hashedPassword });
  }

  // 사용자(User)와 프로필(DriverProfile) 업데이트 데이터 분리
  const userUpdateData: any = {};
  const profileUpdateData: any = {};

  if (data.name !== undefined) userUpdateData.name = data.name;
  if (data.email !== undefined) userUpdateData.email = data.email;
  if (data.phone !== undefined) userUpdateData.phone = data.phone;

  if (data.imageUrl !== undefined) profileUpdateData.imageUrl = data.imageUrl;
  if (data.career !== undefined) profileUpdateData.career = data.career;
  if (data.shortIntro !== undefined) profileUpdateData.shortIntro = data.shortIntro;
  if (data.description !== undefined) profileUpdateData.description = data.description;
  if (data.regions !== undefined) profileUpdateData.regions = data.regions;
  if (data.services !== undefined) profileUpdateData.services = data.services;

  // User 업데이트는 별도 레포지토리 호출로 처리
  if (Object.keys(userUpdateData).length > 0) {
    await updateUserRepository(driverId, userUpdateData);
  }

  const profile = await updateDriverProfileRepository(driverId, profileUpdateData);

  // 기사 찾기 페이지 캐시 무효화
  await bumpDriverListCacheVersion();

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

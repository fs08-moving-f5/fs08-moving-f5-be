import prisma from '@/config/prisma';

import type { User, UserProfile, DriverProfile, Prisma } from '@/generated/client';

// ========== UserProfile Repository ==========

// ========== User Repository ==========

// ID로 User 찾기
export const findUserByIdRepository = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id } });
};

// User 업데이트
export const updateUserRepository = async (
  id: string,
  data: Prisma.UserUpdateInput,
): Promise<User> => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

// ID로 유저 프로필 찾기
export const findUserProfileByIdRepository = async (id: string): Promise<UserProfile | null> => {
  return prisma.userProfile.findUnique({
    where: { id },
  });
};

// 유저 ID로 프로필 찾기
export const findUserProfileByUserIdRepository = async (
  userId: string,
): Promise<UserProfile | null> => {
  return prisma.userProfile.findUnique({
    where: { userId },
  });
};

// 유저 프로필 생성
export const createUserProfileRepository = async (
  data: Prisma.UserProfileCreateInput,
): Promise<UserProfile> => {
  return prisma.userProfile.create({
    data,
  });
};

// 유저 프로필 업데이트
export const updateUserProfileRepository = async (
  userId: string,
  data: Prisma.UserProfileUpdateInput,
): Promise<UserProfile> => {
  return prisma.userProfile.update({
    where: { userId },
    data,
  });
};

// 유저 프로필 삭제
export const deleteUserProfileRepository = async (userId: string): Promise<UserProfile> => {
  return prisma.userProfile.delete({
    where: { userId },
  });
};

// ========== DriverProfile Repository ==========

// ID로 기사 프로필 찾기
export const findDriverProfileByIdRepository = async (
  id: string,
): Promise<DriverProfile | null> => {
  return prisma.driverProfile.findUnique({
    where: { id },
  });
};

// 기사 ID로 프로필 찾기
export const findDriverProfileByDriverIdRepository = async (
  driverId: string,
): Promise<DriverProfile | null> => {
  return prisma.driverProfile.findUnique({
    where: { driverId },
  });
};

// 기사 프로필 생성
export const createDriverProfileRepository = async (
  data: Prisma.DriverProfileCreateInput,
): Promise<DriverProfile> => {
  return prisma.driverProfile.create({
    data,
  });
};

// 기사 프로필 업데이트
export const updateDriverProfileRepository = async (
  driverId: string,
  data: Prisma.DriverProfileUpdateInput,
): Promise<DriverProfile> => {
  return prisma.driverProfile.update({
    where: { driverId },
    data,
  });
};

// 기사 프로필 삭제
export const deleteDriverProfileRepository = async (driverId: string): Promise<DriverProfile> => {
  return prisma.driverProfile.delete({
    where: { driverId },
  });
};

// 기사 ID로 (기사 정보 + 프로필) 조회
export const findDriverWithProfileByDriverIdRepository = async (
  driverId: string,
): Promise<{ id: string; name: string; driverProfile: DriverProfile | null } | null> => {
  return prisma.user.findFirst({
    where: {
      id: driverId,
      type: 'DRIVER',
      isDelete: false,
    },
    select: {
      id: true,
      name: true,
      driverProfile: true,
    },
  });
};

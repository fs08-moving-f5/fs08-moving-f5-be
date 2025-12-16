import { User, UserType, Prisma } from '@/generated/client';
import prisma from '@/config/prisma';

// 이메일로 유저 찾기
export const findUserByEmailRepository = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

// ID로 유저 찾기
export const findUserByIdRepository = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
  });
};

// Provider ID로 유저 찾기 (소셜 로그인용)
export const findUserByProviderIdRepository = async (
  providerId: string,
  provider: string
): Promise<User | null> => {
  return prisma.user.findFirst({
    where: {
      providerId,
      provider,
    },
  });
};

// 새 유저 생성
export const createUserRepository = async (data: {
  email: string;
  password?: string;
  name: string;
  phone: number;
  type: UserType;
  provider?: string;
  providerId?: string;
}): Promise<User> => {
  return prisma.user.create({
    data: {
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone,
      type: data.type,
      provider: data.provider || 'local',
      providerId: data.providerId,
    },
  });
};

// 리프레시 토큰 업데이트
export const updateRefreshTokenRepository = async (
  userId: string,
  refreshToken: string | null
): Promise<User> => {
  return prisma.user.update({
    where: { id: userId },
    data: { refreshTokens: refreshToken },
  });
};

// 유저 정보 업데이트
export const updateUserRepository = async (
  userId: string,
  data: Prisma.UserUpdateInput
): Promise<User> => {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
};

// 유저 삭제 (소프트 삭제)
export const deleteUserRepository = async (userId: string): Promise<User> => {
  return prisma.user.update({
    where: { id: userId },
    data: { isDelete: true },
  });
};

// 이메일 중복 체크
export const existsUserByEmailRepository = async (email: string): Promise<boolean> => {
  const count = await prisma.user.count({
    where: { email },
  });
  return count > 0;
};

import { v4 as uuid } from 'uuid';
import { UserType } from './dataType';

type MockUser = {
  id: string;
  providerId: string | null;
  provider: string;
  type: UserType;
  name: string;
  email: string;
  password: string;
  phone: number;
  refreshTokens: string;
  isDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const mockUsers = (): MockUser[] => {
  const users: MockUser[] = [];

  // USER 타입 50명
  for (let i = 1; i <= 50; i++) {
    users.push({
      id: uuid(),
      providerId: null,
      provider: 'local',
      type: UserType.USER,
      name: `User_${i}`,
      email: `user${i}@example.com`,
      password: '12345678',
      phone: 1010001000 + i,
      refreshTokens: `refresh-user-${i}`,
      isDelete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // DRIVER 타입 10명
  for (let i = 1; i <= 10; i++) {
    users.push({
      id: uuid(),
      providerId: null,
      provider: 'local',
      type: UserType.DRIVER,
      name: `Driver_${i}`,
      email: `driver${i}@example.com`,
      password: '12345678',
      phone: 1020002000 + i,
      refreshTokens: `refresh-driver-${i}`,
      isDelete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return users;
};

export default mockUsers;

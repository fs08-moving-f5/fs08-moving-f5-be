import { v4 as uuid } from 'uuid';
import { UserProfile, RegionEnum, ServiceEnum } from './dataType';

export const mockUserProfiles = (userIds: string[]): UserProfile[] => {
  const profiles: UserProfile[] = [];

  userIds.forEach((userId) => {
    // 각 유저마다 랜덤한 지역 1~3개, 서비스 1~2개 선택
    const regions = [...RegionEnum]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);
    const services = [...ServiceEnum]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 2) + 1);

    profiles.push({
      id: uuid(),
      userId,
      imageUrl: `profile.svg`,
      regions,
      services,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  return profiles;
};

export default mockUserProfiles;

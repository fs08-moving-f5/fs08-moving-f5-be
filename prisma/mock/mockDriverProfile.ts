import { v4 as uuid } from 'uuid';
import { DriverProfile, RegionEnum, ServiceEnum } from './dataType';

const mockDriverProfiles = (driverIds: string[]): DriverProfile[] => {
  const profiles: DriverProfile[] = [];

  driverIds.forEach((driverId) => {
    const regions = [...RegionEnum]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);
    const services = [...ServiceEnum]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 2) + 1);

    profiles.push({
      id: uuid(),
      driverId,
      imageUrl: `profile.svg`,
      career: `${Math.floor(Math.random() * 10) + 1}년 경력`,
      shortIntro: `안녕하세요! ${driverId}입니다.`,
      description: `저는 ${regions.join(', ')} 지역에서 ${services.join(', ')} 서비스를 제공합니다.`,
      regions,
      services,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  return profiles;
};

export default mockDriverProfiles;

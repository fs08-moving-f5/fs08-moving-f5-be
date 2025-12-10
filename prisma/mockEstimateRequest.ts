import { v4 as uuid } from 'uuid';
import { EstimateRequest, StatusType, ServiceType, ServiceEnum } from './dataType';

// USER만 생성
const mockEstimateRequests = (userIds: string[], countPerUser = 5): EstimateRequest[] => {
  const requests: EstimateRequest[] = [];
  const serviceTypes = Object.keys(ServiceEnum) as ServiceType[];

  userIds.forEach((userId) => {
    for (let i = 0; i < countPerUser; i++) {
      const movingType = ServiceEnum[Math.floor(Math.random() * ServiceEnum.length)];
      const movingDate = new Date(
        Date.now() + Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000,
      ); // 오늘부터 10일 내 랜덤
      const status: StatusType = 'PENDING';
      const serviceId = uuid();

      requests.push({
        id: uuid(),
        userId,
        movingType,
        movingDate,
        status,
        isDesignated: false,
        isDelete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  return requests;
};

export default mockEstimateRequests;

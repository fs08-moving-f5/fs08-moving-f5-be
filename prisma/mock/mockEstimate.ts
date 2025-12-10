import { v4 as uuid } from 'uuid';
import { EstimateRequest, Estimate } from './dataType';

const mockEstimates = (estimateRequests: EstimateRequest[], driverIds: string[]): Estimate[] => {
  const estimates: Estimate[] = [];

  estimateRequests.forEach((req, idx) => {
    const driverId = driverIds[idx % driverIds.length]; // 한 명 선택

    estimates.push({
      id: uuid(),
      estimateRequestId: req.id,
      driverId,
      price: Math.floor(Math.random() * 100000) + 50000,
      comment: `Estimate for request ${req.id}`,
      rejectReason: null,
      status: 'PENDING',
      isDelete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  return estimates;
};

export default mockEstimates;

import {
  getUserFavoriteDriversRepository,
  confirmEstimateRepository,
  getEstimateDetailRepository,
  getReceivedEstimatesRepository,
  getIsMyFavoriteDriverRepository,
  confirmEstimateRequestRepository,
  getEstimateRequestDetailRepository,
  getEstimateManyDriversRepository,
  getNotPendingEstimateRequestInfoRepository,
  getDriverStatusesByDriverIdsRepository,
  getDriverStatusByDriverIdRepository,
} from './estimate.repository';
import { EstimateStatus, NotificationType } from '../../generated/client';
import { createNotificationAndPushUnreadService } from '../notification/notification.service';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';
import prisma from '@/config/prisma';

export const getPendingEstimatesService = async ({ userId }: { userId: string }) => {
  return await prisma.$transaction(async (tx) => {
    const estimateRequest = await getEstimateRequestDetailRepository({ userId, tx });

    if (!estimateRequest) {
      return null;
    }

    const estimate = estimateRequest.estimate;

    const driverIds: string[] = [];
    estimate.forEach((estimate) => {
      if (estimate?.driverId) {
        driverIds.push(estimate.driverId);
      }
    });

    const uniqueDriverIds = [...new Set(driverIds)];

    const estimates = await getEstimateManyDriversRepository({
      driverIds: uniqueDriverIds,
      estimateRequestId: estimateRequest.id,
      tx,
    });

    const [favoriteDrivers, driverStatuses] = await Promise.all([
      getUserFavoriteDriversRepository({ userId, driverIds: uniqueDriverIds, tx }),
      getDriverStatusesByDriverIdsRepository({ driverIds: uniqueDriverIds, tx }),
    ]);

    const favoriteDriverIds = new Set(favoriteDrivers.map((driver) => driver.driverId));

    const driverStatusMap = driverStatuses.reduce<
      Record<
        string,
        {
          confirmedEstimateCount: number;
          favoriteDriverCount: number;
          averageRating: number | null;
          reviewCount: number;
        }
      >
    >((acc, item) => {
      acc[item.driverId] = {
        confirmedEstimateCount: item.confirmedEstimateCount,
        favoriteDriverCount: item.favoriteDriverCount,
        averageRating: item.averageRating || null,
        reviewCount: item.reviewCount,
      };
      return acc;
    }, {});

    const estimateResult = estimates.map((estimate) => {
      const { estimateRequest, ...restEstimate } = estimate;
      const driverStatus = driverStatusMap[estimate.driver.id] || {
        confirmedEstimateCount: 0,
        favoriteDriverCount: 0,
        averageRating: null,
        reviewCount: 0,
      };

      return {
        ...restEstimate,
        isDesignated: estimateRequest.isDesignated,
        driver: {
          ...estimate.driver,
          isFavorite: favoriteDriverIds.has(estimate.driver.id),
          driverProfile: {
            ...estimate.driver.driverProfile,
            favoriteDriverCount: driverStatus.favoriteDriverCount,
            confirmedEstimateCount: driverStatus.confirmedEstimateCount,
            averageRating: driverStatus.averageRating,
            reviewCount: driverStatus.reviewCount,
          },
        },
      };
    });

    return {
      ...estimateRequest,
      estimates: estimateResult,
    };
  });
};

export const confirmEstimateService = async ({ estimateId }: { estimateId: string }) => {
  return await prisma.$transaction(async (tx) => {
    const estimate = await confirmEstimateRepository({ estimateId, tx });

    if (!estimate) {
      return null;
    }

    await confirmEstimateRequestRepository({
      estimateRequestId: estimate.estimateRequestId,
      tx,
    });

    await createNotificationAndPushUnreadService({
      userId: estimate.driverId,
      type: NotificationType.ESTIMATE_CONFIRMED,
      message: `${estimate.driver.name}님의 견적이 확정되었어요`,
      tx,
    });

    return estimate;
  });
};

export const getEstimateDetailService = async ({
  estimateId,
  userId,
}: {
  estimateId: string;
  userId: string;
}) => {
  if (!userId) {
    throw new AppError('유저 ID가 필요합니다.', HTTP_STATUS.BAD_REQUEST);
  }

  const estimate = await getEstimateDetailRepository({ estimateId });

  if (!estimate) {
    return null;
  }

  const driverId = estimate.driver?.id;

  if (!driverId) {
    throw new AppError('기사 ID가 필요합니다.', HTTP_STATUS.BAD_REQUEST);
  }

  const [isMyFavoriteDriver, driverStatus] = await Promise.all([
    getIsMyFavoriteDriverRepository({ userId, driverId }),
    getDriverStatusByDriverIdRepository({ driverId }),
  ]);

  const confirmedEstimateCount = driverStatus?.confirmedEstimateCount || 0;
  const favoriteDriverCount = driverStatus?.favoriteDriverCount || 0;
  const averageRating = driverStatus?.averageRating || null;
  const reviewCount = driverStatus?.reviewCount || 0;

  return {
    ...estimate,
    driver: estimate.driver
      ? {
          ...estimate.driver,
          isFavorite: isMyFavoriteDriver ? true : false,
          driverProfile: estimate.driver.driverProfile
            ? {
                ...estimate.driver.driverProfile,
                confirmedEstimateCount,
                favoriteDriverCount,
                averageRating,
                reviewCount,
              }
            : null,
        }
      : null,
  };
};

export const getReceivedEstimatesService = async ({
  userId,
  status,
  cursorId,
  limit = 15,
}: {
  userId: string;
  status?: EstimateStatus;
  cursorId?: string;
  limit?: number;
}) => {
  return await prisma.$transaction(async (tx) => {
    const estimateRequests = await getNotPendingEstimateRequestInfoRepository({ userId, tx });

    if (estimateRequests.length === 0) {
      return {
        data: [],
        pagination: {
          hasNext: false,
          nextCursor: null,
        },
      };
    }

    let filteredEstimateRequests = estimateRequests;
    if (cursorId) {
      const cursorIndex = estimateRequests.findIndex((er) => er.id === cursorId);
      if (cursorIndex !== -1) {
        filteredEstimateRequests = estimateRequests.slice(cursorIndex + 1);
      } else {
        return {
          data: [],
          pagination: {
            hasNext: false,
            nextCursor: null,
          },
        };
      }
    }

    const estimateRequestIds = filteredEstimateRequests.map(
      (estimateRequest) => estimateRequest.id,
    );

    const receivedEstimates = await getReceivedEstimatesRepository({
      estimateRequestIds,
      status,
      cursorId: undefined,
      limit: undefined,
      tx,
    });

    const allDriverIds = receivedEstimates.map((estimate) => estimate.driver.id);
    const uniqueDriverIds = [...new Set(allDriverIds)];

    const [favoriteDrivers, driverStatuses] = await Promise.all([
      getUserFavoriteDriversRepository({ userId, driverIds: uniqueDriverIds, tx }),
      getDriverStatusesByDriverIdsRepository({ driverIds: uniqueDriverIds, tx }),
    ]);

    const favoriteDriverIds = new Set(favoriteDrivers.map((driver) => driver.driverId));

    const driverStatusMap = driverStatuses.reduce<
      Record<
        string,
        {
          confirmedEstimateCount: number;
          favoriteDriverCount: number;
          averageRating: number | null;
          reviewCount: number;
        }
      >
    >((acc, item) => {
      acc[item.driverId] = {
        confirmedEstimateCount: item.confirmedEstimateCount,
        favoriteDriverCount: item.favoriteDriverCount,
        averageRating: item.averageRating || null,
        reviewCount: item.reviewCount,
      };
      return acc;
    }, {});

    const estimatesWithStats = receivedEstimates.map((estimate) => {
      const driverStatus = driverStatusMap[estimate.driver.id] || {
        confirmedEstimateCount: 0,
        favoriteDriverCount: 0,
        averageRating: null,
        reviewCount: 0,
      };

      return {
        id: estimate.id,
        price: estimate.price,
        status: estimate.status,
        createdAt: estimate.createdAt,
        driver: {
          ...estimate.driver,
          isFavorite: favoriteDriverIds.has(estimate.driver.id),
          driverProfile: estimate.driver.driverProfile
            ? {
                ...estimate.driver.driverProfile,
                confirmedEstimateCount: driverStatus.confirmedEstimateCount,
                favoriteDriverCount: driverStatus.favoriteDriverCount,
                averageRating: driverStatus.averageRating,
                reviewCount: driverStatus.reviewCount,
              }
            : null,
        },
      };
    });

    const estimateRequestMap = new Map<
      string,
      {
        id: string;
        movingType: string;
        movingDate: Date;
        isDesignated: boolean;
        status: EstimateStatus;
        createdAt: Date;
        addresses: Array<{
          id: string;
          addressType: string;
          address: string;
          sido: string;
          sigungu: string;
        }>;
        estimates: typeof estimatesWithStats;
      }
    >();

    estimatesWithStats.forEach((estimate, index) => {
      const estimateRequest = receivedEstimates[index].estimateRequest;
      const estimateRequestId = estimateRequest.id;

      if (!estimateRequestMap.has(estimateRequestId)) {
        const originalEstimateRequest = filteredEstimateRequests.find(
          (orig) => orig.id === estimateRequest.id,
        );
        estimateRequestMap.set(estimateRequestId, {
          id: estimateRequest.id,
          movingType: estimateRequest.movingType,
          movingDate: estimateRequest.movingDate,
          isDesignated: estimateRequest.isDesignated,
          status: estimateRequest.status,
          createdAt: originalEstimateRequest?.createdAt || new Date(0),
          addresses: estimateRequest.addresses,
          estimates: [],
        });
      }

      const groupedEstimateRequest = estimateRequestMap.get(estimateRequestId);
      if (groupedEstimateRequest) {
        groupedEstimateRequest.estimates.push(estimate);
      }
    });

    const result = Array.from(estimateRequestMap.values()).sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const hasNext = result.length > limit;
    const data = hasNext ? result.slice(0, limit) : result;
    const nextCursor = hasNext ? data[data.length - 1].id : null;

    return {
      data,
      pagination: {
        hasNext,
        nextCursor,
      },
    };
  });
};

import {
  getUserFavoriteDriversRepository,
  confirmEstimateRepository,
  getEstimateDetailRepository,
  getReceivedEstimatesRepository,
  getReceivedEstimateRequestsRepository,
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

    // DriverStatusView는 기본값이 설정되어 있으므로 Map으로 직접 사용
    const driverStatusMap = new Map(
      driverStatuses.map((item) => [
        item.driverId,
        {
          confirmedEstimateCount: item.confirmedEstimateCount,
          favoriteDriverCount: item.favoriteDriverCount,
          averageRating: item.averageRating,
          reviewCount: item.reviewCount,
        },
      ]),
    );

    const estimateResult = estimates.map((estimate) => {
      const { estimateRequest, ...restEstimate } = estimate;
      const driverStatus = driverStatusMap.get(estimate.driver.id);

      return {
        ...restEstimate,
        isDesignated: estimateRequest.isDesignated,
        driver: {
          ...estimate.driver,
          isFavorite: favoriteDriverIds.has(estimate.driver.id),
          driverProfile:
            estimate.driver.driverProfile && driverStatus
              ? {
                  ...estimate.driver.driverProfile,
                  favoriteDriverCount: driverStatus.favoriteDriverCount,
                  confirmedEstimateCount: driverStatus.confirmedEstimateCount,
                  averageRating: driverStatus.averageRating,
                  reviewCount: driverStatus.reviewCount,
                }
              : estimate.driver.driverProfile,
        },
      };
    });

    return {
      id: estimateRequest.id,
      movingType: estimateRequest.movingType,
      movingDate: estimateRequest.movingDate,
      isDesignated: estimateRequest.isDesignated,
      createdAt: estimateRequest.createdAt,
      addresses: estimateRequest.addresses,
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

  return {
    ...estimate,
    driver: estimate.driver
      ? {
          ...estimate.driver,
          isFavorite: isMyFavoriteDriver ? true : false,
          driverProfile:
            estimate.driver.driverProfile && driverStatus
              ? {
                  ...estimate.driver.driverProfile,
                  confirmedEstimateCount: driverStatus.confirmedEstimateCount,
                  favoriteDriverCount: driverStatus.favoriteDriverCount,
                  averageRating: driverStatus.averageRating,
                  reviewCount: driverStatus.reviewCount,
                }
              : estimate.driver.driverProfile,
        }
      : null,
  };
};

export const getReceivedEstimatesService = async ({
  userId,
  cursorId,
  limit = 15,
}: {
  userId: string;
  cursorId?: string;
  limit?: number;
}) => {
  return await prisma.$transaction(async (tx) => {
    // DB 레벨에서 estimateRequest를 기준으로 estimate를 include해서 가져오기 (무한스크롤)
    const estimateRequests = await getReceivedEstimateRequestsRepository({
      userId,
      cursorId,
      limit,
      tx,
    });

    if (estimateRequests.length === 0) {
      return {
        data: [],
        pagination: {
          hasNext: false,
          nextCursor: null,
        },
      };
    }

    // 모든 estimate에서 driverIds 수집
    const driverIds = Array.from(
      new Set(estimateRequests.flatMap((er) => er.estimate.map((e) => e.driver.id))),
    );

    const [favoriteDrivers, driverStatuses] = await Promise.all([
      getUserFavoriteDriversRepository({ userId, driverIds, tx }),
      getDriverStatusesByDriverIdsRepository({ driverIds, tx }),
    ]);

    const favoriteDriverIds = new Set(favoriteDrivers.map((d) => d.driverId));
    const driverStatusMap = new Map(
      driverStatuses.map((item) => [
        item.driverId,
        {
          confirmedEstimateCount: item.confirmedEstimateCount,
          favoriteDriverCount: item.favoriteDriverCount,
          averageRating: item.averageRating,
          reviewCount: item.reviewCount,
        },
      ]),
    );

    // 드라이버 통계 추가 및 변환
    const hasNext = estimateRequests.length > limit;
    const data = hasNext ? estimateRequests.slice(0, limit) : estimateRequests;

    const result = data.map((er) => ({
      id: er.id,
      movingType: er.movingType,
      movingDate: er.movingDate,
      isDesignated: er.isDesignated,
      status: er.status,
      createdAt: er.createdAt,
      addresses: er.addresses,
      estimates: er.estimate.map((e) => {
        const driverStatus = driverStatusMap.get(e.driver.id);
        return {
          id: e.id,
          price: e.price,
          comment: e.comment,
          status: e.status,
          createdAt: e.createdAt,
          driver: {
            id: e.driver.id,
            name: e.driver.name,
            isFavorite: favoriteDriverIds.has(e.driver.id),
            driverProfile:
              e.driver.driverProfile && driverStatus
                ? {
                    ...e.driver.driverProfile,
                    confirmedEstimateCount: driverStatus.confirmedEstimateCount,
                    favoriteDriverCount: driverStatus.favoriteDriverCount,
                    averageRating: driverStatus.averageRating,
                    reviewCount: driverStatus.reviewCount,
                  }
                : null,
          },
        };
      }),
    }));

    const nextCursor = hasNext ? result[result.length - 1].id : null;

    return {
      data: result,
      pagination: {
        hasNext,
        nextCursor,
      },
    };
  });
};

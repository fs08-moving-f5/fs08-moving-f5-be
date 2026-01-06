import prisma from '@/config/prisma';
import * as repo from './estimateReq.driver.repository';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';
import ERROR_MESSAGE from '@/constants/errorMessage.constant';
import {
  GetEstimateRequestsParams,
  CreateEstimateParams,
  CreateEstimateRejectParams,
  GetEstimateParams,
} from '@/types/driverEstimate';
import splitAddresses from '@/utils/splitAddresses';
import { NotificationType } from '@/generated/enums';
import { createNotificationAndPushUnreadService } from '@/api/notification/notification.service';

// 받은 요청 목록 조회(기사)
export async function getEstimateRequestsService(params: GetEstimateRequestsParams) {
  const requests = await repo.getEstimateRequestsRepository(params);

  return requests.map((req) => {
    const { from, to } = splitAddresses(req.addresses);

    return {
      id: req.id,
      name: req.user.name,
      movingType: req.movingType,
      movingDate: req.movingDate,
      isDesignated: req.isDesignated,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
      from: from ? { sido: from.sido, sigungu: from.sigungu } : null,
      to: to ? { sido: to.sido, sigungu: to.sigungu } : null,
    };
  });
}

// 견적 보내기(기사)
export async function createEstimateService(data: CreateEstimateParams) {
  const { estimateRequestId, driverId, price, comment } = data;

  if (!estimateRequestId || !driverId || !price || !comment) {
    throw new AppError(ERROR_MESSAGE.REQUIRED_FIELD_MISSING, HTTP_STATUS.BAD_REQUEST);
  }

  const exists = await repo.findExistingEstimateRepository({
    estimateRequestId,
    driverId,
  });

  if (exists) {
    throw new AppError(ERROR_MESSAGE.ALREADY_SUBMITTED, HTTP_STATUS.BAD_REQUEST);
  }

  const estimate = await prisma.$transaction(async (tx) => {
    const created = await repo.createEstimateRepository({ ...data, tx });

    await repo.createReviewRepository({
      estimateId: created.id,
      userId: created.estimateRequest.userId,
      tx,
    });

    await repo.createHistoryRepository({
      entityId: created.id,
      actionType: 'CREATE_ESTIMATE',
      tx,
    });

    await createNotificationAndPushUnreadService({
      userId: created.estimateRequest.userId,
      type: NotificationType.ESTIMATE_RECEIVED,
      message: '새 견적이 도착했습니다.',
      tx,
    });

    return created;
  });

  return estimate;
}

// 견적 반려(기사)
export async function createEstimateRejectService(data: CreateEstimateRejectParams) {
  const { estimateRequestId, rejectReason, driverId } = data;

  if (!estimateRequestId || !driverId || !rejectReason) {
    throw new AppError(ERROR_MESSAGE.REQUIRED_FIELD_MISSING, HTTP_STATUS.BAD_REQUEST);
  }

  const exists = await repo.findExistingEstimateRepository({
    estimateRequestId,
    driverId,
  });

  if (exists) {
    throw new AppError(ERROR_MESSAGE.ALREADY_SUBMITTED, HTTP_STATUS.BAD_REQUEST);
  }

  const estimate = await prisma.$transaction(async (tx) => {
    const created = await repo.createEstimateRejectRepository({ ...data, tx });

    await repo.createHistoryRepository({
      entityId: created.id,
      actionType: 'REJECTED_ESTIMATE',
      tx,
    });

    await createNotificationAndPushUnreadService({
      userId: created.estimateRequest.userId,
      type: NotificationType.REQUEST_REJECTED,
      message: '기사님이 견적 요청을 반려했습니다.',
      tx,
    });

    return created;
  });

  return estimate;
}

// 확정 견적 목록 조회
export async function getEstimateConfirmService(params: GetEstimateParams) {
  const estimates = await repo.getEstimateConfirmRepository(params);

  return estimates.map((e) => {
    const { from, to } = splitAddresses(e.estimateRequest.addresses);

    return {
      id: e.id,
      price: e.price,
      status: e.status,
      createdAt: e.createdAt,
      isCompleted: e.status === 'CONFIRMED' && !!e.review,
      user: {
        id: e.estimateRequest.user.id,
        name: e.estimateRequest.user.name,
      },
      movingType: e.estimateRequest.movingType,
      movingDate: e.estimateRequest.movingDate,
      isDesignated: e.estimateRequest.isDesignated,
      from: from ? { sido: from.sido, sigungu: from.sigungu } : null,
      to: to ? { sido: to.sido, sigungu: to.sigungu } : null,
    };
  });
}

// 확정 견적 상세 조회
export async function getEstimateConfirmIdService(estimateId: string, driverId: string) {
  if (!estimateId) {
    throw new AppError(ERROR_MESSAGE.REQUIRED_FIELD_MISSING, HTTP_STATUS.BAD_REQUEST);
  }

  const estimate = await repo.getEstimateConfirmIdRepository(estimateId, driverId);

  if (!estimate) {
    throw new AppError(ERROR_MESSAGE.ESTIMATE.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const { from, to } = splitAddresses(estimate.estimateRequest.addresses);

  return {
    id: estimate.id,
    price: estimate.price,
    userName: estimate.estimateRequest.user.name,
    movingType: estimate.estimateRequest.movingType,
    movingDate: estimate.estimateRequest.movingDate,
    isDesignated: estimate.estimateRequest.isDesignated,
    createdAt: estimate.estimateRequest.createdAt,
    updatedAt: estimate.estimateRequest.updatedAt,
    fromAddress: from?.address ?? null,
    toAddress: to?.address ?? null,
  };
}

// 반려 견적 목록 조회
export async function getEstimateRejectService(params: GetEstimateParams) {
  const estimates = await repo.getEstimateRejectRepository(params);

  return estimates.map((e) => {
    const { from, to } = splitAddresses(e.estimateRequest.addresses);

    return {
      id: e.id,
      status: e.status,
      estimateRequestId: e.estimateRequest.id,
      movingType: e.estimateRequest.movingType,
      movingDate: e.estimateRequest.movingDate,
      user: {
        id: e.estimateRequest.user.id,
        name: e.estimateRequest.user.name,
      },
      from: from ? { sido: from.sido, sigungu: from.sigungu } : null,
      to: to ? { sido: to.sido, sigungu: to.sigungu } : null,
      isRejected: true,
    };
  });
}

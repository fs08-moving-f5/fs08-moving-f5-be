import * as repo from './estimateReq.repository';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';
import ERROR_MESSAGE from '@/constants/errorMessage.constant';
import {
  GetEstimateRequestsParams,
  CreateEstimateParams,
  CreateEstimateRejectParams,
  GetEstimateParams,
} from '../../types/driverEstimate';

// 받은 요청 목록 조회(기사)
export async function getEstimateRequestsService(params: GetEstimateRequestsParams) {
  if (!params.driverId) {
    throw new AppError(ERROR_MESSAGE.DRIVER_REQUIRED, HTTP_STATUS.UNAUTHORIZED);
  }

  return repo.getEstimateRequestsRepository(params);
}

// 견적 보내기(기사)
export async function createEstimateService(data: CreateEstimateParams) {
  const { estimateRequestId, driverId, price, comment } = data;

  if (!data.driverId) {
    throw new AppError(ERROR_MESSAGE.DRIVER_REQUIRED, HTTP_STATUS.UNAUTHORIZED);
  }

  if (!estimateRequestId || !driverId || !price || !comment) {
    throw new AppError(ERROR_MESSAGE.REQUIRED_FIELD_MISSING, HTTP_STATUS.BAD_REQUEST);
  }

  return repo.createEstimateRepository(data);
}

// 견적 반려(기사)
export async function createEstimateRejectService(data: CreateEstimateRejectParams) {
  const { estimateRequestId, rejectReason, driverId } = data;

  if (!data.driverId) {
    throw new AppError(ERROR_MESSAGE.DRIVER_REQUIRED, HTTP_STATUS.UNAUTHORIZED);
  }

  if (!estimateRequestId || !driverId || !rejectReason) {
    throw new AppError(ERROR_MESSAGE.REQUIRED_FIELD_MISSING, HTTP_STATUS.BAD_REQUEST);
  }

  return repo.createEstimateRejectRepository(data);
}

// 확정 견적 목록 조회
export async function getEstimateConfirmService(params: GetEstimateParams) {
  if (!params.driverId) {
    throw new AppError(ERROR_MESSAGE.DRIVER_REQUIRED, HTTP_STATUS.UNAUTHORIZED);
  }

  const estimates = await repo.getEstimateConfirmRepository(params);

  return estimates.map((estimate) => ({
    ...estimate,
    isCompleted: estimate.status === 'CONFIRMED' && estimate.hasReview,
  }));
}

// 확정 견적 상세 조회
export async function getEstimateConfirmIdService(estimateId: string, driverId: string) {
  if (!driverId) {
    throw new AppError(ERROR_MESSAGE.DRIVER_REQUIRED, HTTP_STATUS.UNAUTHORIZED);
  }

  if (!estimateId) {
    throw new AppError(ERROR_MESSAGE.REQUIRED_FIELD_MISSING, HTTP_STATUS.BAD_REQUEST);
  }

  const estimate = await repo.getEstimateConfirmIdRepository(estimateId, driverId);

  if (!estimate) {
    throw new AppError(ERROR_MESSAGE.ESTIMATE.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return estimate;
}

// 반려 견적 목록 조회
export async function getEstimateRejectService(params: GetEstimateParams) {
  if (!params.driverId) {
    throw new AppError(ERROR_MESSAGE.DRIVER_REQUIRED, HTTP_STATUS.UNAUTHORIZED);
  }

  const estimates = await repo.getEstimateRejectRepository(params);

  return estimates.map((estimate) => ({
    ...estimate,
    isRejected: true,
  }));
}

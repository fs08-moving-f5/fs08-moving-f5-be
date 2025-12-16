import * as repo from './estimateReq.repository';
import { HttpError } from '../../types/error';
import {
  GetEstimateRequestsParams,
  CreateEstimateParams,
  CreateEstimateRejectParams,
  GetEstimateParams,
} from '../../types/driverEstimate';

// 받은 요청 목록 조회(기사)
export async function getEstimateRequestsService(params: GetEstimateRequestsParams) {
  if (!params.driverId) {
    throw new HttpError('기사 로그인이 필요합니다.', 401);
  }

  return repo.getEstimateRequestsRepository(params);
}

// 견적 보내기(기사)
export async function createEstimateService(data: CreateEstimateParams) {
  const { estimateRequestId, driverId, price, comment } = data;

  if (!data.driverId) {
    throw new HttpError('기사 로그인이 필요합니다.', 401);
  }

  if (!estimateRequestId || !driverId || !price || !comment) {
    throw new HttpError('필수 데이터가 누락되었습니다.', 400);
  }

  return repo.createEstimateRepository(data);
}

// 견적 반려(기사)
export async function createEstimateRejectService(data: CreateEstimateRejectParams) {
  const { estimateRequestId, rejectReason, driverId } = data;

  if (!data.driverId) {
    throw new HttpError('기사 로그인이 필요합니다.', 401);
  }

  if (!estimateRequestId || !driverId || !rejectReason) {
    throw new HttpError('필수 데이터가 누락되었습니다.', 400);
  }

  return repo.createEstimateRejectRepository(data);
}

// 확정 견적 목록 조회
export async function getEstimateConfirmService(params: GetEstimateParams) {
  if (!params.driverId) {
    throw new HttpError('기사 로그인이 필요합니다.', 401);
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
    throw new HttpError('기사 로그인이 필요합니다.', 401);
  }

  if (!estimateId) {
    throw new HttpError('estimateId가 필요합니다.', 400);
  }

  const estimate = await repo.getEstimateConfirmIdRepository(estimateId, driverId);

  if (!estimate) {
    throw new HttpError('견적을 찾을 수 없습니다.', 404);
  }

  return estimate;
}

// 반려 견적 목록 조회
export async function getEstimateRejectService(params: GetEstimateParams) {
  if (!params.driverId) {
    throw new HttpError('기사 로그인이 필요합니다.', 401);
  }

  const estimates = await repo.getEstimateRejectRepository(params);

  return estimates.map((estimate) => ({
    ...estimate,
    isRejected: true,
  }));
}

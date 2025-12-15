import * as repo from './estimateReq.repository';
import { HttpError } from '../../types/error';
import {
  GetEstimateRequestsParams,
  CreateEstimateParams,
  CreateEstimateRejectParams,
  GetEstimateConfirmParams,
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
export async function getEstimateConfirmService(params: GetEstimateConfirmParams) {
  if (!params.driverId) {
    throw new HttpError('기사 로그인이 필요합니다.', 401);
  }

  const estimates = await repo.getEstimateConfirmRepository(params);

  return estimates.map((estimate) => ({
    ...estimate,
    isCompleted: estimate.status === 'CONFIRMED' && !!estimate.review,
  }));
}

// 확정 견적 상세 조회

// 반려 견적 목록 조회

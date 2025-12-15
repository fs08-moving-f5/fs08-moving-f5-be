import * as repo from './estimateReq.repository';
import { HttpError } from '../../types/error';
import {
  GetEstimateRequestsParams,
  CreateEstimateParams,
  CreateEstimateRejectParams,
} from '../../types/driverEstimate';

// 받은 요청 목록 조회(기사)
export async function getEstimateRequestsService(params: GetEstimateRequestsParams) {
  return repo.getEstimateRequestsRepository(params);
}

// 견적 보내기(기사)
export async function createEstimateService(data: CreateEstimateParams) {
  const { estimateRequestId, driverId, price, comment } = data;

  if (!estimateRequestId || !driverId || !price || !comment) {
    throw new HttpError('필수 데이터가 누락되었습니다.', 400);
  }

  return repo.createEstimateRepository(data);
}

// 견적 반려(기사)
export async function createEstimateRejectService(data: CreateEstimateRejectParams) {
  const { estimateRequestId, rejectReason, driverId } = data;

  if (!estimateRequestId || !driverId || !rejectReason) {
    throw new HttpError('필수 데이터가 누락되었습니다.', 400);
  }

  return repo.createEstimateRejectRepository(data);
}

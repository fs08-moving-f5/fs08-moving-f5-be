import AppError from '@/utils/AppError';
import {
  createEstimateRequestRepository,
  getEstimateRequestsInProgressRepository,
} from './estimateReq.user.repository';
import { createEstimateRequestParams } from '@/types/userEstimate';

//진행 중인 견적 요청 보기 (유저)
export const getEstimateRequestsInProgressService = async ({ userId }: { userId: string }) => {
  if (!userId) {
    throw new AppError('유저 로그인이 필요합니다.', 401);
  }
  return await getEstimateRequestsInProgressRepository({ userId });
};

//견적 요청 (유저)
export const createEstimateRequestService = async (data: createEstimateRequestParams) => {
  if (!data.userId) {
    throw new AppError('유저 로그인이 필요합니다.', 401);
  }
  if (!data.movingType || !data.movingDate || !data.from || !data.to) {
    throw new AppError('필수 데이터가 누락되었습니다.', 400);
  }
  const inProgress = await getEstimateRequestsInProgressRepository({ userId: data.userId });
  if (inProgress.length > 0) {
    throw new AppError('이미 진행 중인 견적 요청이 있습니다.', 409);
  }
  return createEstimateRequestRepository(data);
};

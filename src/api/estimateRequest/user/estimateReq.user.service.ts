import AppError from '@/utils/AppError';
import splitAddresses from '@/utils/splitAddresses';
import {
  createEstimateRequestRepository,
  findDesignatedDriverRepository,
  findLatestPendingEstimateRequestRepository,
  updateEstimateRequestToDesignatedRepository,
  getEstimateRequestsInProgressRepository,
  createEstimateRequestWithGeocodeRepository,
} from './estimateReq.user.repository';
import { createEstimateRequestParams } from '@/types/userEstimate';
import { Address, ServiceEnum } from '@/generated/client';
import HTTP_STATUS from '@/constants/http.constant';
import { geocodeAddress } from '@/api/drivers/utils/geocodeAddress';

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

// 지정 견적 요청 (유저)
export const createDesignatedEstimateRequestService = async (data: {
  userId: string;
  designatedDriverId: string;
}) => {
  if (!data.userId) {
    throw new AppError('유저 로그인이 필요합니다.', 401);
  }
  if (!data.designatedDriverId) {
    throw new AppError('지정 기사 정보가 누락되었습니다.', 400);
  }

  const designatedDriver = await findDesignatedDriverRepository({
    designatedDriverId: data.designatedDriverId,
  });
  if (!designatedDriver) {
    throw new AppError('지정 기사 정보를 찾을 수 없습니다.', 404);
  }

  const pendingRequest = await findLatestPendingEstimateRequestRepository({ userId: data.userId });
  if (!pendingRequest) {
    throw new AppError('일반 견적 요청을 먼저 진행해주세요.', 404);
  }

  const updatedRequest = await updateEstimateRequestToDesignatedRepository({
    estimateRequestId: pendingRequest.id,
    designatedDriverId: data.designatedDriverId,
  });

  const { from: _from, to: _to } = splitAddresses(updatedRequest.addresses);

  return {
    id: updatedRequest.id,
    name: updatedRequest.user.name,
    movingType: updatedRequest.movingType,
    movingDate: updatedRequest.movingDate,
    isDesignated: updatedRequest.isDesignated,
    designatedDriverId: updatedRequest.designatedDriverId ?? null,
    from: _from ? { sido: _from.sido, sigungu: _from.sigungu } : null,
    to: _to ? { sido: _to.sido, sigungu: _to.sigungu } : null,
  };
};

export const createEstimateRequestWithGeocodeService = async ({
  userId,
  movingType,
  movingDate,
  from,
  to,
}: {
  userId: string;
  movingType: ServiceEnum;
  movingDate: Date;
  from: Address;
  to: Address;
}) => {
  const hasInProgress = await getEstimateRequestsInProgressRepository({ userId });

  if (hasInProgress.length > 0) {
    throw new AppError('이미 진행 중인 견적 요청이 있습니다.', HTTP_STATUS.CONFLICT);
  }

  const fromGeocode = await geocodeAddress(from.address);
  const toGeocode = await geocodeAddress(to.address);

  if (!fromGeocode || !toGeocode) {
    throw new AppError('주소 변환에 실패했습니다.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  const estimateReq = await createEstimateRequestWithGeocodeRepository({
    userId,
    movingType,
    movingDate,
    from,
    to,
    fromGeocode,
    toGeocode,
  });

  return {
    id: estimateReq.id,
    name: estimateReq.user.name,
    movingType: estimateReq.movingType,
    movingDate: estimateReq.movingDate,
    from: estimateReq.addresses.find((a) => a.addressType === 'FROM')?.address,
    to: estimateReq.addresses.find((a) => a.addressType === 'TO')?.address,
  };
};

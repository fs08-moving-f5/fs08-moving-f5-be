import HTTP_STATUS from '../../constants/http.constant';
import asyncHandler from '../../middlewares/asyncHandler';
import { EstimateStatus } from '../../generated/client';
import {
  confirmEstimateService,
  getEstimateDetailService,
  getPendingEstimatesService,
  getReceivedEstimatesService,
} from './estimate.service';

const VALID_STATUSES: readonly string[] = [
  EstimateStatus.PENDING,
  EstimateStatus.CONFIRMED,
  EstimateStatus.REJECTED,
  EstimateStatus.CANCELLED,
];

const isValidEstimateStatus = (value: string): value is EstimateStatus => {
  const upperValue = value.toUpperCase();
  return (
    upperValue === EstimateStatus.PENDING ||
    upperValue === EstimateStatus.CONFIRMED ||
    upperValue === EstimateStatus.REJECTED ||
    upperValue === EstimateStatus.CANCELLED
  );
};

export const getPendingEstimatesController = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const estimates = await getPendingEstimatesService({ userId });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: estimates,
  });
});

export const confirmEstimateController = asyncHandler(async (req, res) => {
  const { estimateId } = req.params;

  const estimate = await confirmEstimateService({ estimateId });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: estimate,
  });
});

export const getEstimateDetailController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { estimateId } = req.params;

  const estimate = await getEstimateDetailService({ estimateId, userId });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: estimate,
  });
});

export const getReceivedEstimatesController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status } = req.query;

  // status가 제공된 경우 유효성 검증
  let validatedStatus: EstimateStatus | undefined;
  if (status) {
    if (typeof status !== 'string') {
      const error = new Error(
        `유효하지 않은 status 값입니다. 가능한 값: ${VALID_STATUSES.join(', ')}`,
      );
      Object.assign(error, { status: HTTP_STATUS.BAD_REQUEST });
      throw error;
    }

    const upperStatus = status.toUpperCase();
    if (!isValidEstimateStatus(upperStatus)) {
      const error = new Error(
        `유효하지 않은 status 값입니다. 가능한 값: ${VALID_STATUSES.join(', ')}`,
      );
      Object.assign(error, { status: HTTP_STATUS.BAD_REQUEST });
      throw error;
    }
    validatedStatus = upperStatus;
  }

  const estimates = await getReceivedEstimatesService({
    userId,
    status: validatedStatus,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: estimates,
  });
});

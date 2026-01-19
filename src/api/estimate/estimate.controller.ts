import HTTP_STATUS from '../../constants/http.constant.js';
import asyncHandler from '../../middlewares/asyncHandler.js';
import { EstimateStatus } from '../../generated/enums.js';
import {
  confirmEstimateService,
  getEstimateDetailService,
  getPendingEstimatesService,
  getReceivedEstimatesService,
} from './estimate.service.js';
import AppError from '../../utils/AppError.js';

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
  const userId = req.user!.id;

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
  const userId = req.user!.id;
  const { estimateId } = req.params;

  const estimate = await getEstimateDetailService({ estimateId, userId });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: estimate,
  });
});

export const getReceivedEstimatesController = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const limit = req.query.limit ? Number(req.query.limit) : 15;
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined;

  const { data, pagination } = await getReceivedEstimatesService({
    userId,
    cursorId: cursor,
    limit,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data,
    pagination,
  });
});

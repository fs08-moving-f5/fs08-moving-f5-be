import HTTP_STATUS from '../../constants/http.constant';
import asyncHandler from '../../middlewares/asyncHandler';
import {
  confirmEstimateService,
  getEstimateDetailService,
  getPendingEstimatesService,
} from './estimate.service';

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
  const { estimateId } = req.params;

  const estimate = await getEstimateDetailService({ estimateId });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: estimate,
  });
});

import HTTP_STATUS from '../../constants/http.constant';
import asyncHandler from '../../middlewares/asyncHandler';
import { getPendingEstimatesService } from './estimate.service';

export const getPendingEstimatesController = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const estimates = await getPendingEstimatesService({ userId });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: estimates,
  });
});

import { Router } from 'express';
import {
  getEstimateRequestsController,
  createEstimateController,
  createEstimateRejectController,
} from './estimate.controller';

const router = Router();

router.get('/pending');

router.get('/requests', getEstimateRequestsController);
router.post('/create', createEstimateController);
router.post('/reject', createEstimateRejectController);

export default router;

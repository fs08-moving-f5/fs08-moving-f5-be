import { Router } from 'express';

import authRouter from './auth/index.js';
import estimateRouter from './estimate/index.js';
import userEstimateReqRouter from './estimateRequest/user/index.js';
import driverEstimateReqRouter from './estimateRequest/driver/index.js';
import favoriteRouter from './favorite/index.js';
import notificationRouter from './notification/index.js';
import profileRouter from './profiles/index.js';
import reviewRouter from './review/index.js';
import myPageRouter from './myPage/myPage.routes.js';
import driversRouter from './drivers/index.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/estimate', estimateRouter);
router.use('/estimate-request/user', userEstimateReqRouter);
router.use('/estimate-request/driver', driverEstimateReqRouter);
router.use('/favorite', favoriteRouter);
router.use('/notifications', notificationRouter);
router.use('/profile', profileRouter);
router.use('/review', reviewRouter);
router.use('/my-page', myPageRouter);
router.use('/drivers', driversRouter);

export default router;

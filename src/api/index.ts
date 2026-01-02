import { Router } from 'express';

import authRouter from './auth/index';
import estimateRouter from './estimate/index';
import userEstimateReqRouter from './estimateRequest/user/index';
import driverEstimateReqRouter from './estimateRequest/driver/index';
import favoriteRouter from './favorite/index';
import notificationRouter from './notification/index';
import profileRouter from './profiles/index';
import reviewRouter from './review/index';
import myPageRouter from './myPage/myPage.routes';

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

export default router;

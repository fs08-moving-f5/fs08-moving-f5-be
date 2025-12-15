// 예시 파일입니다. 자유롭게 사용하세요.
import { Router } from 'express';

import authRouter from './auth/index';
import estimateRouter from './estimate/index';
import estimateReqRouter from './estimateRequest/index';
import favoriteRouter from './favorite/index';
import notificationRouter from './notification/index';
import profileRouter from './profiles/index';
import reviewRouter from './review/index';

const router = Router();

router.use('/auth', authRouter);
router.use('/estimate', estimateRouter);
router.use('/', estimateReqRouter);
router.use('/favorite', favoriteRouter);
router.use('/', notificationRouter);
router.use('/profile', profileRouter);
router.use('/', reviewRouter);

export default router;

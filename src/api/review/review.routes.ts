import { Router } from 'express';
import fakeAuthMiddleware from '../../middlewares/fakeAuthMiddleware';
import * as controller from './review.controller';

const router = Router();

// 내가 작성한 리뷰 목록 조회 (일반 유저)
router.get('/written', fakeAuthMiddleware, controller.getReviewWritten);

// 작성 가능한 리뷰 목록 조회 (일반 유저)
router.get('/writable', fakeAuthMiddleware);

// 리뷰 작성 (일반 유저)
router.post('/write', fakeAuthMiddleware);

export default router;

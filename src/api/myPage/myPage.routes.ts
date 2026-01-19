import { Router } from 'express';
import { getMyPageController, getMyPageReviewsController } from './myPage.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { loadUser } from '../../middlewares/loadUserMiddleware.js';

const router = Router();

// 드라이버 마이페이지 전체 데이터 조회
router.get('/', authenticate, loadUser, getMyPageController);

// 드라이버 마이페이지 리뷰 목록 조회 (페이지네이션)
router.get('/reviews', authenticate, loadUser, getMyPageReviewsController);

export default router;

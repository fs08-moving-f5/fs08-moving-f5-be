import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware.js';
import * as controller from './review.controller.js';

const router = Router();

// 내가 작성한 리뷰 목록 조회 (일반 유저)
router.get('/written', authenticate, controller.getReviewWritten);

// 리뷰 작성 가능한 견적 목록 조회 (일반 유저)
router.get('/writable', authenticate, controller.getReviewWritable);

// 리뷰 작성 (일반 유저)
router.patch('/:reviewId', authenticate, controller.updateReview);

export default router;

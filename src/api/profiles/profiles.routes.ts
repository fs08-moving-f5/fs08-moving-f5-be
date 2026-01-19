import { Router } from 'express';
import {
  getMyProfileController,
  getUserProfileController,
  createUserProfileController,
  updateUserProfileController,
  getDriverProfileController,
  getDriverPublicProfileController,
  createDriverProfileController,
  updateDriverProfileController,
  createProfileImagePutPresignController,
} from './profiles.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { loadUser } from '../../middlewares/loadUserMiddleware.js';
import { createProfileImagePutPresign } from './middlewares/profileImagePresign.middleware.js';

const router = Router();

// 공통 프로필 조회 (유저 타입 자동 판별)
router.get('/me', authenticate, loadUser, getMyProfileController);

// 프로필 이미지 presign (단계적 전환)
router.post(
  '/me/profile-image/presign-put',
  authenticate,
  loadUser,
  createProfileImagePutPresign,
  createProfileImagePutPresignController,
);

// 유저 프로필 라우트
router.get('/user', authenticate, loadUser, getUserProfileController);
router.post('/user', authenticate, loadUser, createUserProfileController);
router.patch('/user', authenticate, loadUser, updateUserProfileController);

// 기사 프로필 라우트
router.get('/driver/:driverId', getDriverPublicProfileController);
router.get('/driver', authenticate, loadUser, getDriverProfileController);
router.post('/driver', authenticate, loadUser, createDriverProfileController);
router.patch('/driver', authenticate, loadUser, updateDriverProfileController);

export default router;

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
} from './profiles.controller';
import { authenticate } from '@/middlewares/authMiddleware';
import { loadUser } from '@/middlewares/loadUserMiddleware';

const router = Router();

// 공통 프로필 조회 (유저 타입 자동 판별)
router.get('/me', authenticate, loadUser, getMyProfileController);

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

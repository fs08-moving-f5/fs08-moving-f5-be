import { Router } from 'express';
import {
  signupController,
  loginController,
  logoutController,
  refreshTokenController,
  getMeController,
} from './auth.controller';
import { authenticate } from '@/middlewares/authMiddleware';

const router = Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.post('/logout', authenticate, logoutController);
router.post('/refresh', refreshTokenController);
router.get('/me', authenticate, getMeController);

export default router;

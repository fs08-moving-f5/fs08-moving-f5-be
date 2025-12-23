import { Router } from 'express';
import {
  signupController,
  loginController,
  logoutController,
  refreshTokenController,
  getMeController,
} from './auth.controller';
import { authenticate } from '@/middlewares/authMiddleware';
import { loadUser } from '@/middlewares/loadUserMiddleware';

const router = Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.post('/logout', authenticate, logoutController);
router.post('/refresh', refreshTokenController);
router.get('/me', authenticate, loadUser, getMeController);

export default router;

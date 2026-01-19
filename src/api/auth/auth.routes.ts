import { Router } from 'express';
import {
  signupController,
  loginController,
  logoutController,
  refreshTokenController,
  getMeController,
  oauthStartController,
  oauthCallbackController,
} from './auth.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { loadUser } from '../../middlewares/loadUserMiddleware.js';

const router = Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.post('/logout', logoutController);
router.post('/refresh', refreshTokenController);
router.get('/me', authenticate, loadUser, getMeController);

router.get('/oauth/:provider', oauthStartController);
router.get('/oauth/:provider/callback', oauthCallbackController);

export default router;

import { Router } from 'express';

const router = Router();

//테스트용 엔드포인트
router.get('/test', (req, res) => {
  return res.json({ test: '테스트' });
});

export default router;

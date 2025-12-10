import { Request, Response, NextFunction } from 'express';

const fakeAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const mockUserId = req.headers['x-mock-user-id'] as string;

  if (!mockUserId) {
    return res.status(401).json({
      success: false,
      message: 'x-user-id 헤더를 전달해주세요.',
    });
  }

  req.user = {
    id: mockUserId,
  };

  next();
};

export default fakeAuthMiddleware;

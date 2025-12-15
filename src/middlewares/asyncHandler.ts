// 예시 파일입니다. 자유롭게 사용하세요.
// import { Request, Response, NextFunction } from 'express';

// export const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

import asyncHandler from 'express-async-handler';

export default asyncHandler;

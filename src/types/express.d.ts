import type { Prisma } from '../generated/client.js';

declare global {
  namespace Express {
    interface User {
      id: string;
    }

    type CurrentUser = Omit<
      Prisma.UserGetPayload<{ include: { userProfile: true; driverProfile: true } }>,
      'password'
    >;

    interface Request {
      user?: User;
      currentUser?: CurrentUser;
    }
  }
}

export {};

import prisma from '../../config/prisma';

export const isFavoriteDriverRepository = async ({
  userId,
  driverId,
}: {
  userId: string;
  driverId: string;
}) => {
  return await prisma.favoriteDriver.findUnique({
    where: {
      userId_driverId: {
        userId,
        driverId,
      },
    },
    select: {
      id: true,
    },
  });
};

export const createFavoriteDriverRepository = async ({
  userId,
  driverId,
}: {
  userId: string;
  driverId: string;
}) => {
  return await prisma.favoriteDriver.create({
    data: { userId, driverId },
  });
};

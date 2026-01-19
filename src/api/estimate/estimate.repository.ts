import prisma from '../../config/prisma.js';
import { Prisma } from '../../generated/client.js';
import { EstimateStatus } from '../../generated/enums.js';

export const getPendingEstimatesRepository = async ({ userId }: { userId: string }) => {
  return await prisma.estimateRequest.findMany({
    where: {
      userId,
      status: EstimateStatus.PENDING,
      isDelete: false,
      estimate: {
        some: {
          status: EstimateStatus.PENDING,
          isDelete: false,
        },
      },
    },
    select: {
      id: true,
      movingType: true,
      movingDate: true,
      isDesignated: true,
      createdAt: true,
      addresses: {
        select: {
          id: true,
          addressType: true,
          sido: true,
          sigungu: true,
        },
      },
      estimate: {
        where: {
          status: EstimateStatus.PENDING,
          isDelete: false,
        },
        select: {
          id: true,
          price: true,
          status: true,
          createdAt: true,
          driver: {
            select: {
              id: true,
              name: true,
              driverProfile: {
                select: {
                  id: true,
                  imageUrl: true,
                  career: true,
                  shortIntro: true,
                },
              },
            },
          },
          estimateRequest: {
            select: {
              id: true,
              isDesignated: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getUserFavoriteDriversRepository = async ({
  userId,
  driverIds,
  tx,
}: {
  userId: string;
  driverIds: string[];
  tx?: Prisma.TransactionClient;
}) => {
  return await (tx ?? prisma).favoriteDriver.findMany({
    where: {
      userId,
      driverId: {
        in: driverIds,
      },
    },
    select: {
      driverId: true,
    },
  });
};

export const getIsMyFavoriteDriverRepository = async ({
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

// ========== Driver 통계 조회 (여러 driverIds) ==========

export const getFavoriteDriverCountRepository = async ({
  driverIds,
  tx,
}: {
  driverIds: string[];
  tx?: Prisma.TransactionClient;
}) => {
  if (driverIds.length === 0) {
    return [];
  }

  return await (tx ?? prisma).favoriteDriver.groupBy({
    by: ['driverId'],
    where: {
      driverId: {
        in: driverIds,
      },
      user: {
        isDelete: false,
      },
    },
    _count: {
      id: true,
    },
  });
};

export const confirmEstimateRepository = async ({
  estimateId,
  tx,
}: {
  estimateId: string;
  tx?: Prisma.TransactionClient;
}) => {
  return await (tx ?? prisma).estimate.update({
    where: {
      id: estimateId,
    },
    data: {
      status: EstimateStatus.CONFIRMED,
    },
    select: {
      id: true,
      estimateRequestId: true,
      driverId: true,
      price: true,
      createdAt: true,
      updatedAt: true,
      driver: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const confirmEstimateRequestRepository = async ({
  estimateRequestId,
  tx,
}: {
  estimateRequestId: string;
  tx?: Prisma.TransactionClient;
}) => {
  return await (tx ?? prisma).estimateRequest.update({
    where: {
      id: estimateRequestId,
      isDelete: false,
    },
    data: {
      status: EstimateStatus.CONFIRMED,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getEstimateDetailRepository = async ({ estimateId }: { estimateId: string }) => {
  return await prisma.estimate.findUnique({
    where: {
      id: estimateId,
    },
    select: {
      id: true,
      price: true,
      status: true,
      estimateRequest: {
        select: {
          id: true,
          movingType: true,
          movingDate: true,
          isDesignated: true,
          createdAt: true,
          addresses: {
            select: {
              id: true,
              addressType: true,
              address: true,
            },
          },
        },
      },
      driver: {
        select: {
          id: true,
          name: true,
          driverProfile: {
            select: {
              id: true,
              imageUrl: true,
              career: true,
              shortIntro: true,
            },
          },
        },
      },
    },
  });
};

export const getNotPendingEstimateRequestInfoRepository = async ({
  userId,
  tx,
}: {
  userId: string;
  tx?: Prisma.TransactionClient;
}) => {
  return await (tx ?? prisma).estimateRequest.findMany({
    where: {
      userId,
      isDelete: false,
      status: {
        not: EstimateStatus.PENDING,
      },
    },
    select: {
      id: true,
      movingType: true,
      movingDate: true,
      isDesignated: true,
      status: true,
      createdAt: true,
      addresses: {
        select: {
          id: true,
          addressType: true,
          address: true,
          sido: true,
          sigungu: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getReceivedEstimatesRepository = async ({
  estimateRequestIds,
  status,
  cursorId,
  limit = 15,
  tx,
}: {
  estimateRequestIds: string[];
  status?: EstimateStatus;
  cursorId?: string;
  limit?: number;
  tx?: Prisma.TransactionClient;
}) => {
  return await (tx ?? prisma).estimate.findMany({
    where: {
      isDelete: false,
      estimateRequest: {
        id: {
          in: estimateRequestIds,
        },
        isDelete: false,
      },
      ...(status && { status }),
    },
    select: {
      id: true,
      price: true,
      comment: true,
      status: true,
      createdAt: true,
      estimateRequest: {
        select: {
          id: true,
          movingType: true,
          movingDate: true,
          isDesignated: true,
          status: true,
          addresses: {
            select: {
              id: true,
              addressType: true,
              address: true,
              sido: true,
              sigungu: true,
            },
          },
        },
      },
      driver: {
        select: {
          id: true,
          name: true,
          driverProfile: {
            select: {
              id: true,
              imageUrl: true,
              career: true,
              shortIntro: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    ...(limit !== undefined && { take: limit + 1 }),
    ...(cursorId
      ? {
          cursor: { id: cursorId },
          skip: 1,
        }
      : {}),
  });
};

// estimateRequest를 기준으로 estimate를 include해서 가져오기
export const getReceivedEstimateRequestsRepository = async ({
  userId,
  cursorId,
  limit = 15,
  tx,
}: {
  userId: string;
  cursorId?: string;
  limit?: number;
  tx?: Prisma.TransactionClient;
}) => {
  return await (tx ?? prisma).estimateRequest.findMany({
    where: {
      userId,
      isDelete: false,
      status: {
        not: EstimateStatus.PENDING,
      },
      estimate: {
        some: {
          isDelete: false,
        },
      },
    },
    select: {
      id: true,
      movingType: true,
      movingDate: true,
      isDesignated: true,
      status: true,
      createdAt: true,
      addresses: {
        select: {
          id: true,
          addressType: true,
          address: true,
          sido: true,
          sigungu: true,
        },
      },
      estimate: {
        where: {
          isDelete: false,
        },
        select: {
          id: true,
          price: true,
          comment: true,
          status: true,
          createdAt: true,
          driver: {
            select: {
              id: true,
              name: true,
              driverProfile: {
                select: {
                  id: true,
                  imageUrl: true,
                  career: true,
                  shortIntro: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit + 1,
    ...(cursorId
      ? {
          cursor: { id: cursorId },
          skip: 1,
        }
      : {}),
  });
};

export const getEstimateRequestDetailRepository = async ({
  userId,
  tx,
}: {
  userId: string;
  tx?: Prisma.TransactionClient;
}) => {
  return await (tx ?? prisma).estimateRequest.findFirst({
    where: {
      userId,
      isDelete: false,
      status: EstimateStatus.PENDING,
    },
    select: {
      id: true,
      movingType: true,
      movingDate: true,
      isDesignated: true,
      createdAt: true,
      addresses: {
        select: {
          id: true,
          addressType: true,
          sido: true,
          sigungu: true,
        },
      },
      estimate: {
        where: {
          status: EstimateStatus.PENDING,
          isDelete: false,
        },
        select: {
          id: true,
          driverId: true,
        },
      },
    },
  });
};

export const getEstimateManyDriversRepository = async ({
  driverIds,
  estimateRequestId,
  tx,
}: {
  driverIds: string[];
  estimateRequestId: string;
  tx?: Prisma.TransactionClient;
}) => {
  return await (tx ?? prisma).estimate.findMany({
    where: {
      driverId: {
        in: driverIds,
      },
      estimateRequestId,
      isDelete: false,
      status: EstimateStatus.PENDING,
    },
    select: {
      id: true,
      price: true,
      comment: true,
      status: true,
      createdAt: true,
      driver: {
        select: {
          id: true,
          name: true,
          driverProfile: {
            select: {
              id: true,
              imageUrl: true,
              career: true,
              shortIntro: true,
            },
          },
        },
      },
      estimateRequest: {
        select: {
          id: true,
          isDesignated: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// ========== DriverStatusView를 사용한 통계 조회 ==========

export const getDriverStatusesByDriverIdsRepository = async ({
  driverIds,
  tx,
}: {
  driverIds: string[];
  tx?: Prisma.TransactionClient;
}) => {
  if (driverIds.length === 0) {
    return [];
  }

  return await (tx ?? prisma).driverStatusView.findMany({
    where: {
      driverId: {
        in: driverIds,
      },
    },
    select: {
      driverId: true,
      career: true,
      reviewCount: true,
      averageRating: true,
      confirmedEstimateCount: true,
      favoriteDriverCount: true,
    },
  });
};

export const getDriverStatusByDriverIdRepository = async ({ driverId }: { driverId: string }) => {
  return await prisma.driverStatusView.findUnique({
    where: {
      driverId,
    },
    select: {
      driverId: true,
      career: true,
      reviewCount: true,
      averageRating: true,
      confirmedEstimateCount: true,
      favoriteDriverCount: true,
    },
  });
};

import prisma from '../../config/prisma';
import { EstimateStatus } from '../../generated/client';

// 기존 코드 (Estimate 기준 조회)
// export const getPendingEstimatesRepository = async ({ userId }: { userId: string }) => {
//   return await prisma.estimate.findMany({
//     where: {
//       status: EstimateStatus.PENDING,
//       isDelete: false,
//       estimateRequest: {
//         userId,
//         isDelete: false,
//         status: EstimateStatus.PENDING,
//       },
//     },
//     select: {
//       id: true,
//       price: true,
//       createdAt: true,
//       estimateRequest: {
//         select: {
//           id: true,
//           movingType: true,
//           movingDate: true,
//           isDesignated: true,
//           createdAt: true,
//           addresses: {
//             select: {
//               id: true,
//               addressType: true,
//               sido: true,
//               sigungu: true,
//             },
//           },
//         },
//       },
//       driver: {
//         select: {
//           id: true,
//           driverProfile: {
//             select: {
//               id: true,
//               imageUrl: true,
//               career: true,
//             },
//           },
//           reviews: {
//             select: {
//               id: true,
//               rating: true,
//               createdAt: true,
//             },
//           },
//         },
//       },
//     },
//     orderBy: {
//       createdAt: 'desc',
//     },
//   });
// };

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
}: {
  userId: string;
  driverIds: string[];
}) => {
  return await prisma.favoriteDriver.findMany({
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

// ========== Driver 통계 조회 (여러 driverIds) ==========

export const getConfirmedEstimateCountRepository = async ({
  driverIds,
}: {
  driverIds: string[];
}) => {
  if (driverIds.length === 0) {
    return [];
  }

  return await prisma.estimate.groupBy({
    by: ['driverId'],
    where: {
      driverId: {
        in: driverIds,
      },
      isDelete: false,
      estimateRequest: {
        status: EstimateStatus.CONFIRMED,
        isDelete: false,
      },
    },
    _count: {
      id: true,
    },
  });
};

export const getFavoriteDriverCountRepository = async ({ driverIds }: { driverIds: string[] }) => {
  if (driverIds.length === 0) {
    return [];
  }

  return await prisma.favoriteDriver.groupBy({
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

export const getDriverReviewAverageRepository = async ({ driverIds }: { driverIds: string[] }) => {
  if (driverIds.length === 0) {
    return [];
  }

  // 각 driver별로 리뷰 평균 계산 (원시 데이터 반환)
  const reviewAverages = await Promise.all(
    driverIds.map(async (driverId) => {
      const result = await prisma.review.aggregate({
        where: {
          estimate: {
            driverId,
            status: EstimateStatus.CONFIRMED,
            isDelete: false,
          },
          rating: {
            not: null,
          },
        },
        _avg: {
          rating: true,
        },
        _count: {
          id: true,
        },
      });

      return {
        driverId,
        averageRating: result._avg.rating, // 원시 데이터 (null 또는 number)
        reviewCount: result._count.id,
      };
    }),
  );

  return reviewAverages;
};

// ========== Driver 통계 조회 (단일 driverId) ==========

export const getConfirmedEstimateCountByDriverIdRepository = async ({
  driverId,
}: {
  driverId: string;
}) => {
  return await prisma.estimate.count({
    where: {
      driverId,
      isDelete: false,
      estimateRequest: {
        status: EstimateStatus.CONFIRMED,
        isDelete: false,
      },
    },
  });
};

export const getFavoriteDriverCountByDriverIdRepository = async ({
  driverId,
}: {
  driverId: string;
}) => {
  return await prisma.favoriteDriver.count({
    where: {
      driverId,
      user: {
        isDelete: false,
      },
    },
  });
};

export const getDriverReviewAverageByDriverIdRepository = async ({
  driverId,
}: {
  driverId: string;
}) => {
  const result = await prisma.review.aggregate({
    where: {
      estimate: {
        driverId,
        status: EstimateStatus.CONFIRMED,
        isDelete: false,
      },
      rating: {
        not: null,
      },
    },
    _avg: {
      rating: true,
    },
  });

  // Repository는 원시 데이터만 반환 (데이터 변환은 Service 레이어에서)
  return result._avg.rating;
};

export const confirmEstimateRepository = async ({ estimateId }: { estimateId: string }) => {
  return await prisma.estimate.update({
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

export const getReceivedEstimatesRepository = async ({
  userId,
  status,
}: {
  userId: string;
  status?: EstimateStatus;
}) => {
  return await prisma.estimate.findMany({
    where: {
      isDelete: false,
      estimateRequest: {
        userId,
        isDelete: false,
      },
      ...(status && { status }),
    },
    select: {
      id: true,
      price: true,
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
  });
};

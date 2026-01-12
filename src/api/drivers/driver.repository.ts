import prisma from '@/config/prisma';
import { Prisma, UserType, AddressType, EstimateStatus } from '@/generated/client';
import {
  GetDriverStatusesRepositoryParams,
  GetFilteredDriverIdsParams,
  GetDriverInfoRepositoryParams,
  UpdateDriverOfficeBody,
} from './types';

export const getFilteredDriverIdsRepository = async ({ where, tx }: GetFilteredDriverIdsParams) => {
  const drivers = await (tx ?? prisma).user.findMany({
    where,
    select: {
      id: true,
    },
  });

  return drivers.map((driver) => driver.id);
};

export const getDriverStatusesRepository = async ({
  orderBy,
  cursor,
  limit,
  driverIds,
  tx,
}: GetDriverStatusesRepositoryParams) => {
  return await (tx ?? prisma).driverStatusView.findMany({
    where: driverIds
      ? {
          driverId: {
            in: driverIds,
          },
        }
      : undefined,
    select: {
      driverId: true,
      career: true,
      reviewCount: true,
      averageRating: true,
      confirmedEstimateCount: true,
      favoriteDriverCount: true,
    },
    orderBy: [{ ...orderBy }, { driverId: 'asc' }],
    ...(cursor && { cursor: { driverId: cursor } }),
    take: (limit || 15) + 1,
    skip: cursor ? 1 : 0,
  });
};

export const getDriverInfoRepository = async ({ driverIds, tx }: GetDriverInfoRepositoryParams) => {
  return await (tx ?? prisma).user.findMany({
    where: {
      id: {
        in: driverIds,
      },
      type: UserType.DRIVER,
      isDelete: false,
    },
    select: {
      id: true,
      name: true,
      driverProfile: {
        select: {
          id: true,
          imageUrl: true,
          shortIntro: true,
          description: true,
          regions: true,
          services: true,
        },
      },
    },
  });
};

export const updateDriverOfficeRepository = async ({
  driverId,
  body,
  geocodeResult,
}: {
  driverId: string;
  body: UpdateDriverOfficeBody;
  geocodeResult: { lat: number; lng: number };
}) => {
  return await prisma.driverProfile.update({
    where: { driverId },
    data: {
      officeAddress: body.officeAddress,
      officeZoneCode: body.officeZoneCode,
      officeSido: body.officeSido,
      officeSigungu: body.officeSigungu,
      officeLat: geocodeResult.lat,
      officeLng: geocodeResult.lng,
      officeUpdatedAt: new Date(),
    },
    select: {
      id: true,
      officeAddress: true,
      officeZoneCode: true,
      officeSido: true,
      officeSigungu: true,
      officeLat: true,
      officeLng: true,
      officeUpdatedAt: true,
    },
  });
};

export const findDriverOfficePointRepository = async ({ driverId }: { driverId: string }) => {
  return await prisma.driverProfile.findUnique({
    where: { driverId },
    select: {
      officeLat: true,
      officeLng: true,
    },
  });
};

export const findFromAddressesInBoxRepository = async (params: {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}) => {
  return await prisma.address.findMany({
    where: {
      addressType: AddressType.FROM,
      lat: { gte: params.minLat, lte: params.maxLat },
      lng: { gte: params.minLng, lte: params.maxLng },
      estimateRequest: {
        isDelete: false,
        status: EstimateStatus.PENDING,
      },
    },
    select: {
      id: true,
      estimateRequestId: true,
      sido: true,
      sigungu: true,
      address: true,
      addressEnglish: true,
      zoneCode: true,
      lat: true,
      lng: true,
      estimateRequest: {
        select: {
          id: true,
          movingType: true,
          movingDate: true,
          isDesignated: true,
          createdAt: true,
          designatedDriverId: true,
        },
      },
    },
  });
};

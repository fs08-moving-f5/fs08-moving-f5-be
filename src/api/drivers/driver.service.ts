import {
  findDriverOfficePointRepository,
  findFromAddressesInBoxRepository,
  getDriverInfoRepository,
  getDriverStatusesRepository,
  getFilteredDriverIdsRepository,
  updateDriverOfficeRepository,
} from './driver.repository';
import { getUserFavoriteDriversRepository } from '../estimate/estimate.repository';
import prisma from '@/config/prisma';
import {
  GetDriversServiceParams,
  NearbyEstimateRequestItem,
  regionMap,
  UpdateDriverOfficeBody,
  DriverListResponse,
} from './types';
import { AddressType, Prisma, RegionEnum, ServiceEnum, UserType } from '@/generated/client';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';
import { geocodeAddress } from './utils/geocodeAddress';
import { getBoundingBox } from './utils/getBoundingBox';
import { getDistanceKm } from './utils/getDistanceKm';

import { buildDriversCacheKey } from '@/cache/keys';
import { cacheGet, cacheSet } from '@/cache/redis.helper';

export const getDriversService = async ({
  userId,
  region,
  service,
  sort,
  cursor,
  limit = 15,
  search,
}: GetDriversServiceParams) => {
  const cacheKey = await buildDriversCacheKey({
    userId,
    region,
    service,
    sort,
    cursor,
    limit,
    search,
  });

  // 캐시 조회
  const cached = await cacheGet<DriverListResponse>(cacheKey);
  if (cached) return cached;

  // DB 조회
  const result = await prisma.$transaction(async (tx) => {
    let orderBy = {};
    switch (sort) {
      case 'review':
        orderBy = { reviewCount: 'desc' };
        break;
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'career':
        orderBy = { career: 'desc' };
        break;
      case 'confirmed-estimate':
        orderBy = { confirmedEstimateCount: 'desc' };
        break;
    }

    const regionValue = region ? (regionMap[region] as RegionEnum) : undefined;
    const serviceValue = service ? (service as ServiceEnum) : undefined;

    const hasFilter =
      regionValue !== undefined || serviceValue !== undefined || search !== undefined;

    const filteredDriverIds = hasFilter
      ? await getFilteredDriverIdsRepository({
          where: {
            type: UserType.DRIVER,
            isDelete: false,
            ...(search && {
              name: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            }),
            driverProfile: {
              ...(regionValue && {
                regions: {
                  has: regionValue,
                },
              }),
              ...(serviceValue && {
                services: {
                  has: serviceValue,
                },
              }),
            },
          },
          tx,
        })
      : undefined;

    if (filteredDriverIds && filteredDriverIds.length === 0) {
      return {
        data: [],
        pagination: {
          hasNext: false,
          nextCursor: null,
        },
      };
    }

    const driverStatuses = await getDriverStatusesRepository({
      orderBy,
      cursor,
      limit,
      driverIds: filteredDriverIds,
      tx,
    });

    if (driverStatuses.length === 0) {
      return {
        data: [],
        pagination: {
          hasNext: false,
          nextCursor: null,
        },
      };
    }

    const hasNext = driverStatuses.length > limit;
    const slicedDriverStatuses = hasNext ? driverStatuses.slice(0, limit) : driverStatuses;

    const driverIds = slicedDriverStatuses.map((driverStatus) => driverStatus.driverId);
    const uniqueDriverIds = [...new Set(driverIds)];

    const driverInfo = await getDriverInfoRepository({
      driverIds: uniqueDriverIds,
      tx,
    });

    // 회원/비회원 모두 사용 가능한 API이므로 userId가 유효한 문자열일 때만 찜 목록 조회
    const favoriteDrivers =
      userId && userId.trim() !== '' && uniqueDriverIds.length > 0
        ? await getUserFavoriteDriversRepository({
            userId,
            driverIds: uniqueDriverIds,
            tx,
          })
        : [];

    const favoriteDriverIds = new Set(favoriteDrivers.map((driver) => driver.driverId));

    const driverInfoMap = new Map(driverInfo.map((driver) => [driver.id, driver]));

    const data = slicedDriverStatuses
      .map((driverStatus) => {
        const driver = driverInfoMap.get(driverStatus.driverId);
        if (!driver) {
          return null;
        }

        return {
          id: driver.id,
          name: driver.name,
          driverProfile: driver.driverProfile
            ? {
                id: driver.driverProfile.id,
                imageUrl: driver.driverProfile.imageUrl,
                shortIntro: driver.driverProfile.shortIntro,
                description: driver.driverProfile.description,
                regions: driver.driverProfile.regions,
                services: driver.driverProfile.services,
              }
            : null,
          career: driverStatus.career,
          favoriteDriverCount: driverStatus.favoriteDriverCount,
          confirmedEstimateCount: driverStatus.confirmedEstimateCount,
          averageRating: driverStatus.averageRating,
          reviewCount: driverStatus.reviewCount,
          isFavorite: favoriteDriverIds.has(driverStatus.driverId),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const nextCursor = hasNext
      ? slicedDriverStatuses[slicedDriverStatuses.length - 1].driverId
      : null;

    return {
      data,
      pagination: {
        hasNext,
        nextCursor,
      },
    };
  });

  // 캐시 저장 (TTL 60초)
  await cacheSet(cacheKey, result, 60);

  return result;
};

export const updateDriverOfficeService = async (params: {
  driverId: string;
  body: UpdateDriverOfficeBody;
}) => {
  const { driverId, body } = params;

  const officeAddress = body.officeAddress?.trim();

  if (!officeAddress) {
    throw new AppError('사무실 주소가 필요합니다', HTTP_STATUS.BAD_REQUEST);
  }

  const geocodeResult = await geocodeAddress(officeAddress);

  if (!geocodeResult) {
    throw new AppError('주소 변환에 실패했습니다', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  const result = await updateDriverOfficeRepository({
    driverId,
    body: {
      officeAddress,
      officeZoneCode: body.officeZoneCode,
      officeSido: body.officeSido,
      officeSigungu: body.officeSigungu,
    },
    geocodeResult: { lat: geocodeResult.lat, lng: geocodeResult.lng },
  });

  return result;
};

export const getNearbyEstimateRequestsService = async (params: {
  driverId: string;
  radiusKm: number;
}) => {
  const office = await findDriverOfficePointRepository({ driverId: params.driverId });

  if (!office || office.officeLat === null || office.officeLng === null) {
    throw new AppError('사무실 주소(위도/경도)가 필요합니다', HTTP_STATUS.BAD_REQUEST);
  }

  const baseLat = office.officeLat;
  const baseLng = office.officeLng;

  const box = getBoundingBox({
    lat: baseLat,
    lng: baseLng,
    radiusKm: params.radiusKm,
  });

  const candidates = await findFromAddressesInBoxRepository({
    minLat: box.minLat,
    minLng: box.minLng,
    maxLat: box.maxLat,
    maxLng: box.maxLng,
  });

  const items = candidates
    .map((row) => {
      if (row.lat === null || row.lng === null) return null;

      const distanceKm = getDistanceKm({
        from: {
          lat: baseLat,
          lng: baseLng,
        },
        to: {
          lat: row.lat,
          lng: row.lng,
        },
      });

      if (distanceKm > params.radiusKm) return null;

      const item: NearbyEstimateRequestItem = {
        estimateRequestId: row.estimateRequestId,
        distanceKm,
        movingType: row.estimateRequest.movingType,
        movingDate: row.estimateRequest.movingDate.toISOString(),
        isDesignated: row.estimateRequest.isDesignated,
        user: {
          id: row.estimateRequest.user.id,
          name: row.estimateRequest.user.name,
        },
        createdAt: row.estimateRequest.createdAt.toISOString(),
        fromAddress: {
          sido: row.sido,
          sigungu: row.sigungu,
          address: row.address,
          lat: row.lat,
          lng: row.lng,
        },
        toAddress: {
          sido:
            row.estimateRequest.addresses.find((address) => address.addressType === AddressType.TO)
              ?.sido ?? '',
          sigungu:
            row.estimateRequest.addresses.find((address) => address.addressType === AddressType.TO)
              ?.sigungu ?? '',
          address:
            row.estimateRequest.addresses.find((address) => address.addressType === AddressType.TO)
              ?.address ?? '',
        },
      };

      return item;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return items;
};

import request from 'supertest';
import app from '../src/app';
import { generateAccessToken } from '../src/api/auth/utils/auth.utils';
import { UserType, ServiceEnum, AddressType } from '../src/generated/client';
import prisma from '../src/config/prisma';
import { redisClient } from '../src/config/redis';
import { randomUUID } from 'crypto';
import argon2 from 'argon2';

// geocodeAddress 함수 모킹
jest.mock('../src/api/drivers/utils/geocodeAddress', () => ({
  geocodeAddress: jest.fn().mockResolvedValue({
    lat: 37.5665,
    lng: 126.978,
  }),
}));

describe('Driver API', () => {
  // 테스트 데이터 태그: 이메일을 jest-로 시작하게 만들어 일괄 정리
  const TEST_EMAIL_PREFIX = 'jest-';

  let testUserId: string;
  let testUserEmail: string;
  let testUserAccessToken: string;
  let testDriverId: string;
  let testDriverEmail: string;
  let testDriverAccessToken: string;
  let testEstimateRequestId: string;

  // 테스트용 유저 및 드라이버 생성
  beforeAll(async () => {
    // Redis 연결 (테스트 환경에서 필요)
    if (!redisClient.isOpen) {
      try {
        await redisClient.connect();
      } catch (error) {
        // Redis 연결 실패해도 테스트는 계속 진행 (캐시 무효화만 실패할 수 있음)
        console.warn('Redis connection failed, tests may fail:', error);
      }
    }

    testUserEmail = `${TEST_EMAIL_PREFIX}user-${randomUUID()}@test.com`;
    const hashedPassword = await argon2.hash('test1234');

    const user = await prisma.user.create({
      data: {
        email: testUserEmail,
        password: hashedPassword,
        name: '테스트 유저',
        phone: '01012345678',
        type: UserType.USER,
        provider: 'local',
        isEmailVerified: true,
      },
    });

    testUserId = user.id;
    testUserAccessToken = generateAccessToken(user.id, user.email, user.type);

    // 테스트용 드라이버 생성
    testDriverEmail = `${TEST_EMAIL_PREFIX}driver-${randomUUID()}@test.com`;
    const driver = await prisma.user.create({
      data: {
        email: testDriverEmail,
        password: hashedPassword,
        name: '테스트 기사',
        phone: '01087654321',
        type: UserType.DRIVER,
        provider: 'local',
        isEmailVerified: true,
        driverProfile: {
          create: {
            regions: ['서울', '경기'],
            services: [ServiceEnum.HOME_MOVING, ServiceEnum.SMALL_MOVING],
            career: 5,
            shortIntro: '친절하고 신속한 이사 서비스를 제공합니다',
            description: '10년 이상의 경력을 가진 전문 이사 기사입니다.',
          },
        },
      },
    });

    testDriverId = driver.id;
    testDriverAccessToken = generateAccessToken(driver.id, driver.email, driver.type);

    // 테스트용 견적 요청 생성 (근처 요청 조회 테스트용)
    const estimateRequest = await prisma.estimateRequest.create({
      data: {
        userId: testUserId,
        movingType: ServiceEnum.HOME_MOVING,
        movingDate: new Date('2025-12-31'),
        isDesignated: false,
        status: 'PENDING',
        addresses: {
          create: [
            {
              addressType: AddressType.FROM,
              zoneCode: '06000',
              address: '서울시 강남구 테헤란로 123',
              addressEnglish: 'Seoul Gangnam-gu Teheran-ro 123',
              sido: '서울',
              sidoEnglish: 'Seoul',
              sigungu: '강남구',
              sigunguEnglish: 'Gangnam-gu',
              lat: 37.5012,
              lng: 127.0394,
            },
            {
              addressType: AddressType.TO,
              zoneCode: '06001',
              address: '서울시 서초구 서초대로 456',
              addressEnglish: 'Seoul Seocho-gu Seocho-daero 456',
              sido: '서울',
              sidoEnglish: 'Seoul',
              sigungu: '서초구',
              sigunguEnglish: 'Seocho-gu',
              lat: 37.4837,
              lng: 127.0324,
            },
          ],
        },
      },
    });

    testEstimateRequestId = estimateRequest.id;
  });

  // 모든 테스트 종료 후 jest- prefix로 태그된 모든 데이터 일괄 정리
  afterAll(async () => {
    // jest-로 시작하는 이메일을 가진 모든 테스트 유저 조회
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          startsWith: TEST_EMAIL_PREFIX,
        },
      },
      select: {
        id: true,
      },
    });

    const testUserIds = testUsers.map((user) => user.id);

    if (testUserIds.length > 0) {
      // 해당 유저들이 생성한 견적 요청 조회
      const testEstimateRequests = await prisma.estimateRequest.findMany({
        where: {
          userId: {
            in: testUserIds,
          },
        },
        select: {
          id: true,
        },
      });

      const testEstimateRequestIds = testEstimateRequests.map((er) => er.id);

      if (testEstimateRequestIds.length > 0) {
        // 견적 요청에 연결된 견적 삭제
        await prisma.estimate.deleteMany({
          where: {
            estimateRequestId: {
              in: testEstimateRequestIds,
            },
          },
        });

        // 견적 요청에 연결된 주소 삭제
        await prisma.address.deleteMany({
          where: {
            estimateRequestId: {
              in: testEstimateRequestIds,
            },
          },
        });

        // 견적 요청 삭제
        await prisma.estimateRequest.deleteMany({
          where: {
            id: {
              in: testEstimateRequestIds,
            },
          },
        });
      }

      // 해당 유저들이 생성한 견적 삭제 (드라이버가 생성한 견적)
      await prisma.estimate.deleteMany({
        where: {
          driverId: {
            in: testUserIds,
          },
        },
      });

      // 유저 프로필 삭제
      await prisma.userProfile.deleteMany({
        where: {
          userId: {
            in: testUserIds,
          },
        },
      });

      // 드라이버 프로필 삭제
      await prisma.driverProfile.deleteMany({
        where: {
          driverId: {
            in: testUserIds,
          },
        },
      });

      // 유저 삭제 (CASCADE가 아니면 위에서 수동 정리 필요)
      await prisma.user.deleteMany({
        where: {
          id: {
            in: testUserIds,
          },
        },
      });
    }

    // Redis 연결 종료
    try {
      if (redisClient.isOpen) {
        await redisClient.quit();
      }
    } catch (error) {
      // Redis 연결 종료 실패는 무시
    }

    await prisma.$disconnect();
  });

  describe('GET /api/drivers', () => {
    it('인증 없이도 드라이버 목록을 조회할 수 있어야 함', async () => {
      const res = await request(app).get('/api/drivers');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('유효하지 않은 region 값이면 400을 반환해야 함', async () => {
      const res = await request(app).get('/api/drivers?region=invalid-region');

      expect(res.status).toBe(400);
    });

    it('유효하지 않은 service 값이면 400을 반환해야 함', async () => {
      const res = await request(app).get('/api/drivers?service=INVALID_SERVICE');

      expect(res.status).toBe(400);
    });

    it('유효하지 않은 sort 값이면 400을 반환해야 함', async () => {
      const res = await request(app).get('/api/drivers?sort=invalid-sort');

      expect(res.status).toBe(400);
    });

    it('유효하지 않은 cursor 형식이면 400을 반환해야 함', async () => {
      const res = await request(app).get('/api/drivers?cursor=invalid-uuid');

      expect(res.status).toBe(400);
    });

    it('limit이 범위를 벗어나면 400을 반환해야 함', async () => {
      const res = await request(app).get('/api/drivers?limit=101');

      expect(res.status).toBe(400);
    });

    it('유효한 region으로 필터링할 수 있어야 함', async () => {
      const res = await request(app).get('/api/drivers?region=seoul&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('유효한 service로 필터링할 수 있어야 함', async () => {
      const res = await request(app).get('/api/drivers?service=HOME_MOVING&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('유효한 sort로 정렬할 수 있어야 함', async () => {
      const res = await request(app).get('/api/drivers?sort=rating&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('search 파라미터로 이름 검색할 수 있어야 함', async () => {
      const res = await request(app).get('/api/drivers?search=테스트&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('cursor와 limit을 함께 사용할 수 있어야 함', async () => {
      const res = await request(app).get(
        '/api/drivers?cursor=00000000-0000-0000-0000-000000000000&limit=10',
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('인증된 USER가 드라이버 목록을 조회할 수 있어야 함', async () => {
      const res = await request(app)
        .get('/api/drivers?limit=10')
        .set('Authorization', `Bearer ${testUserAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('PATCH /api/drivers/me/office', () => {
    it('인증 토큰이 없으면 401을 반환해야 함', async () => {
      const res = await request(app).patch('/api/drivers/me/office').send({
        officeAddress: '서울시 강남구 테헤란로 123',
      });

      expect(res.status).toBe(401);
    });

    it('USER 타입이면 403을 반환해야 함', async () => {
      const res = await request(app)
        .patch('/api/drivers/me/office')
        .set('Authorization', `Bearer ${testUserAccessToken}`)
        .send({
          officeAddress: '서울시 강남구 테헤란로 123',
        });

      expect(res.status).toBe(403);
    });

    it('officeAddress가 없으면 400을 반환해야 함', async () => {
      const res = await request(app)
        .patch('/api/drivers/me/office')
        .set('Authorization', `Bearer ${testDriverAccessToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('officeAddress가 빈 문자열이면 400을 반환해야 함', async () => {
      const res = await request(app)
        .patch('/api/drivers/me/office')
        .set('Authorization', `Bearer ${testDriverAccessToken}`)
        .send({
          officeAddress: '',
        });

      expect(res.status).toBe(400);
    });

    it('인증된 DRIVER가 사무실 정보를 업데이트할 수 있어야 함', async () => {
      const res = await request(app)
        .patch('/api/drivers/me/office')
        .set('Authorization', `Bearer ${testDriverAccessToken}`)
        .send({
          officeAddress: '서울시 강남구 테헤란로 123',
          officeZoneCode: '06000',
          officeSido: '서울',
          officeSigungu: '강남구',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.officeAddress).toBe('서울시 강남구 테헤란로 123');
    });

    it('선택적 필드만 포함해서 업데이트할 수 있어야 함', async () => {
      const res = await request(app)
        .patch('/api/drivers/me/office')
        .set('Authorization', `Bearer ${testDriverAccessToken}`)
        .send({
          officeAddress: '서울시 서초구 서초대로 456',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.officeAddress).toBe('서울시 서초구 서초대로 456');
    });
  });

  describe('GET /api/drivers/me/requests/nearby', () => {
    it('인증 토큰이 없으면 401을 반환해야 함', async () => {
      const res = await request(app).get('/api/drivers/me/requests/nearby');

      expect(res.status).toBe(401);
    });

    it('USER 타입이면 403을 반환해야 함', async () => {
      const res = await request(app)
        .get('/api/drivers/me/requests/nearby')
        .set('Authorization', `Bearer ${testUserAccessToken}`);

      expect(res.status).toBe(403);
    });

    it('radiusKm이 음수이면 400을 반환해야 함', async () => {
      const res = await request(app)
        .get('/api/drivers/me/requests/nearby?radiusKm=-1')
        .set('Authorization', `Bearer ${testDriverAccessToken}`);

      expect(res.status).toBe(400);
    });

    it('radiusKm이 200을 초과하면 400을 반환해야 함', async () => {
      const res = await request(app)
        .get('/api/drivers/me/requests/nearby?radiusKm=201')
        .set('Authorization', `Bearer ${testDriverAccessToken}`);

      expect(res.status).toBe(400);
    });

    it('유효하지 않은 radiusKm 형식이면 400을 반환해야 함', async () => {
      const res = await request(app)
        .get('/api/drivers/me/requests/nearby?radiusKm=invalid')
        .set('Authorization', `Bearer ${testDriverAccessToken}`);

      expect(res.status).toBe(400);
    });

    it('인증된 DRIVER가 근처 견적 요청을 조회할 수 있어야 함', async () => {
      const res = await request(app)
        .get('/api/drivers/me/requests/nearby')
        .set('Authorization', `Bearer ${testDriverAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('radiusKm 파라미터를 지정할 수 있어야 함', async () => {
      const res = await request(app)
        .get('/api/drivers/me/requests/nearby?radiusKm=10')
        .set('Authorization', `Bearer ${testDriverAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});

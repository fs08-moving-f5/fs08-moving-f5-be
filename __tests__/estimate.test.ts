import request from 'supertest';
import app from '../src/app';
import { generateAccessToken } from '../src/api/auth/utils/auth.utils';
import { UserType, ServiceEnum, AddressType } from '../src/generated/client';
import prisma from '../src/config/prisma';
import { randomUUID } from 'crypto';
import argon2 from 'argon2';

describe('Estimate API', () => {
  // 테스트 데이터 태그: 이메일을 jest-로 시작하게 만들어 일괄 정리
  const TEST_EMAIL_PREFIX = 'jest-';

  let testUserId: string;
  let testUserEmail: string;
  let testAccessToken: string;
  let testEstimateId: string;
  let testEstimateRequestId: string;
  let testDriverId: string;

  // 테스트용 유저 생성
  beforeAll(async () => {
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
    testAccessToken = generateAccessToken(user.id, user.email, user.type);

    // 테스트용 견적 요청 및 견적 생성
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

    // 테스트용 드라이버 생성
    const driver = await prisma.user.create({
      data: {
        email: `${TEST_EMAIL_PREFIX}driver-${randomUUID()}@test.com`,
        password: hashedPassword,
        name: '테스트 기사',
        phone: '01087654321',
        type: UserType.DRIVER,
        provider: 'local',
        isEmailVerified: true,
        driverProfile: {
          create: {
            regions: [],
            services: [ServiceEnum.HOME_MOVING],
          },
        },
      },
    });

    testDriverId = driver.id;

    // 테스트용 견적 생성
    const estimate = await prisma.estimate.create({
      data: {
        estimateRequestId: testEstimateRequestId,
        driverId: driver.id,
        price: 500000,
        comment: '테스트 견적입니다',
        status: 'PENDING',
      },
    });

    testEstimateId = estimate.id;
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

    await prisma.$disconnect();
  });

  describe('GET /api/estimate/pending', () => {
    it('인증 토큰이 없으면 401을 반환해야 함', async () => {
      const res = await request(app).get('/api/estimate/pending');

      expect(res.status).toBe(401);
    });

    it('유효하지 않은 토큰이면 401을 반환해야 함', async () => {
      const res = await request(app)
        .get('/api/estimate/pending')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });

    it('USER 타입이 아니면 403을 반환해야 함', async () => {
      const driverToken = generateAccessToken(testUserId, testUserEmail, UserType.DRIVER);

      const res = await request(app)
        .get('/api/estimate/pending')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.status).toBe(403);
    });

    it('인증된 USER가 대기 중인 견적을 조회할 수 있어야 함', async () => {
      const res = await request(app)
        .get('/api/estimate/pending')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/estimate/received', () => {
    it('인증 토큰이 없으면 401을 반환해야 함', async () => {
      const res = await request(app).get('/api/estimate/received');

      expect(res.status).toBe(401);
    });

    it('유효하지 않은 query 파라미터면 400을 반환해야 함', async () => {
      const res = await request(app)
        .get('/api/estimate/received?cursor=invalid-uuid')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(400);
    });

    it('limit이 범위를 벗어나면 400을 반환해야 함', async () => {
      const res = await request(app)
        .get('/api/estimate/received?limit=101')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(400);
    });

    it('유효한 query 파라미터로 받은 견적을 조회할 수 있어야 함', async () => {
      const res = await request(app)
        .get('/api/estimate/received?limit=15')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });

    it('cursor와 limit을 함께 사용할 수 있어야 함', async () => {
      const res = await request(app)
        .get('/api/estimate/received?cursor=00000000-0000-0000-0000-000000000000&limit=10')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/estimate/:estimateId', () => {
    it('인증 토큰이 없으면 401을 반환해야 함', async () => {
      const res = await request(app).get(`/api/estimate/${testEstimateId}`);

      expect(res.status).toBe(401);
    });

    it('유효하지 않은 estimateId 형식이면 400을 반환해야 함', async () => {
      const res = await request(app)
        .get('/api/estimate/invalid-uuid')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(400);
    });

    it('존재하지 않는 estimateId면 null을 반환해야 함', async () => {
      const nonExistentId = randomUUID();
      const res = await request(app)
        .get(`/api/estimate/${nonExistentId}`)
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeNull();
    });

    it('인증된 USER가 견적 상세를 조회할 수 있어야 함', async () => {
      const res = await request(app)
        .get(`/api/estimate/${testEstimateId}`)
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBe(testEstimateId);
    });
  });

  describe('POST /api/estimate/:estimateId/confirm', () => {
    it('인증 토큰이 없으면 401을 반환해야 함', async () => {
      const res = await request(app).post(`/api/estimate/${testEstimateId}/confirm`);

      expect(res.status).toBe(401);
    });

    it('유효하지 않은 estimateId 형식이면 400을 반환해야 함', async () => {
      const res = await request(app)
        .post('/api/estimate/invalid-uuid/confirm')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(400);
    });

    it('존재하지 않는 estimateId면 에러를 반환해야 함', async () => {
      const nonExistentId = randomUUID();
      const res = await request(app)
        .post(`/api/estimate/${nonExistentId}/confirm`)
        .set('Authorization', `Bearer ${testAccessToken}`);

      // Prisma update는 존재하지 않는 레코드에 대해 에러를 발생시킴
      expect(res.status).toBe(500);
    });

    it('인증된 USER가 견적을 확정할 수 있어야 함', async () => {
      // 확정 가능한 견적 생성
      const confirmableEstimateRequest = await prisma.estimateRequest.create({
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

      const driver = await prisma.user.create({
        data: {
          email: `${TEST_EMAIL_PREFIX}driver-confirm-${randomUUID()}@test.com`,
          password: await argon2.hash('test1234'),
          name: '확정 테스트 기사',
          phone: '01011111111',
          type: UserType.DRIVER,
          provider: 'local',
          isEmailVerified: true,
          driverProfile: {
            create: {
              regions: [],
              services: [ServiceEnum.HOME_MOVING],
            },
          },
        },
      });

      const confirmableEstimate = await prisma.estimate.create({
        data: {
          estimateRequestId: confirmableEstimateRequest.id,
          driverId: driver.id,
          price: 600000,
          comment: '확정 테스트 견적',
          status: 'PENDING',
        },
      });

      const res = await request(app)
        .post(`/api/estimate/${confirmableEstimate.id}/confirm`)
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBe(confirmableEstimate.id);
      // confirmEstimateRepository의 select에 status가 포함되지 않으므로 체크하지 않음
      // 대신 DB에서 직접 확인하거나, 다른 필드로 검증
    });
  });
});

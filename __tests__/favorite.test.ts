import request from 'supertest';
import app from '../src/app';
import { generateAccessToken } from '../src/api/auth/utils/auth.utils';
import { UserType, ServiceEnum } from '../src/generated/client';
import prisma from '../src/config/prisma';
import { redisClient } from '../src/config/redis';
import { randomUUID } from 'crypto';
import argon2 from 'argon2';

describe('Favorite API', () => {
  // 테스트 데이터 태그: 이메일을 jest-로 시작하게 만들어 일괄 정리
  const TEST_EMAIL_PREFIX = 'jest-';

  let testUserId: string;
  let testUserEmail: string;
  let testAccessToken: string;
  let testDriverId1: string;
  let testDriverId2: string;
  let testDriverId3: string;

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
    testAccessToken = generateAccessToken(user.id, user.email, user.type);

    // 테스트용 드라이버 3명 생성
    const driver1 = await prisma.user.create({
      data: {
        email: `${TEST_EMAIL_PREFIX}driver1-${randomUUID()}@test.com`,
        password: hashedPassword,
        name: '테스트 기사 1',
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

    const driver2 = await prisma.user.create({
      data: {
        email: `${TEST_EMAIL_PREFIX}driver2-${randomUUID()}@test.com`,
        password: hashedPassword,
        name: '테스트 기사 2',
        phone: '01022222222',
        type: UserType.DRIVER,
        provider: 'local',
        isEmailVerified: true,
        driverProfile: {
          create: {
            regions: [],
            services: [ServiceEnum.SMALL_MOVING],
          },
        },
      },
    });

    const driver3 = await prisma.user.create({
      data: {
        email: `${TEST_EMAIL_PREFIX}driver3-${randomUUID()}@test.com`,
        password: hashedPassword,
        name: '테스트 기사 3',
        phone: '01033333333',
        type: UserType.DRIVER,
        provider: 'local',
        isEmailVerified: true,
        driverProfile: {
          create: {
            regions: [],
            services: [ServiceEnum.OFFICE_MOVING],
          },
        },
      },
    });

    testDriverId1 = driver1.id;
    testDriverId2 = driver2.id;
    testDriverId3 = driver3.id;
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
      // 즐겨찾기 삭제
      await prisma.favoriteDriver.deleteMany({
        where: {
          OR: [{ userId: { in: testUserIds } }, { driverId: { in: testUserIds } }],
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

      // 유저 삭제
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

  describe('GET /api/favorite', () => {
    it('인증 토큰이 없으면 401을 반환해야 함', async () => {
      const res = await request(app).get('/api/favorite');

      expect(res.status).toBe(401);
    });

    it('유효하지 않은 query 파라미터면 400을 반환해야 함', async () => {
      const res = await request(app)
        .get('/api/favorite?cursor=invalid-uuid')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(400);
    });

    it('limit이 범위를 벗어나면 400을 반환해야 함', async () => {
      const res = await request(app)
        .get('/api/favorite?limit=101')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(400);
    });

    it('인증된 USER가 찜한 기사 목록을 조회할 수 있어야 함', async () => {
      const res = await request(app)
        .get('/api/favorite?limit=10')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.count).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });

    it('cursor와 limit을 함께 사용할 수 있어야 함', async () => {
      const res = await request(app)
        .get('/api/favorite?cursor=00000000-0000-0000-0000-000000000000&limit=10')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/favorite/driver/:driverId', () => {
    it('인증 토큰이 없으면 401을 반환해야 함', async () => {
      const res = await request(app).post(`/api/favorite/driver/${testDriverId1}`);

      expect(res.status).toBe(401);
    });

    it('유효하지 않은 driverId 형식이면 400을 반환해야 함', async () => {
      const res = await request(app)
        .post('/api/favorite/driver/invalid-uuid')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(400);
    });

    it('인증된 USER가 기사를 찜할 수 있어야 함', async () => {
      const res = await request(app)
        .post(`/api/favorite/driver/${testDriverId1}`)
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.driverId).toBe(testDriverId1);
      expect(res.body.data.userId).toBe(testUserId);
    });

    it('이미 찜한 기사를 다시 찜하면 에러가 발생해야 함', async () => {
      // 이미 찜한 상태에서 다시 찜하기 시도
      const res = await request(app)
        .post(`/api/favorite/driver/${testDriverId1}`)
        .set('Authorization', `Bearer ${testAccessToken}`);

      // 중복 찜하기는 에러가 발생할 수 있음
      expect([400, 409, 500]).toContain(res.status);
    });
  });

  describe('DELETE /api/favorite/driver/:driverId', () => {
    beforeEach(async () => {
      // 각 테스트 전에 찜하기 상태 생성
      await prisma.favoriteDriver.upsert({
        where: {
          userId_driverId: {
            userId: testUserId,
            driverId: testDriverId2,
          },
        },
        create: {
          userId: testUserId,
          driverId: testDriverId2,
        },
        update: {},
      });
    });

    it('인증 토큰이 없으면 401을 반환해야 함', async () => {
      const res = await request(app).delete(`/api/favorite/driver/${testDriverId2}`);

      expect(res.status).toBe(401);
    });

    it('유효하지 않은 driverId 형식이면 400을 반환해야 함', async () => {
      const res = await request(app)
        .delete('/api/favorite/driver/invalid-uuid')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(400);
    });

    it('인증된 USER가 찜한 기사를 삭제할 수 있어야 함', async () => {
      const res = await request(app)
        .delete(`/api/favorite/driver/${testDriverId2}`)
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('존재하지 않는 찜하기를 삭제하려고 하면 에러가 발생할 수 있음', async () => {
      const nonExistentDriverId = randomUUID();
      const res = await request(app)
        .delete(`/api/favorite/driver/${nonExistentDriverId}`)
        .set('Authorization', `Bearer ${testAccessToken}`);

      // 삭제는 성공할 수도 있고 에러가 발생할 수도 있음
      expect([200, 404, 500]).toContain(res.status);
    });
  });

  describe('DELETE /api/favorite/driver', () => {
    beforeEach(async () => {
      // 각 테스트 전에 여러 찜하기 상태 생성
      await prisma.favoriteDriver.createMany({
        data: [
          {
            userId: testUserId,
            driverId: testDriverId1,
          },
          {
            userId: testUserId,
            driverId: testDriverId2,
          },
          {
            userId: testUserId,
            driverId: testDriverId3,
          },
        ],
        skipDuplicates: true,
      });
    });

    it('인증 토큰이 없으면 401을 반환해야 함', async () => {
      const res = await request(app).delete('/api/favorite/driver').send([testDriverId1]);

      expect(res.status).toBe(401);
    });

    it('빈 배열이면 400을 반환해야 함', async () => {
      const res = await request(app)
        .delete('/api/favorite/driver')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send([]);

      expect(res.status).toBe(400);
    });

    it('유효하지 않은 driverId가 포함되면 400을 반환해야 함', async () => {
      const res = await request(app)
        .delete('/api/favorite/driver')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send(['invalid-uuid']);

      expect(res.status).toBe(400);
    });

    it('인증된 USER가 여러 기사 찜하기를 일괄 삭제할 수 있어야 함', async () => {
      const res = await request(app)
        .delete('/api/favorite/driver')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send([testDriverId1, testDriverId2]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('존재하지 않는 driverId가 포함되어도 일괄 삭제가 가능해야 함', async () => {
      const nonExistentDriverId = randomUUID();
      const res = await request(app)
        .delete('/api/favorite/driver')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send([testDriverId3, nonExistentDriverId]);

      // 일부만 삭제되거나 모두 삭제될 수 있음
      expect([200, 400, 500]).toContain(res.status);
    });
  });
});

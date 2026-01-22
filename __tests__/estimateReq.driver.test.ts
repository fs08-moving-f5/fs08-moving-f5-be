import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prisma';
import { randomUUID } from 'crypto';
import argon2 from 'argon2';
import { generateAccessToken } from '../src/api/auth/utils/auth.utils';
import { UserType, ServiceEnum, AddressType, EstimateStatus } from '../src/generated/enums';

describe('Driver EstimateRequest API (E2E)', () => {
  const EMAIL_PREFIX = 'jest-driver-';

  let driverId: string;
  let driverToken: string;
  let userId: string;
  let estimateRequestId: string;
  let estimateId: string;

  beforeAll(async () => {
    const password = await argon2.hash('test1234');

    // 유저 생성
    const user = await prisma.user.create({
      data: {
        email: `${EMAIL_PREFIX}user-${randomUUID()}@test.com`,
        password,
        name: '테스트 유저',
        phone: '01011112222',
        type: UserType.USER,
        provider: 'local',
        isEmailVerified: true,
      },
    });
    userId = user.id;

    // 기사 생성
    const driver = await prisma.user.create({
      data: {
        email: `${EMAIL_PREFIX}driver-${randomUUID()}@test.com`,
        password,
        name: '테스트 기사',
        phone: '01099998888',
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
    driverId = driver.id;
    driverToken = generateAccessToken(driver.id, driver.email, driver.type);

    // 견적 요청 생성
    const req = await prisma.estimateRequest.create({
      data: {
        userId,
        movingType: ServiceEnum.HOME_MOVING,
        movingDate: new Date('2026-01-01'),
        isDesignated: false,
        status: EstimateStatus.PENDING,
        addresses: {
          create: [
            {
              addressType: AddressType.FROM,
              zoneCode: '06000',
              address: '서울 강남구 테헤란로',
              addressEnglish: 'Teheran-ro, Gangnam-gu, Seoul',
              sido: '서울',
              sidoEnglish: 'Seoul',
              sigungu: '강남구',
              sigunguEnglish: 'Gangnam-gu',
              lat: 37.498,
              lng: 127.027,
            },
            {
              addressType: AddressType.TO,
              zoneCode: '06500',
              address: '서울 서초구 서초대로',
              addressEnglish: 'Seocho-daero, Seocho-gu, Seoul',
              sido: '서울',
              sidoEnglish: 'Seoul',
              sigungu: '서초구',
              sigunguEnglish: 'Seocho-gu',
              lat: 37.491,
              lng: 127.007,
            },
          ],
        },
      },
    });
    
    estimateRequestId = req.id;
  });

  afterAll(async () => {
    await prisma.estimate.deleteMany({
      where: {
        OR: [{ driverId }, { estimateRequestId }],
      },
    });

    await prisma.estimateRequest.deleteMany({ where: { userId } });
    await prisma.driverProfile.deleteMany({ where: { driverId } });
    await prisma.user.deleteMany({
      where: {
        email: { startsWith: EMAIL_PREFIX },
      },
    });

    await prisma.$disconnect();
  });

  describe('GET /api/estimate-request/driver/requests', () => {
    it('401 - 인증 토큰 없음', async () => {
      const res = await request(app).get('/api/estimate-request/driver/requests');
      expect(res.status).toBe(401);
    });

    it('200 - 받은 요청 목록 조회', async () => {
      const res = await request(app)
        .get('/api/estimate-request/driver/requests')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requests.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/estimate-request/driver/requests/:id/create', () => {
    it('400 - 유효하지 않은 body', async () => {
      const res = await request(app)
        .post(`/api/estimate-request/driver/requests/${estimateRequestId}/create`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ price: 1000, comment: '짧음' });

      expect(res.status).toBe(400);
    });

    it('200 - 견적 생성 성공', async () => {
      const res = await request(app)
        .post(`/api/estimate-request/driver/requests/${estimateRequestId}/create`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          price: 500000,
          comment: '정상적인 테스트 견적입니다.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();

      estimateId = res.body.data.id;
    });

    it('400 - 중복 견적 제출', async () => {
      const res = await request(app)
        .post(`/api/estimate-request/driver/requests/${estimateRequestId}/create`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          price: 600000,
          comment: '중복 견적',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/estimate-request/driver/confirms', () => {
    it('200 - 확정 견적 목록 조회', async () => {
      const res = await request(app)
        .get('/api/estimate-request/driver/confirms')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/estimate-request/driver/confirms/:estimateId', () => {
    it('404 - 존재하지 않는 견적', async () => {
      const res = await request(app)
        .get(`/api/estimate-request/driver/confirms/${randomUUID()}`)
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.status).toBe(404);
    });

    it('200 - 확정 견적 상세 조회', async () => {
      const res = await request(app)
        .get(`/api/estimate-request/driver/confirms/${estimateId}`)
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(estimateId);
    });
  });

  describe('GET /api/estimate-request/driver/rejects', () => {
    it('200 - 반려 견적 목록 조회', async () => {
      const res = await request(app)
        .get('/api/estimate-request/driver/rejects')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

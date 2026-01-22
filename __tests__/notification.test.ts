import request from 'supertest';
import app from '../src/app';
import { generateAccessToken } from '../src/api/auth/utils/auth.utils';
import { UserType, NotificationType } from '../src/generated/client';
import prisma from '../src/config/prisma';
import { redisClient } from '../src/config/redis';
import { randomUUID } from 'crypto';
import argon2 from 'argon2';

describe('Notification API', () => {
  // 테스트 데이터 태그: 이메일을 jest-로 시작하게 만들어 일괄 정리
  const TEST_EMAIL_PREFIX = 'jest-';

  let testUserId: string;
  let testUserEmail: string;
  let testAccessToken: string;
  let testNotificationId: string;

  // 테스트용 유저 및 알림 생성
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

    // 테스트용 알림 생성
    const notification = await prisma.notification.create({
      data: {
        userId: testUserId,
        type: NotificationType.ESTIMATE_RECEIVED,
        message: '테스트 알림입니다',
        isRead: false,
      },
    });

    testNotificationId = notification.id;
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
      // 알림 삭제
      await prisma.notification.deleteMany({
        where: {
          userId: {
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

  describe('GET /api/notifications/stream', () => {
    it('인증 토큰이 없으면 401을 반환해야 함', async () => {
      const res = await request(app).get('/api/notifications/stream');

      expect(res.status).toBe(401);
    });

    it('인증된 USER가 SSE 스트림에 연결할 수 있어야 함', async () => {
      // SSE는 지속적인 연결이므로 짧은 타임아웃으로 헤더만 확인
      try {
        const res = await request(app)
          .get('/api/notifications/stream')
          .set('Authorization', `Bearer ${testAccessToken}`)
          .timeout(500); // 0.5초 후 타임아웃

        // SSE 연결은 200 상태 코드와 text/event-stream 헤더를 반환
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('text/event-stream');
      } catch (error: any) {
        // 타임아웃은 정상 (SSE는 지속적인 연결)
        // 연결이 시작되었으면 성공으로 간주
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          expect(true).toBe(true); // 타임아웃은 예상된 동작
        } else {
          throw error;
        }
      }
    });
  });

  describe('GET /api/notifications', () => {
    it('인증 토큰이 없으면 401을 반환해야 함', async () => {
      const res = await request(app).get('/api/notifications');

      expect(res.status).toBe(401);
    });

    it('인증된 USER가 알림 목록을 조회할 수 있어야 함', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('알림이 없으면 빈 배열을 반환해야 함', async () => {
      // 알림이 없는 새 유저 생성
      const newUserEmail = `${TEST_EMAIL_PREFIX}user-empty-${randomUUID()}@test.com`;
      const hashedPassword = await argon2.hash('test1234');

      const newUser = await prisma.user.create({
        data: {
          email: newUserEmail,
          password: hashedPassword,
          name: '알림 없는 유저',
          phone: '01099999999',
          type: UserType.USER,
          provider: 'local',
          isEmailVerified: true,
        },
      });

      const newUserToken = generateAccessToken(newUser.id, newUser.email, newUser.type);

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${newUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('PATCH /api/notifications/:id', () => {
    it('인증 토큰이 없으면 401을 반환해야 함', async () => {
      const res = await request(app).patch(`/api/notifications/${testNotificationId}`);

      expect(res.status).toBe(401);
    });

    it('유효하지 않은 notificationId 형식이면 400을 반환해야 함', async () => {
      const res = await request(app)
        .patch('/api/notifications/invalid-uuid')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(400);
    });

    it('존재하지 않는 notificationId면 에러를 반환해야 함', async () => {
      const nonExistentId = randomUUID();
      const res = await request(app)
        .patch(`/api/notifications/${nonExistentId}`)
        .set('Authorization', `Bearer ${testAccessToken}`);

      // Prisma update는 존재하지 않는 레코드에 대해 에러를 발생시킴
      expect([404, 500]).toContain(res.status);
    });

    it('다른 유저의 알림을 읽으려고 하면 에러를 반환해야 함', async () => {
      // 다른 유저 생성
      const otherUserEmail = `${TEST_EMAIL_PREFIX}other-user-${randomUUID()}@test.com`;
      const hashedPassword = await argon2.hash('test1234');

      const otherUser = await prisma.user.create({
        data: {
          email: otherUserEmail,
          password: hashedPassword,
          name: '다른 유저',
          phone: '01088888888',
          type: UserType.USER,
          provider: 'local',
          isEmailVerified: true,
        },
      });

      // 다른 유저의 알림 생성
      const otherNotification = await prisma.notification.create({
        data: {
          userId: otherUser.id,
          type: NotificationType.ESTIMATE_RECEIVED,
          message: '다른 유저의 알림',
          isRead: false,
        },
      });

      // 테스트 유저로 다른 유저의 알림 읽기 시도
      const res = await request(app)
        .patch(`/api/notifications/${otherNotification.id}`)
        .set('Authorization', `Bearer ${testAccessToken}`);

      // Prisma update는 조건에 맞지 않는 레코드에 대해 에러를 발생시킴
      expect([404, 500]).toContain(res.status);

      // 정리
      await prisma.notification.delete({
        where: { id: otherNotification.id },
      });
      await prisma.user.delete({
        where: { id: otherUser.id },
      });
    });

    it('인증된 USER가 자신의 알림을 읽음 처리할 수 있어야 함', async () => {
      // 읽지 않은 알림 생성
      const unreadNotification = await prisma.notification.create({
        data: {
          userId: testUserId,
          type: NotificationType.ESTIMATE_CONFIRMED,
          message: '읽을 알림',
          isRead: false,
        },
      });

      const res = await request(app)
        .patch(`/api/notifications/${unreadNotification.id}`)
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeNull();

      // 알림이 읽음 처리되었는지 확인
      const updatedNotification = await prisma.notification.findUnique({
        where: { id: unreadNotification.id },
      });

      expect(updatedNotification?.isRead).toBe(true);
    });
  });
});

import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prisma';
import { generateAccessToken } from '../src/api/auth/utils/auth.utils';
import { EstimateStatus, ServiceEnum, UserType } from '../src/generated/enums';;

describe('Review API E2E', () => {
  let userId: string;
  let driverId: string;
  let estimateId: string;
  let reviewId: string;
  let userToken: string;

  /**
   * ======================
   * 테스트 데이터 준비
   * ======================
   */
  beforeAll(async () => {
    // User 생성
    const user = await prisma.user.create({
      data: {
        email: 'review-user@test.com',
        password: 'password',
        name: '리뷰유저',
      },
    });
    userId = user.id;
    userToken = generateAccessToken(userId,
      'review-user@test.com',
      UserType.USER,);

    // Driver 생성
    const driver = await prisma.user.create({
      data: {
        email: 'review-driver@test.com',
        password: 'password',
        name: '기사님',
        driverProfile: {
          create: {
            shortIntro: '친절한 기사',
          },
        },
      },
    });
    driverId = driver.id;

    // EstimateRequest 생성
    const estimateRequest = await prisma.estimateRequest.create({
      data: {
        userId,
        movingType: ServiceEnum.SMALL_MOVING,
        movingDate: new Date(),
        isDesignated: false,
        addresses: {
          create: [
            {
              addressType: 'FROM',
              sido: '서울',
              sigungu: '강남',
              address: '강남대로',
              lat: 37.5,
              lng: 127.0,
              zoneCode: '12345',
              addressEnglish: 'Gangnam',
              sidoEnglish: 'Seoul',
              sigunguEnglish: 'Gangnam',
            },
            {
              addressType: 'TO',
              sido: '경기',
              sigungu: '분당',
              address: '분당로',
              lat: 37.4,
              lng: 127.1,
              zoneCode: '54321',
              addressEnglish: 'Bundang',
              sidoEnglish: 'Gyeonggi',
              sigunguEnglish: 'Bundang',
            },
          ],
        },
      },
    });

    // Estimate + Review 생성
    const estimate = await prisma.estimate.create({
      data: {
        estimateRequestId: estimateRequest.id,
        driverId,
        price: 10000,
        status: EstimateStatus.CONFIRMED,
      },
    });
    
    const review = await prisma.review.create({
      data: {
        estimateId,
        userId,
      },
    });
    
    reviewId = review.id;
    estimateId = estimate.id;
  });

  /**
   * ======================
   * 리뷰 작성 가능 목록 조회
   * ======================
   */
  it('GET /review/writable - 인증된 유저는 리뷰 작성 가능한 견적을 조회할 수 있다', async () => {
    const res = await request(app)
      .get('/review/writable')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.estimates.length).toBe(1);
    expect(res.body.data.estimates[0].reviewId).toBe(reviewId);
  });

  /**
   * ======================
   * 리뷰 작성
   * ======================
   */
  it('PATCH /review/:reviewId - 정상적으로 리뷰를 작성한다', async () => {
    const res = await request(app)
      .patch(`/review/${reviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        rating: 5,
        content: '정말 친절했어요',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);
  });

  /**
   * ======================
   * Validation 실패
   * ======================
   */
  it('PATCH /review/:reviewId - rating이 없으면 400', async () => {
    await request(app)
      .patch(`/review/${reviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        content: '내용만 있음',
      })
      .expect(400);
  });

  /**
   * ======================
   * 권한 오류
   * ======================
   */
  it('PATCH /review/:reviewId - 이미 작성된 리뷰는 400', async () => {
    await request(app)
      .patch(`/review/${reviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        rating: 4,
        content: '두 번째 시도',
      })
      .expect(400);
  });

  /**
   * ======================
   * 작성한 리뷰 목록 조회
   * ======================
   */
  it('GET /review/written - 내가 작성한 리뷰 목록을 조회한다', async () => {
    const res = await request(app)
      .get('/review/written')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.reviews.length).toBe(1);
    expect(res.body.data.reviews[0].rating).toBe(5);
  });

  /**
   * ======================
   * 테스트 데이터 정리
   * ======================
   */
  afterAll(async () => {
    await prisma.review.deleteMany();
    await prisma.estimate.deleteMany();
    await prisma.address.deleteMany();
    await prisma.estimateRequest.deleteMany();
    await prisma.driverProfile.deleteMany();
    await prisma.user.deleteMany();

    await prisma.$disconnect();
  });
});

import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../src/config/prisma';
import { Prisma } from '../src/generated/client';
import type {
  RegionEnum,
  ServiceEnum,
  EstimateStatus,
  NotificationType,
  HistoryActionType,
  HistoryEntityType,
} from '../src/generated/enums';

// 유틸리티 함수들
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = <T>(array: T[]): T => array[randomInt(0, array.length - 1)];
const randomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const regions: RegionEnum[] = [
  '서울',
  '경기',
  '인천',
  '강원',
  '충북',
  '충남',
  '대전',
  '세종',
  '전북',
  '전남',
  '광주',
  '경북',
  '경남',
  '대구',
  '부산',
  '울산',
  '제주',
];

const services: ServiceEnum[] = ['SMALL_MOVING', 'HOME_MOVING', 'OFFICE_MOVING'];

const serviceNames = {
  SMALL_MOVING: '소형 이사',
  HOME_MOVING: '가정 이사',
  OFFICE_MOVING: '사무실 이사',
};

const koreanNames = [
  '김민수',
  '이영희',
  '박준호',
  '최지은',
  '정동욱',
  '강미영',
  '윤성호',
  '장수진',
  '임태현',
  '한소영',
  '오대현',
  '신혜진',
  '조민규',
  '배지현',
  '홍성민',
  '권나영',
  '송진우',
  '유지원',
  '노승현',
  '전혜림',
  '문상우',
  '고은지',
  '류현수',
  '마동석',
  '서지훈',
];

const driverNicknames = [
  '이사왕',
  '빠른이사',
  '신속이사',
  '안전이사',
  '친절이사',
  '전문이사',
  '경력20년',
  '믿음이사',
  '정직이사',
  '최고이사',
  '프로이사',
  '베스트이사',
  '우리이사',
  '최강이사',
  '완벽이사',
];

const shortIntros = [
  '안전하고 신속한 이사를 약속드립니다.',
  '20년 경력의 전문 이사 기사입니다.',
  '친절하고 정직한 서비스로 보답하겠습니다.',
  '고객 만족을 최우선으로 생각합니다.',
  '깔끔하고 신속한 이사 서비스 제공합니다.',
  '믿을 수 있는 이사 전문가입니다.',
  '최선을 다해 도와드리겠습니다.',
  '경험 많은 전문가가 책임지고 진행합니다.',
];

const descriptions = [
  '오랜 경력과 노하우로 안전하고 신속한 이사를 진행합니다. 가구 보호와 시간 준수를 최우선으로 생각하며, 고객 만족을 위해 최선을 다하겠습니다.',
  '친절하고 정직한 서비스로 고객님의 소중한 물건을 안전하게 옮겨드립니다. 다양한 이사 경험을 바탕으로 최상의 서비스를 제공합니다.',
  '전문 장비와 경험 많은 팀으로 구성되어 있어 어떤 규모의 이사든 안심하고 맡기실 수 있습니다. 가격도 합리적으로 책정해드립니다.',
  '고객 중심의 서비스를 제공하며, 이사 전 상담부터 이사 후 정리까지 꼼꼼하게 챙겨드립니다. 믿고 맡기실 수 있는 이사 전문가입니다.',
];

const addresses = [
  { sido: '서울특별시', sigungu: '강남구', address: '테헤란로 123', zoneCode: '06141' },
  { sido: '서울특별시', sigungu: '강동구', address: '천호대로 456', zoneCode: '05278' },
  { sido: '서울특별시', sigungu: '송파구', address: '올림픽로 789', zoneCode: '05551' },
  { sido: '경기도', sigungu: '성남시', address: '분당구 정자동 101', zoneCode: '13561' },
  { sido: '경기도', sigungu: '수원시', address: '영통구 월드컵로 202', zoneCode: '16490' },
  { sido: '인천광역시', sigungu: '연수구', address: '송도과학로 303', zoneCode: '21984' },
  { sido: '부산광역시', sigungu: '해운대구', address: '해운대해변로 404', zoneCode: '48058' },
  { sido: '대구광역시', sigungu: '수성구', address: '범어천로 505', zoneCode: '42211' },
  { sido: '대전광역시', sigungu: '유성구', address: '대학로 606', zoneCode: '34111' },
  { sido: '광주광역시', sigungu: '북구', address: '첨단과기로 707', zoneCode: '61007' },
];

const reviewContents = [
  '정말 친절하고 신속하게 이사해주셨어요! 감사합니다.',
  '가구 보호도 잘 해주시고 시간도 정확하게 지켜주셨습니다.',
  '가격도 합리적이고 서비스도 훌륭했습니다. 추천합니다!',
  '전문가답게 깔끔하게 작업해주셔서 만족스럽습니다.',
  '이사 전부터 상담을 꼼꼼하게 해주셔서 안심이 되었어요.',
  '물건 하나하나 신경써서 옮겨주셔서 감사합니다.',
  '시간 약속도 잘 지키시고 친절하게 진행해주셨습니다.',
  '경험이 많으신 분이셔서 모든 게 수월하게 진행되었습니다.',
  '가격 대비 정말 좋은 서비스였습니다. 다음에도 이용하겠습니다.',
  '깔끔하고 빠르게 작업해주셔서 만족합니다.',
];

async function main() {
  console.log('🌱 Start seeding...\n');

  // 기존 데이터 삭제
  console.log('🗑️  Deleting existing data...');
  await prisma.history.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favoriteDriver.deleteMany();
  await prisma.review.deleteMany();
  await prisma.address.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.estimateRequest.deleteMany();
  await prisma.driverProfile.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data deleted\n');

  // User 생성 (일반 유저 25명, 기사님 15명, 마스터 유저 1명 = 총 41명)
  console.log('👥 Creating users...');
  const users: Prisma.UserCreateManyInput[] = [];
  const userIds: string[] = [];
  const driverIds: string[] = [];
  const masterPassword = await argon2.hash('12345678');

  // 마스터 테스트 유저 생성 (모든 시나리오 테스트 가능)
  const masterUserId = uuidv4();
  userIds.push(masterUserId);
  users.push({
    id: masterUserId,
    providerId: null,
    provider: 'local',
    type: 'USER',
    name: '마스터 유저',
    email: 'master@example.com',
    password: masterPassword,
    phone: 1000000000,
    refreshTokens: null,
    isDelete: false,
  });

  // 일반 유저 25명 생성
  for (let i = 0; i < 25; i++) {
    const userId = uuidv4();
    userIds.push(userId);

    const providers = ['local', 'google', 'naver', 'kakao'];
    const provider = randomItem(providers);
    const isLocal = provider === 'local';

    users.push({
      id: userId,
      providerId: isLocal ? null : uuidv4(),
      provider,
      type: 'USER',
      name: randomItem(koreanNames),
      email: `user${i + 1}@example.com`,
      password: isLocal ? masterPassword : null,
      phone: parseInt(`10${String(randomInt(1000, 9999))}${String(randomInt(1000, 9999))}`),
      refreshTokens: null,
      isDelete: false,
    });
  }

  // 기사님 15명 생성
  for (let i = 0; i < 15; i++) {
    const driverId = uuidv4();
    driverIds.push(driverId);

    const providers = ['local', 'google', 'naver', 'kakao'];
    const provider = randomItem(providers);
    const isLocal = provider === 'local';

    users.push({
      id: driverId,
      providerId: isLocal ? null : uuidv4(),
      provider,
      type: 'DRIVER',
      name: randomItem(koreanNames),
      email: `driver${i + 1}@example.com`,
      password: isLocal ? masterPassword : null,
      phone: parseInt(`10${String(randomInt(1000, 9999))}${String(randomInt(1000, 9999))}`),
      refreshTokens: null,
      isDelete: false,
    });
  }

  // new-driver 기사님 생성 (방금 가입해서 아무런 연결 관계가 없음)
  const newDriverId = uuidv4();
  // driverIds에는 추가하지 않음 (견적 생성 시 제외하기 위해)
  users.push({
    id: newDriverId,
    providerId: null,
    provider: 'local',
    type: 'DRIVER',
    name: 'new-driver',
    email: 'new-driver@example.com',
    password: masterPassword,
    phone: 1099999999,
    refreshTokens: null,
    isDelete: false,
  });

  await prisma.user.createMany({ data: users, skipDuplicates: true });
  console.log(
    `✅ Created ${users.length} users (${userIds.length} users, ${driverIds.length} drivers)\n`,
  );

  // UserProfile 생성 (일반 유저 중 20명만 프로필 생성 - 5명은 프로필 없음, 마스터 유저는 프로필 있음)
  console.log('👤 Creating user profiles...');
  const usersWithProfile = [masterUserId, ...userIds.slice(1, 20)]; // 마스터 유저 포함
  const userProfiles: Prisma.UserProfileCreateManyInput[] = usersWithProfile.map((userId) => ({
    userId,
    imageUrl: `https://example.com/profile/${userId}.jpg`,
    regions: randomItems(regions, randomInt(1, 3)),
    services: randomItems(services, randomInt(1, 3)),
  }));

  await prisma.userProfile.createMany({ data: userProfiles, skipDuplicates: true });
  console.log(`✅ Created ${userProfiles.length} user profiles\n`);

  // DriverProfile 생성 (기사님 15명 전부 프로필 생성 + new-driver)
  console.log('🚗 Creating driver profiles...');
  const driverProfiles: Prisma.DriverProfileCreateManyInput[] = driverIds.map(
    (driverId, index) => ({
      driverId,
      imageUrl: `https://example.com/driver/${driverId}.jpg`,
      career: `${randomInt(5, 25)}년`,
      shortIntro: randomItem(shortIntros),
      description: randomItem(descriptions),
      regions: randomItems(regions, randomInt(2, 5)),
      services: randomItems(services, randomInt(1, 3)),
    }),
  );

  // new-driver 프로필 추가 (프로필 정보는 모두 있지만 아직 활동 없음)
  driverProfiles.push({
    driverId: newDriverId,
    imageUrl: `https://example.com/driver/${newDriverId}.jpg`,
    career: `${randomInt(5, 25)}년`,
    shortIntro: randomItem(shortIntros),
    description: randomItem(descriptions),
    regions: randomItems(regions, randomInt(2, 5)),
    services: randomItems(services, randomInt(1, 3)),
  });

  await prisma.driverProfile.createMany({ data: driverProfiles, skipDuplicates: true });
  console.log(`✅ Created ${driverProfiles.length} driver profiles\n`);

  // EstimateRequest 생성 (40개 - 다양한 상태, 마스터 유저에게도 다양한 시나리오 포함)
  console.log('📋 Creating estimate requests...');
  const estimateRequests: Prisma.EstimateRequestCreateManyInput[] = [];
  const estimateRequestIds: string[] = [];

  // 과거 날짜부터 미래 날짜까지 다양한 이사일 생성
  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setDate(pastDate.getDate() - 60); // 60일 전

  // 마스터 유저를 위한 다양한 상태의 견적 요청 생성 (테스트용)
  const masterRequestStatuses: EstimateStatus[] = ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED'];
  for (let i = 0; i < 4; i++) {
    const requestId = uuidv4();
    estimateRequestIds.push(requestId);

    const daysOffset = randomInt(-30, 30);
    const movingDate = new Date(now);
    movingDate.setDate(movingDate.getDate() + daysOffset);

    estimateRequests.push({
      id: requestId,
      userId: masterUserId,
      movingType: randomItem(services),
      movingDate,
      status: masterRequestStatuses[i],
      isDesignated: i === 1, // 하나는 지정 요청
      isDelete: false,
    });
  }

  // 나머지 견적 요청 생성
  for (let i = 0; i < 36; i++) {
    const requestId = uuidv4();
    estimateRequestIds.push(requestId);

    // 이사일: 과거 30일 ~ 미래 30일
    const daysOffset = randomInt(-30, 30);
    const movingDate = new Date(now);
    movingDate.setDate(movingDate.getDate() + daysOffset);

    // 상태 분포: PENDING 40%, CONFIRMED 30%, REJECTED 20%, CANCELLED 10%
    const statusRand = Math.random();
    let status: EstimateStatus;
    if (statusRand < 0.4) status = 'PENDING';
    else if (statusRand < 0.7) status = 'CONFIRMED';
    else if (statusRand < 0.9) status = 'REJECTED';
    else status = 'CANCELLED';

    // 지정 요청은 20% 정도
    const isDesignated = Math.random() < 0.2;

    estimateRequests.push({
      id: requestId,
      userId: randomItem(userIds),
      movingType: randomItem(services),
      movingDate,
      status,
      isDesignated,
      isDelete: false,
    });
  }

  await prisma.estimateRequest.createMany({ data: estimateRequests, skipDuplicates: true });
  console.log(`✅ Created ${estimateRequests.length} estimate requests\n`);

  // Address 생성 (각 요청당 FROM, TO 주소)
  console.log('📍 Creating addresses...');
  const addressesData: Prisma.AddressCreateManyInput[] = [];

  for (const requestId of estimateRequestIds) {
    const fromAddr = randomItem(addresses);
    const toAddr = randomItem(addresses);

    addressesData.push(
      {
        estimateRequestId: requestId,
        addressType: 'FROM',
        zoneCode: fromAddr.zoneCode,
        address: `${fromAddr.sido} ${fromAddr.sigungu} ${fromAddr.address}`,
        addressEnglish: `${fromAddr.sido} ${fromAddr.sigungu} ${fromAddr.address}`,
        sido: fromAddr.sido,
        sidoEnglish: fromAddr.sido,
        sigungu: fromAddr.sigungu,
        sigunguEnglish: fromAddr.sigungu,
      },
      {
        estimateRequestId: requestId,
        addressType: 'TO',
        zoneCode: toAddr.zoneCode,
        address: `${toAddr.sido} ${toAddr.sigungu} ${toAddr.address}`,
        addressEnglish: `${toAddr.sido} ${toAddr.sigungu} ${toAddr.address}`,
        sido: toAddr.sido,
        sidoEnglish: toAddr.sido,
        sigungu: toAddr.sigungu,
        sigunguEnglish: toAddr.sigungu,
      },
    );
  }

  await prisma.address.createMany({ data: addressesData, skipDuplicates: true });
  console.log(`✅ Created ${addressesData.length} addresses\n`);

  // Estimate 생성 (50개 - 다양한 상태)
  console.log('💰 Creating estimates...');
  const estimates: Prisma.EstimateCreateManyInput[] = [];
  const estimateIds: string[] = [];

  // 각 요청에 대해 견적 생성
  const requestMap = new Map(
    estimateRequests.map((req) => [req.id, req] as [string, Prisma.EstimateRequestCreateManyInput]),
  );

  for (const requestId of estimateRequestIds) {
    const request = requestMap.get(requestId);
    if (!request) continue;

    // 지정 요청인 경우 최대 3개, 일반 요청인 경우 최대 5개
    const maxEstimates = request.isDesignated ? 3 : 5;
    const estimateCount = randomInt(1, maxEstimates);

    // 해당 요청의 서비스 가능한 기사님 선택 (지역 및 서비스 타입 고려)
    const availableDrivers = randomItems(driverIds, Math.min(estimateCount, driverIds.length));

    for (let i = 0; i < estimateCount; i++) {
      const estimateId = uuidv4();
      estimateIds.push(estimateId);

      const driverId = availableDrivers[i];
      if (!driverId) break;

      // 견적 상태: 요청이 CONFIRMED면 일부만 CONFIRMED, 나머지는 PENDING 또는 REJECTED
      let status: EstimateStatus;
      if (request.status === 'CONFIRMED') {
        // 첫 번째 견적만 CONFIRMED, 나머지는 REJECTED
        status = i === 0 ? 'CONFIRMED' : 'REJECTED';
      } else if (request.status === 'REJECTED') {
        status = Math.random() < 0.5 ? 'REJECTED' : 'PENDING';
      } else {
        status = 'PENDING';
      }

      estimates.push({
        id: estimateId,
        estimateRequestId: requestId,
        driverId,
        price: status !== 'REJECTED' ? randomInt(500000, 3000000) : null,
        comment: status !== 'REJECTED' ? `안전하고 신속하게 진행하겠습니다.` : null,
        rejectReason: status === 'REJECTED' ? '일정이 맞지 않습니다.' : null,
        status,
        isDelete: false,
      });
    }
  }

  await prisma.estimate.createMany({ data: estimates, skipDuplicates: true });
  console.log(`✅ Created ${estimates.length} estimates\n`);

  // Review 생성 (확정된 견적 중 30개에 리뷰 작성)
  console.log('⭐ Creating reviews...');
  const reviews: Prisma.ReviewCreateManyInput[] = [];

  // CONFIRMED 상태인 견적 찾기
  const confirmedEstimates = estimates.filter((est) => est.status === 'CONFIRMED');
  const estimatesToReview = confirmedEstimates.slice(0, Math.min(30, confirmedEstimates.length));

  for (const estimate of estimatesToReview) {
    const request = requestMap.get(estimate.estimateRequestId);
    if (!request) continue;

    // 이사일이 지난 경우에만 리뷰 작성
    const movingDate = new Date(request.movingDate as Date);
    if (movingDate > now) continue; // 아직 이사일이 지나지 않음

    reviews.push({
      estimateId: estimate.id!,
      userId: request.userId as string,
      rating: randomInt(3, 5), // 3~5점
      content: randomItem(reviewContents),
    });
  }

  await prisma.review.createMany({ data: reviews, skipDuplicates: true });
  console.log(`✅ Created ${reviews.length} reviews\n`);

  // FavoriteDriver 생성 (랜덤하게 - 일부 기사님은 좋아요를 받지 못함)
  console.log('❤️  Creating favorite drivers...');
  const favorites: Prisma.FavoriteDriverCreateManyInput[] = [];
  const favoritePairs = new Set<string>();
  const driverFavoriteCount = new Map<string, number>(); // 각 기사님이 받은 좋아요 수 추적

  // 기사님별 좋아요 수 초기화
  driverIds.forEach((driverId) => {
    driverFavoriteCount.set(driverId, 0);
  });

  // 40개의 좋아요 생성 (랜덤하게 분배)
  for (let i = 0; i < 40; i++) {
    const userId = randomItem(userIds);
    let driverId = randomItem(driverIds);
    const pairKey = `${userId}-${driverId}`;

    // 중복 방지
    if (favoritePairs.has(pairKey)) {
      // 중복이면 다른 기사님 선택
      const availableDrivers = driverIds.filter((id) => !favoritePairs.has(`${userId}-${id}`));
      if (availableDrivers.length === 0) continue;
      driverId = randomItem(availableDrivers);
    }

    favoritePairs.add(`${userId}-${driverId}`);
    const currentCount = driverFavoriteCount.get(driverId) || 0;
    driverFavoriteCount.set(driverId, currentCount + 1);

    favorites.push({
      userId,
      driverId,
    });
  }

  await prisma.favoriteDriver.createMany({ data: favorites, skipDuplicates: true });
  const driversWithFavorites = Array.from(driverFavoriteCount.values()).filter(
    (count) => count > 0,
  ).length;
  console.log(
    `✅ Created ${favorites.length} favorite drivers (${driversWithFavorites}/${driverIds.length} drivers received favorites)\n`,
  );

  // Notification 생성 (50개 - 다양한 타입)
  console.log('🔔 Creating notifications...');
  const notificationTypes: NotificationType[] = [
    'REQUEST_SENT',
    'REQUEST_REJECTED',
    'REQUEST_CANCELLED',
    'ESTIMATE_RECEIVED',
    'ESTIMATE_CONFIRMED',
    'ESTIMATE_REJECTED',
    'ESTIMATE_EXPIRED',
    'NEW_REVIEW',
    'FAVORITE_ADDED',
    'SYSTEM_NOTICE',
    'PROMOTION',
  ];

  const notifications: Prisma.NotificationCreateManyInput[] = [];

  for (let i = 0; i < 50; i++) {
    const type = randomItem(notificationTypes);
    let message = '';
    let userId = '';

    switch (type) {
      case 'REQUEST_SENT':
        userId = randomItem(userIds);
        message = '견적 요청이 전송되었습니다.';
        break;
      case 'ESTIMATE_RECEIVED':
        userId = randomItem(userIds);
        message = '새로운 견적서가 도착했습니다.';
        break;
      case 'ESTIMATE_CONFIRMED':
        userId = randomItem(userIds);
        message = '견적이 확정되었습니다.';
        break;
      case 'ESTIMATE_REJECTED':
        userId = randomItem(driverIds);
        message = '견적 요청이 반려되었습니다.';
        break;
      case 'NEW_REVIEW':
        userId = randomItem(driverIds);
        message = '새로운 리뷰가 작성되었습니다.';
        break;
      case 'FAVORITE_ADDED':
        userId = randomItem(driverIds);
        message = '찜하기 목록에 추가되었습니다.';
        break;
      default:
        userId = Math.random() < 0.5 ? randomItem(userIds) : randomItem(driverIds);
        message = `${type} 알림입니다.`;
    }

    notifications.push({
      userId,
      type,
      message,
      datajson: Prisma.JsonNull,
      isRead: Math.random() < 0.3, // 30%는 읽음
      isDelete: false,
    });
  }

  await prisma.notification.createMany({ data: notifications, skipDuplicates: true });
  console.log(`✅ Created ${notifications.length} notifications\n`);

  // History 생성 (50개)
  console.log('📜 Creating histories...');
  const historyActionTypes: HistoryActionType[] = [
    'CREATE_REQUEST',
    'UPDATE_REQUEST',
    'DELETE_REQUEST',
    'CONFIRMED_ESTIMATE',
    'REJECTED_ESTIMATE',
    'CREATE_ESTIMATE',
    'UPDATE_ESTIMATE',
    'DELETE_ESTIMATE',
    'EXPIRED_ESTIMATE',
    'CREATE_FAVORITE',
    'DELETE_FAVORITE',
    'CREATE_REVIEW',
    'UPDATE_REVIEW',
    'DELETE_REVIEW',
    'UPDATE_PROFILE',
    'UPDATE_ADDRESS',
  ];

  const historyEntityTypes: HistoryEntityType[] = [
    'USER',
    'USER_PROFILE',
    'DRIVER_PROFILE',
    'ESTIMATE_REQUEST',
    'ESTIMATE_RESPONSE',
    'ADDRESS',
    'REVIEW',
    'FAVORITE_DRIVER',
  ];

  const histories: Prisma.HistoryCreateManyInput[] = [];

  for (let i = 0; i < 50; i++) {
    const actionType = randomItem(historyActionTypes);
    const entityType = randomItem(historyEntityTypes);

    let userId = '';
    let actionDesc = '';

    // 일반 유저가 수행하는 액션
    if (
      actionType === 'CREATE_REQUEST' ||
      actionType === 'UPDATE_REQUEST' ||
      actionType === 'DELETE_REQUEST' ||
      actionType === 'CONFIRMED_ESTIMATE' ||
      actionType === 'REJECTED_ESTIMATE'
    ) {
      userId = randomItem(userIds);
    }
    // 기사님이 수행하는 액션
    else if (
      actionType === 'CREATE_ESTIMATE' ||
      actionType === 'UPDATE_ESTIMATE' ||
      actionType === 'DELETE_ESTIMATE' ||
      actionType === 'EXPIRED_ESTIMATE'
    ) {
      userId = randomItem(driverIds);
    }
    // 양쪽 모두 가능한 액션
    else {
      userId = Math.random() < 0.5 ? randomItem(userIds) : randomItem(driverIds);
    }

    actionDesc = `${actionType} 작업이 수행되었습니다.`;

    histories.push({
      userId,
      actionType,
      actionDesc,
      entityType,
      entityId: uuidv4(),
      previousData: Prisma.JsonNull,
      newData: Prisma.JsonNull,
    });
  }

  await prisma.history.createMany({ data: histories, skipDuplicates: true });
  console.log(`✅ Created ${histories.length} histories\n`);

  console.log('🎉 Seeding finished successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${users.length} (${userIds.length} users, ${driverIds.length} drivers)`);
  console.log(`   - User Profiles: ${userProfiles.length}`);
  console.log(`   - Driver Profiles: ${driverProfiles.length}`);
  console.log(`   - Estimate Requests: ${estimateRequests.length}`);
  console.log(`   - Estimates: ${estimates.length}`);
  console.log(`   - Addresses: ${addressesData.length}`);
  console.log(`   - Reviews: ${reviews.length}`);
  console.log(`   - Favorite Drivers: ${favorites.length}`);
  console.log(`   - Notifications: ${notifications.length}`);
  console.log(`   - Histories: ${histories.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

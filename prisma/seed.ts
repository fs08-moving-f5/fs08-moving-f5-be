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
  '황보민',
  '남궁준',
  '독고영',
  '사공혜',
  '제갈우',
  '선우진',
  '어윤수',
  '빈혜림',
  '탁민규',
  '계동욱',
  '옥지훈',
  '공혜진',
  '망태현',
  '청지원',
  '평나영',
  '초성호',
  '필수진',
  '화지은',
  '풍미영',
  '설준호',
  '설동욱',
  '설민수',
  '설영희',
  '설태현',
  '설소영',
  '설대현',
  '설혜진',
  '설민규',
  '설지현',
  '설성민',
  '설나영',
  '설진우',
  '설지원',
  '설승현',
  '설혜림',
  '설상우',
  '설은지',
  '설현수',
  '설동석',
  '설지훈',
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

const driverImageUrls = [
  'https://i.namu.wiki/i/R9CaXvBxFRYSOxfdLYvoMGskeQmKRYSosCjJetLZR7NUQcsqAIy3AHeg4T875zLLARCKvPyVM3SbmqRayxsvrbhL-uw4ZNpC8PFh4lu7NwrOkZcxwcKV1YmyOTZwOJ0WxMF76j0-sFCSuq3QtFxQDg.webp',
  'https://i.namu.wiki/i/67NnDWsYGsinFvAlcL-sWsUMYPLAvGe3Dvp23MH-GbKffBkY_BgbCoYNR94tzJLYteX8qKhrLgt-m2PmCbaLCb6KQlqS94DW-QtQR31C3zcPw0wzFeHlc60-QmG9tKIziCARlivxqz1d4_ox6V9LKQ.webp',
];

const addresses = [
  { sido: '서울특별시', sigungu: '강남구', address: '테헤란로 123', zoneCode: '06141' },
  { sido: '서울특별시', sigungu: '강동구', address: '천호대로 456', zoneCode: '05278' },
  { sido: '서울특별시', sigungu: '송파구', address: '올림픽로 789', zoneCode: '05551' },
  { sido: '서울특별시', sigungu: '강서구', address: '공항대로 321', zoneCode: '07590' },
  { sido: '서울특별시', sigungu: '서초구', address: '서초대로 654', zoneCode: '06570' },
  { sido: '서울특별시', sigungu: '마포구', address: '홍대로 987', zoneCode: '04120' },
  { sido: '서울특별시', sigungu: '용산구', address: '한강대로 147', zoneCode: '04340' },
  { sido: '서울특별시', sigungu: '종로구', address: '세종대로 258', zoneCode: '03150' },
  { sido: '경기도', sigungu: '성남시', address: '분당구 정자동 101', zoneCode: '13561' },
  { sido: '경기도', sigungu: '수원시', address: '영통구 월드컵로 202', zoneCode: '16490' },
  { sido: '경기도', sigungu: '고양시', address: '일산동구 중앙로 369', zoneCode: '10300' },
  { sido: '경기도', sigungu: '용인시', address: '기흥구 신갈로 741', zoneCode: '16890' },
  { sido: '경기도', sigungu: '안양시', address: '만안구 안양로 852', zoneCode: '13900' },
  { sido: '인천광역시', sigungu: '연수구', address: '송도과학로 303', zoneCode: '21984' },
  { sido: '인천광역시', sigungu: '남동구', address: '인주대로 963', zoneCode: '21580' },
  { sido: '부산광역시', sigungu: '해운대구', address: '해운대해변로 404', zoneCode: '48058' },
  { sido: '부산광역시', sigungu: '사상구', address: '낙동대로 741', zoneCode: '46940' },
  { sido: '대구광역시', sigungu: '수성구', address: '범어천로 505', zoneCode: '42211' },
  { sido: '대구광역시', sigungu: '중구', address: '중앙대로 852', zoneCode: '41920' },
  { sido: '대전광역시', sigungu: '유성구', address: '대학로 606', zoneCode: '34111' },
  { sido: '대전광역시', sigungu: '서구', address: '둔산대로 963', zoneCode: '35260' },
  { sido: '광주광역시', sigungu: '북구', address: '첨단과기로 707', zoneCode: '61007' },
  { sido: '광주광역시', sigungu: '서구', address: '상무중앙로 147', zoneCode: '61920' },
  { sido: '울산광역시', sigungu: '남구', address: '삼산로 258', zoneCode: '44790' },
  { sido: '세종특별자치시', sigungu: '조치원읍', address: '세종로 369', zoneCode: '30010' },
  { sido: '강원도', sigungu: '춘천시', address: '중앙로 741', zoneCode: '24210' },
  { sido: '충청북도', sigungu: '청주시', address: '상당로 852', zoneCode: '28110' },
  { sido: '충청남도', sigungu: '천안시', address: '서북구 번영로 963', zoneCode: '31010' },
  { sido: '전라북도', sigungu: '전주시', address: '완산구 태평로 147', zoneCode: '55010' },
  { sido: '전라남도', sigungu: '목포시', address: '해안로 258', zoneCode: '58610' },
  { sido: '경상북도', sigungu: '포항시', address: '남구 대잠동 369', zoneCode: '37600' },
  { sido: '경상남도', sigungu: '창원시', address: '성산구 중앙대로 741', zoneCode: '51410' },
  { sido: '제주특별자치도', sigungu: '제주시', address: '연오로 852', zoneCode: '63110' },
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

  // User 생성 (일반 유저 125명, 기사님 75명, 마스터 유저 1명, new-driver 1명, 테스트 유저 3명 = 총 205명)
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
    phone: '1000000000',
    refreshTokens: null,
    isDelete: false,
  });

  // 일반 유저 125명 생성 (5배)
  for (let i = 0; i < 125; i++) {
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
      phone: `10${String(randomInt(1000, 9999))}${String(randomInt(1000, 9999))}`,
      refreshTokens: null,
      isDelete: false,
    });
  }

  // 기사님 75명 생성 (5배)
  for (let i = 0; i < 75; i++) {
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
      phone: `10${String(randomInt(1000, 9999))}${String(randomInt(1000, 9999))}`,
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
    phone: '1099999999',
    refreshTokens: null,
    isDelete: false,
  });

  // 추가 테스트 유저 3명 (다양한 시나리오 테스트용)
  for (let i = 0; i < 3; i++) {
    const testUserId = uuidv4();
    userIds.push(testUserId);
    users.push({
      id: testUserId,
      providerId: null,
      provider: 'local',
      type: 'USER',
      name: `테스트유저${i + 1}`,
      email: `testuser${i + 1}@example.com`,
      password: masterPassword,
      phone: `10${9000 + i}000000`,
      refreshTokens: null,
      isDelete: false,
    });
  }

  await prisma.user.createMany({ data: users, skipDuplicates: true });
  console.log(
    `✅ Created ${users.length} users (${userIds.length} users, ${driverIds.length} drivers)\n`,
  );

  // UserProfile 생성 (일반 유저 중 100명만 프로필 생성 - 25명은 프로필 없음, 마스터 유저는 프로필 있음)
  console.log('👤 Creating user profiles...');
  const usersWithProfile = [masterUserId, ...userIds.slice(1, 100)]; // 마스터 유저 포함
  const userProfiles: Prisma.UserProfileCreateManyInput[] = usersWithProfile.map((userId) => ({
    userId,
    imageUrl: `https://example.com/profile/${userId}.jpg`,
    regions: randomItems(regions, randomInt(1, 5)),
    services: randomItems(services, randomInt(1, 3)),
  }));

  await prisma.userProfile.createMany({ data: userProfiles, skipDuplicates: true });
  console.log(`✅ Created ${userProfiles.length} user profiles\n`);

  // DriverProfile 생성 (기사님 75명 전부 프로필 생성 + new-driver)
  console.log('🚗 Creating driver profiles...');
  const driverProfiles: Prisma.DriverProfileCreateManyInput[] = driverIds.map(
    (driverId, index) => ({
      driverId,
      imageUrl: randomItem(driverImageUrls),
      career: `${randomInt(1, 30)}년`, // 경력 범위 확장
      shortIntro: randomItem(shortIntros),
      description: randomItem(descriptions),
      regions: randomItems(regions, randomInt(1, 8)), // 지역 범위 확장
      services: randomItems(services, randomInt(1, 3)),
    }),
  );

  // new-driver 프로필 추가 (프로필 정보는 모두 있지만 아직 활동 없음)
  driverProfiles.push({
    driverId: newDriverId,
    imageUrl: randomItem(driverImageUrls),
    career: `${randomInt(5, 25)}년`,
    shortIntro: randomItem(shortIntros),
    description: randomItem(descriptions),
    regions: randomItems(regions, randomInt(2, 5)),
    services: randomItems(services, randomInt(1, 3)),
  });

  await prisma.driverProfile.createMany({ data: driverProfiles, skipDuplicates: true });
  console.log(`✅ Created ${driverProfiles.length} driver profiles\n`);

  // EstimateRequest 생성 (관계성 촘촘히 설계)
  // 규칙: 유저당 진행 중인 요청(PENDING)은 최대 1개만 가능
  console.log('📋 Creating estimate requests...');
  const estimateRequests: Prisma.EstimateRequestCreateManyInput[] = [];
  const estimateRequestIds: string[] = [];
  const userPendingRequestMap = new Map<string, boolean>(); // 유저별 PENDING 요청 존재 여부

  // 과거 날짜부터 미래 날짜까지 다양한 이사일 생성
  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setDate(pastDate.getDate() - 180); // 180일 전까지 확장

  // 마스터 유저를 위한 다양한 상태의 견적 요청 생성 (테스트용)
  // 마스터 유저는 PENDING 1개 + 다른 상태들 여러 개
  const masterRequestStatuses: EstimateStatus[] = [
    'PENDING', // 진행 중인 요청 1개
    'CONFIRMED',
    'CONFIRMED',
    'REJECTED',
    'CANCELLED',
    'CONFIRMED',
    'REJECTED',
    'CONFIRMED',
    'REJECTED',
    'CANCELLED',
    'CONFIRMED',
    'REJECTED',
    'CONFIRMED',
    'REJECTED',
    'CANCELLED',
    'CONFIRMED',
    'REJECTED',
    'CONFIRMED',
    'CANCELLED',
    'CONFIRMED',
  ];

  for (let i = 0; i < masterRequestStatuses.length; i++) {
    const requestId = uuidv4();
    estimateRequestIds.push(requestId);
    const status = masterRequestStatuses[i];

    // PENDING인 경우 체크
    if (status === 'PENDING') {
      userPendingRequestMap.set(masterUserId, true);
    }

    const daysOffset = randomInt(-90, 90);
    const movingDate = new Date(now);
    movingDate.setDate(movingDate.getDate() + daysOffset);

    estimateRequests.push({
      id: requestId,
      userId: masterUserId,
      movingType: randomItem(services),
      movingDate,
      status,
      isDesignated: i % 5 === 1, // 일부는 지정 요청
      isDelete: false,
    });
  }

  // 나머지 유저들에 대한 견적 요청 생성
  // 각 유저당: PENDING 0~1개, CONFIRMED/REJECTED/CANCELLED 여러 개 가능
  const availableUsers = [...userIds]; // 마스터 유저 제외한 유저들
  const userRequestCount = new Map<string, number>(); // 유저별 요청 수 추적

  // 각 유저당 0~3개의 과거 요청 생성 (PENDING 제외)
  for (const userId of availableUsers) {
    const requestCount = randomInt(0, 3); // 유저당 0~3개의 과거 요청
    userRequestCount.set(userId, requestCount);

    for (let i = 0; i < requestCount; i++) {
      const requestId = uuidv4();
      estimateRequestIds.push(requestId);

      // 과거 날짜로 설정
      const daysOffset = randomInt(-90, -1); // 과거만
      const movingDate = new Date(now);
      movingDate.setDate(movingDate.getDate() + daysOffset);

      // 상태 분포: CONFIRMED 50%, REJECTED 30%, CANCELLED 20% (PENDING 제외)
      const statusRand = Math.random();
      let status: EstimateStatus;
      if (statusRand < 0.5) status = 'CONFIRMED';
      else if (statusRand < 0.8) status = 'REJECTED';
      else status = 'CANCELLED';

      const isDesignated = Math.random() < 0.2;

      estimateRequests.push({
        id: requestId,
        userId,
        movingType: randomItem(services),
        movingDate,
        status,
        isDesignated,
        isDelete: false,
      });
    }
  }

  // 일부 유저들에게 PENDING 요청 1개씩 추가 (진행 중인 요청)
  const usersWithPendingRequest = randomItems(
    availableUsers,
    Math.min(Math.floor(availableUsers.length * 0.3), availableUsers.length), // 30%의 유저만 PENDING 요청
  );

  for (const userId of usersWithPendingRequest) {
    if (userPendingRequestMap.has(userId)) continue; // 이미 PENDING 요청이 있으면 스킵

    const requestId = uuidv4();
    estimateRequestIds.push(requestId);
    userPendingRequestMap.set(userId, true);

    // 미래 날짜로 설정 (진행 중인 요청)
    const daysOffset = randomInt(1, 90);
    const movingDate = new Date(now);
    movingDate.setDate(movingDate.getDate() + daysOffset);

    estimateRequests.push({
      id: requestId,
      userId,
      movingType: randomItem(services),
      movingDate,
      status: 'PENDING',
      isDesignated: Math.random() < 0.2,
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

  // Estimate 생성 (관계성 촘촘히 설계)
  // 규칙: 한 견적 요청에 최대 8개의 견적
  console.log('💰 Creating estimates...');
  const estimates: Prisma.EstimateCreateManyInput[] = [];
  const estimateIds: string[] = [];
  const requestEstimateCount = new Map<string, number>(); // 요청별 견적 수 추적
  const requestConfirmedEstimate = new Map<string, boolean>(); // 요청별 CONFIRMED 견적 존재 여부

  // 각 요청에 대해 견적 생성
  const requestMap = new Map(
    estimateRequests.map((req) => [req.id, req] as [string, Prisma.EstimateRequestCreateManyInput]),
  );

  for (const requestId of estimateRequestIds) {
    const request = requestMap.get(requestId);
    if (!request) continue;

    // 지정 요청인 경우 최대 3개, 일반 요청인 경우 최대 8개
    const maxEstimates = request.isDesignated ? 3 : 8;
    const estimateCount = randomInt(1, maxEstimates);
    requestEstimateCount.set(requestId, estimateCount);

    // 해당 요청의 서비스 가능한 기사님 선택 (같은 요청 내에서 중복 방지)
    // 같은 기사는 한 요청에 견적을 1개만 낼 수 있음
    const selectedDrivers = randomItems(driverIds, Math.min(estimateCount, driverIds.length));

    for (let i = 0; i < estimateCount; i++) {
      const estimateId = uuidv4();
      estimateIds.push(estimateId);

      const driverId = selectedDrivers[i];
      if (!driverId) break;

      // 견적 상태: 요청 상태에 따라 명확한 관계성 설정
      let status: EstimateStatus;

      if (request.status === 'CONFIRMED') {
        // CONFIRMED 요청: 정확히 1개의 CONFIRMED 견적 + 나머지는 모두 REJECTED
        if (i === 0 && !requestConfirmedEstimate.has(requestId)) {
          status = 'CONFIRMED';
          requestConfirmedEstimate.set(requestId, true);
        } else {
          status = 'REJECTED';
        }
      } else if (request.status === 'REJECTED') {
        // REJECTED 요청: 대부분 REJECTED, 일부는 PENDING (아직 처리 안 된 경우)
        const rand = Math.random();
        if (rand < 0.7) status = 'REJECTED';
        else status = 'PENDING';
      } else if (request.status === 'CANCELLED') {
        // CANCELLED 요청: 대부분 CANCELLED, 일부는 PENDING (취소 전에 받은 견적)
        const rand = Math.random();
        if (rand < 0.6) status = 'CANCELLED';
        else status = 'PENDING';
      } else {
        // PENDING 요청: 대부분 PENDING, 일부는 REJECTED (기사가 거절한 경우)
        const rand = Math.random();
        if (rand < 0.9) status = 'PENDING';
        else status = 'REJECTED';
      }

      // 가격 범위 (더 다양한 가격대)
      const priceRange = randomInt(300000, 5000000);

      estimates.push({
        id: estimateId,
        estimateRequestId: requestId,
        driverId,
        price: status !== 'REJECTED' && status !== 'CANCELLED' ? priceRange : null,
        comment:
          status !== 'REJECTED' && status !== 'CANCELLED'
            ? `안전하고 신속하게 진행하겠습니다. ${randomInt(1, 100)}번째 이사입니다.`
            : null,
        rejectReason:
          status === 'REJECTED'
            ? randomItem([
                '일정이 맞지 않습니다.',
                '지역이 맞지 않습니다.',
                '서비스 타입이 맞지 않습니다.',
                '개인 사정으로 인해 불가능합니다.',
              ])
            : null,
        status,
        isDelete: false,
      });
    }
  }

  await prisma.estimate.createMany({ data: estimates, skipDuplicates: true });
  console.log(`✅ Created ${estimates.length} estimates\n`);

  // Review 생성 (확정된 견적에 충분한 리뷰 작성 - 다양한 점수 분포)
  console.log('⭐ Creating reviews...');
  const reviews: Prisma.ReviewCreateManyInput[] = [];

  // CONFIRMED 상태인 견적 찾기
  const confirmedEstimates = estimates.filter((est) => est.status === 'CONFIRMED');
  console.log(`   Found ${confirmedEstimates.length} CONFIRMED estimates`);

  for (const estimate of confirmedEstimates) {
    const request = requestMap.get(estimate.estimateRequestId);
    if (!request) continue;

    const movingDate = new Date(request.movingDate as Date);
    const daysSinceMoving = (now.getTime() - movingDate.getTime()) / (1000 * 60 * 60 * 24);

    // 리뷰 작성 조건 완화:
    // 1. 이사일이 지난 경우 (과거 180일 이내) - 90% 확률로 리뷰 작성
    // 2. 이사일이 미래인 경우 - 30% 확률로 리뷰 작성 (사전 리뷰)
    // 3. 너무 오래된 경우 (180일 이상) - 20% 확률로 리뷰 작성
    let shouldCreateReview = false;
    if (movingDate <= now && daysSinceMoving <= 180) {
      // 과거 180일 이내: 90% 확률
      shouldCreateReview = Math.random() < 0.9;
    } else if (movingDate > now) {
      // 미래: 30% 확률 (사전 리뷰)
      shouldCreateReview = Math.random() < 0.3;
    } else {
      // 180일 이상 지난 경우: 20% 확률
      shouldCreateReview = Math.random() < 0.2;
    }

    if (!shouldCreateReview) continue;

    // 점수 분포: 5점 50%, 4점 30%, 3점 15%, 2점 4%, 1점 1% (더 현실적인 분포)
    const ratingRand = Math.random();
    let rating: number;
    if (ratingRand < 0.5) rating = 5;
    else if (ratingRand < 0.8) rating = 4;
    else if (ratingRand < 0.95) rating = 3;
    else if (ratingRand < 0.99) rating = 2;
    else rating = 1;

    // 낮은 점수일 경우 더 구체적인 리뷰 내용
    const content =
      rating <= 2
        ? randomItem([
            '시간 약속을 지키지 않았습니다.',
            '가구 보호가 제대로 되지 않았습니다.',
            '서비스가 기대에 못 미쳤습니다.',
            '가격 대비 서비스가 아쉬웠습니다.',
          ])
        : randomItem(reviewContents);

    reviews.push({
      estimateId: estimate.id!,
      userId: request.userId as string,
      rating,
      content,
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

  // 200개의 좋아요 생성 (랜덤하게 분배, 일부 기사님은 많이 받고 일부는 적게)
  for (let i = 0; i < 200; i++) {
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

  // Notification 생성 (250개 - 다양한 타입, 더 현실적인 분포)
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

  // 알림 타입별 가중치 (더 현실적인 분포)
  const getWeightedNotificationType = (): NotificationType => {
    const rand = Math.random();
    if (rand < 0.25)
      return 'ESTIMATE_RECEIVED'; // 25%
    else if (rand < 0.4)
      return 'ESTIMATE_CONFIRMED'; // 15%
    else if (rand < 0.5)
      return 'NEW_REVIEW'; // 10%
    else if (rand < 0.6)
      return 'FAVORITE_ADDED'; // 10%
    else if (rand < 0.7)
      return 'ESTIMATE_REJECTED'; // 10%
    else if (rand < 0.8)
      return 'REQUEST_SENT'; // 10%
    else if (rand < 0.85)
      return 'ESTIMATE_EXPIRED'; // 5%
    else if (rand < 0.9)
      return 'REQUEST_REJECTED'; // 5%
    else if (rand < 0.95)
      return 'REQUEST_CANCELLED'; // 5%
    else if (rand < 0.98)
      return 'SYSTEM_NOTICE'; // 3%
    else return 'PROMOTION'; // 2%
  };

  for (let i = 0; i < 250; i++) {
    const type = getWeightedNotificationType();
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
      case 'ESTIMATE_EXPIRED':
        userId = randomItem(userIds);
        message = '견적이 만료되었습니다.';
        break;
      case 'NEW_REVIEW':
        userId = randomItem(driverIds);
        message = '새로운 리뷰가 작성되었습니다.';
        break;
      case 'FAVORITE_ADDED':
        userId = randomItem(driverIds);
        message = '찜하기 목록에 추가되었습니다.';
        break;
      case 'SYSTEM_NOTICE':
        userId = Math.random() < 0.5 ? randomItem(userIds) : randomItem(driverIds);
        message = '시스템 공지사항이 있습니다.';
        break;
      case 'PROMOTION':
        userId = Math.random() < 0.5 ? randomItem(userIds) : randomItem(driverIds);
        message = '새로운 프로모션이 진행 중입니다.';
        break;
      default:
        userId = Math.random() < 0.5 ? randomItem(userIds) : randomItem(driverIds);
        message = `${type} 알림입니다.`;
    }

    // 읽음 상태: 최근 알림일수록 읽을 확률 높음 (시간 기반 가중치)
    const isRead = Math.random() < 0.4; // 40%는 읽음

    notifications.push({
      userId,
      type,
      message,
      datajson: Prisma.JsonNull,
      isRead,
      isDelete: false,
    });
  }

  await prisma.notification.createMany({ data: notifications, skipDuplicates: true });
  console.log(`✅ Created ${notifications.length} notifications\n`);

  // History 생성 (250개 - 더 다양한 액션 타입 분포)
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

  // 액션 타입별 가중치 (더 현실적인 분포)
  const getWeightedActionType = (): HistoryActionType => {
    const rand = Math.random();
    if (rand < 0.25)
      return 'CREATE_REQUEST'; // 25%
    else if (rand < 0.4)
      return 'CREATE_ESTIMATE'; // 15%
    else if (rand < 0.5)
      return 'CONFIRMED_ESTIMATE'; // 10%
    else if (rand < 0.58)
      return 'CREATE_REVIEW'; // 8%
    else if (rand < 0.65)
      return 'CREATE_FAVORITE'; // 7%
    else if (rand < 0.72)
      return 'UPDATE_PROFILE'; // 7%
    else if (rand < 0.78)
      return 'REJECTED_ESTIMATE'; // 6%
    else if (rand < 0.83)
      return 'UPDATE_REQUEST'; // 5%
    else if (rand < 0.87)
      return 'UPDATE_ESTIMATE'; // 4%
    else if (rand < 0.9)
      return 'UPDATE_REVIEW'; // 3%
    else if (rand < 0.93)
      return 'DELETE_FAVORITE'; // 3%
    else if (rand < 0.96)
      return 'EXPIRED_ESTIMATE'; // 3%
    else if (rand < 0.98)
      return 'DELETE_REQUEST'; // 2%
    else if (rand < 0.99)
      return 'DELETE_ESTIMATE'; // 1%
    else return 'DELETE_REVIEW'; // 1%
  };

  for (let i = 0; i < 250; i++) {
    const actionType = getWeightedActionType();
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
  console.log('\n🔗 Relationship Rules Applied:');
  console.log('   ✓ Each user can have max 1 PENDING request');
  console.log('   ✓ Each request can have max 8 estimates');
  console.log('   ✓ CONFIRMED requests: exactly 1 CONFIRMED estimate + others REJECTED');
  console.log('   ✓ PENDING requests: mostly PENDING estimates (some REJECTED)');
  console.log('   ✓ REJECTED requests: mostly REJECTED estimates (some PENDING)');
  console.log('   ✓ CANCELLED requests: mostly CANCELLED estimates (some PENDING)');
  console.log('\n✨ Enhanced test scenarios:');
  console.log('   - Extended date range: -90 to +90 days');
  console.log('   - More diverse estimate statuses and prices');
  console.log('   - Realistic review rating distribution');
  console.log('   - Weighted notification and history types');
  console.log('   - Expanded address pool (34 locations)');
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

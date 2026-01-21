import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import prisma from './prisma';
import { Prisma } from '../generated/client';
import type { RegionEnum, ServiceEnum, EstimateStatus, NotificationType } from '../generated/enums';
import { logger } from './logger';

// 유틸리티 함수들
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = <T>(array: T[]): T => array[randomInt(0, array.length - 1)];
const randomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// 배치 처리 함수 (메모리 절약을 위해 1000개씩 나누어 처리)
const batchCreateMany = async <T>(
  createManyFn: (args: { data: T[]; skipDuplicates: boolean }) => Promise<{ count: number }>,
  data: T[],
  batchSize: number = 1000,
  entityName: string = 'items',
): Promise<number> => {
  let totalCreated = 0;
  const totalBatches = Math.ceil(data.length / batchSize);
  logger.info(
    `Starting batch creation for ${data.length} ${entityName} (${totalBatches} batches of ${batchSize})`,
  );

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const startTime = Date.now();

    const result = await createManyFn({ data: batch, skipDuplicates: true });
    totalCreated += result.count;

    const elapsed = Date.now() - startTime;
    const processed = Math.min(i + batchSize, data.length);
    const progress = ((processed / data.length) * 100).toFixed(1);

    logger.info(
      `[${entityName}] Batch ${batchNumber}/${totalBatches}: Created ${result.count} items | ` +
        `Progress: ${processed}/${data.length} (${progress}%) | ` +
        `Elapsed: ${elapsed}ms | Total created: ${totalCreated}`,
    );
  }

  logger.info(`Completed batch creation for ${entityName}: ${totalCreated} total items created`);
  return totalCreated;
};

// 2025년 날짜 생성 함수 (2025-01-01 ~ 2025-12-31)
const getRandomDate2025 = (): Date => {
  const startDate = new Date('2025-01-01T00:00:00.000Z');
  const endDate = new Date('2025-12-31T23:59:59.999Z');
  const timeDiff = endDate.getTime() - startDate.getTime();
  const randomTime = Math.random() * timeDiff;
  return new Date(startDate.getTime() + randomTime);
};

// 특정 날짜 이후의 2025년 날짜 생성
const getRandomDate2025After = (afterDate: Date): Date => {
  const startDate =
    afterDate > new Date('2025-01-01') ? afterDate : new Date('2025-01-01T00:00:00.000Z');
  const endDate = new Date('2025-12-31T23:59:59.999Z');
  if (startDate >= endDate) return endDate;
  const timeDiff = endDate.getTime() - startDate.getTime();
  const randomTime = Math.random() * timeDiff;
  return new Date(startDate.getTime() + randomTime);
};

// 특정 날짜 이전의 2025년 날짜 생성
const getRandomDate2025Before = (beforeDate: Date): Date => {
  const startDate = new Date('2025-01-01T00:00:00.000Z');
  const endDate =
    beforeDate < new Date('2025-12-31') ? beforeDate : new Date('2025-12-31T23:59:59.999Z');
  if (startDate >= endDate) return startDate;
  const timeDiff = endDate.getTime() - startDate.getTime();
  const randomTime = Math.random() * timeDiff;
  return new Date(startDate.getTime() + randomTime);
};

// 한국 좌표 범위 (대략적인 범위)
const getKoreanCoordinates = (sido: string, sigungu: string): { lat: number; lng: number } => {
  // 시도별 대략적인 좌표 범위
  const sidoRanges: Record<string, { lat: [number, number]; lng: [number, number] }> = {
    서울특별시: { lat: [37.4, 37.7], lng: [126.8, 127.2] },
    경기도: { lat: [37.0, 38.0], lng: [126.5, 127.8] },
    인천광역시: { lat: [37.4, 37.6], lng: [126.5, 126.8] },
    강원도: { lat: [37.0, 38.5], lng: [127.0, 129.5] },
    충청북도: { lat: [36.0, 37.5], lng: [127.0, 128.5] },
    충청남도: { lat: [36.0, 37.0], lng: [126.0, 127.5] },
    대전광역시: { lat: [36.2, 36.4], lng: [127.3, 127.5] },
    세종특별자치시: { lat: [36.4, 36.6], lng: [127.2, 127.4] },
    전라북도: { lat: [35.0, 36.5], lng: [126.5, 127.8] },
    전라남도: { lat: [34.0, 35.5], lng: [126.0, 127.5] },
    광주광역시: { lat: [35.1, 35.2], lng: [126.7, 126.9] },
    경상북도: { lat: [35.5, 37.0], lng: [128.0, 130.0] },
    경상남도: { lat: [34.5, 35.8], lng: [127.5, 129.5] },
    대구광역시: { lat: [35.7, 35.9], lng: [128.4, 128.7] },
    부산광역시: { lat: [35.0, 35.3], lng: [129.0, 129.3] },
    울산광역시: { lat: [35.4, 35.6], lng: [129.2, 129.4] },
    제주특별자치도: { lat: [33.1, 33.6], lng: [126.2, 126.9] },
  };

  const range = sidoRanges[sido] || { lat: [37.0, 38.0], lng: [126.0, 129.0] };
  return {
    lat: randomInt(range.lat[0] * 10000, range.lat[1] * 10000) / 10000,
    lng: randomInt(range.lng[0] * 10000, range.lng[1] * 10000) / 10000,
  };
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

// 한국 이름 확장 (30배 규모에 맞게)
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
  '김철수',
  '이순신',
  '박보검',
  '최우식',
  '정해인',
  '강동원',
  '윤아',
  '장기하',
  '임시완',
  '한지민',
  '오정세',
  '신민아',
  '조정석',
  '배두나',
  '홍길동',
  '권상우',
  '송혜교',
  '유아인',
  '노홍철',
  '전지현',
  '문소리',
  '고수',
  '류준열',
  '마동석',
  '서강준',
  '황정민',
  '남주혁',
  '독고영재',
  '사공일',
  '제갈공명',
  '선우용녀',
  '어벤져스',
  '빈센조',
  '탁재훈',
  '계백',
  '옥동자',
  '공유',
  '망고',
  '청하',
  '평창',
  '초아',
  '필리핀',
  '화요비',
  '풍산개',
  '설리',
  '김태희',
  '이병헌',
  '박해일',
  '최민식',
  '정우성',
  '강하늘',
  '윤여정',
  '장혁',
  '임창정',
  '한석규',
  '오달수',
  '신하균',
  '조인성',
  '배용준',
  '홍석천',
  '권오중',
  '송강호',
  '유해진',
  '노무현',
  '오인하',
  '문재인',
  '고종',
  '류시원',
  '마이클',
  '서태지',
  '황우슬혜',
  '남상미',
  '독고탁',
  '사공명',
  '제갈량',
  '선우일란',
  '어린왕자',
  '빈센트',
  '탁구',
  '계란',
  '옥수수',
  '공주',
  '망원동',
  '청년',
  '평화',
  '초록',
  '필터',
  '화장품',
  '풍년',
  '설탕',
  '김치',
  '이불',
  '박스',
  '최고',
  '정원',
  '강아지',
  '윤기',
  '장미',
  '임금',
  '한글',
  '오리',
  '신발',
  '조개',
  '배추',
  '홍차',
  '권투',
  '송아지',
  '유리',
  '노트',
  '전화',
  '문서',
  '고양이',
  '류진',
  '마음',
  '서울',
  '황금',
  '남자',
  '독서',
  '사랑',
  '제주',
  '선물',
  '어머니',
  '빛',
  '탁자',
  '계단',
  '옥상',
  '공원',
  '망고',
  '청소',
  '평면',
  '초대',
  '필기',
  '화면',
  '풍경',
  '설계',
  '김다은',
  '이서연',
  '박민준',
  '최하늘',
  '정지우',
  '강서현',
  '윤도현',
  '장예준',
  '임채원',
  '한지안',
  '오나은',
  '신시우',
  '조하준',
  '배서윤',
  '홍윤서',
  '권지호',
  '송예린',
  '유준서',
  '노지훈',
  '전소율',
  '문지원',
  '고민재',
  '류서아',
  '마하람',
  '서지안',
  '황준혁',
  '남예은',
  '독고민성',
  '사공하영',
  '제갈서진',
  '선우지율',
  '어서하',
  '빈민지',
  '탁서우',
  '계하린',
  '옥지율',
  '공서하',
  '망지안',
  '청하람',
  '평서진',
  '초지우',
  '필하영',
  '화서아',
  '풍지율',
  '설민지',
  '김서하',
  '이하람',
  '박지안',
  '최서진',
  '정하영',
  '강지율',
  '윤서아',
  '장하람',
  '임지안',
  '한서진',
  '오하영',
  '신지율',
  '조서아',
  '배하람',
  '홍지안',
  '권서진',
  '송하영',
  '유지율',
  '노서아',
  '전하람',
  '문지안',
  '고서진',
  '류하영',
  '마지율',
  '서서아',
  '황하람',
  '남지안',
  '독고서진',
  '사공하영',
  '제갈지율',
  '선우서아',
  '어하람',
  '빈지안',
  '탁서진',
  '계하영',
  '옥지율',
  '공서아',
  '망하람',
  '청지안',
  '평서진',
  '초하영',
  '필지율',
  '화서아',
  '풍하람',
  '설지안',
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
  '이사마스터',
  '스피드이사',
  '프리미엄이사',
  '골드이사',
  '실버이사',
  '브론즈이사',
  '다이아이사',
  '플래티넘이사',
  'VIP이사',
  '럭셔리이사',
  '프리미엄이사',
  '특급이사',
  '1등이사',
  '톱이사',
  '슈퍼이사',
  '울트라이사',
  '메가이사',
  '기가이사',
  '테라이사',
  '페타이사',
  '엑사이사',
  '이사킹',
  '이사퀸',
  '이사로드',
  '이사레전드',
  '이사히어로',
  '이사챔피언',
  '이사마법사',
  '이사닌자',
  '이사사무라이',
  '이사기사',
  '이사전사',
  '이사용사',
  '이사마법사',
  '이사도적',
  '이사궁수',
  '이사성기사',
  '이사드루이드',
  '이사사제',
  '이사흑마',
  '이사법사',
  '이사수도사',
  '이사수호자',
  '이사파이터',
  '이사레인저',
  '이사로그',
  '이사바드',
  '이사팔라딘',
  '이사소서러',
  '이사워록',
  '이사위저드',
  '이사클레릭',
  '이사몽크',
  '이사바바리안',
  '이사루지',
  '이사레인저',
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
  '오랜 경력으로 안전한 이사를 보장합니다.',
  '고객 중심의 서비스를 제공합니다.',
  '합리적인 가격으로 최고의 서비스를 제공합니다.',
  '전문 장비와 경험으로 완벽한 이사를 약속합니다.',
  '신속 정확한 이사 서비스를 제공합니다.',
  '고객의 소중한 물건을 안전하게 옮겨드립니다.',
  '친절한 상담과 신속한 서비스로 만족을 드립니다.',
  '다년간의 경험으로 최상의 서비스를 제공합니다.',
  '고객의 신뢰를 최우선으로 생각합니다.',
  '전문가답게 책임지고 진행합니다.',
  '깔끔하고 정확한 이사 서비스를 제공합니다.',
  '고객 만족도 100%를 목표로 합니다.',
  '24시간 상담 가능하며 언제든지 문의해주세요.',
  '대형 트럭과 전문 인력으로 빠른 이사를 보장합니다.',
  '가구 포장부터 배치까지 원스톱 서비스를 제공합니다.',
  '보험 가입으로 안전한 이사를 책임집니다.',
  '주말 및 공휴일에도 서비스 가능합니다.',
  '계단 이사 전문으로 어려운 조건도 해결합니다.',
  '피아노, 금고 등 특수 물품 이사도 가능합니다.',
  '이사 후 청소 서비스도 함께 제공합니다.',
  '전국 어디든 이동 가능한 네트워크를 보유하고 있습니다.',
  '실시간 위치 추적으로 이사 진행 상황을 확인할 수 있습니다.',
  '고객 맞춤형 서비스로 개인별 요구사항을 반영합니다.',
  '환경 친화적인 포장재를 사용하여 안전과 환경을 동시에 고려합니다.',
  '이사 전 무료 견적 상담을 제공합니다.',
  '후불 결제로 안심하고 이용하실 수 있습니다.',
];

const descriptions = [
  '오랜 경력과 노하우로 안전하고 신속한 이사를 진행합니다. 가구 보호와 시간 준수를 최우선으로 생각하며, 고객 만족을 위해 최선을 다하겠습니다.',
  '친절하고 정직한 서비스로 고객님의 소중한 물건을 안전하게 옮겨드립니다. 다양한 이사 경험을 바탕으로 최상의 서비스를 제공합니다.',
  '전문 장비와 경험 많은 팀으로 구성되어 있어 어떤 규모의 이사든 안심하고 맡기실 수 있습니다. 가격도 합리적으로 책정해드립니다.',
  '고객 중심의 서비스를 제공하며, 이사 전 상담부터 이사 후 정리까지 꼼꼼하게 챙겨드립니다. 믿고 맡기실 수 있는 이사 전문가입니다.',
  '20년 이상의 경력으로 수많은 고객님들의 신뢰를 받아왔습니다. 안전하고 신속한 이사 서비스로 고객 만족을 실현합니다.',
  '전문 장비와 숙련된 인력으로 구성된 팀으로, 가구 보호와 시간 준수를 최우선으로 생각합니다.',
  '합리적인 가격과 최고의 서비스 품질을 제공하여 고객님들의 만족을 추구합니다.',
  '이사 전 상담부터 이사 후 정리까지 전 과정을 책임지고 진행하여 고객님의 부담을 최소화합니다.',
  '다양한 규모의 이사 경험을 바탕으로 고객님의 상황에 맞는 최적의 서비스를 제공합니다.',
  '고객의 소중한 추억이 담긴 물건들을 안전하게 옮겨드리기 위해 최선을 다하겠습니다.',
  '20년 이상의 경력과 1000건 이상의 이사 경험을 바탕으로 고객님의 이사를 책임지겠습니다. 전문 장비와 숙련된 인력으로 안전하고 신속한 서비스를 제공합니다.',
  '소형 이사부터 대형 사무실 이사까지 다양한 규모의 이사를 경험했습니다. 고객님의 상황에 맞는 최적의 서비스와 합리적인 가격을 제안드립니다.',
  '이사 전 상담부터 이사 후 정리까지 전 과정을 책임지고 진행합니다. 고객님의 부담을 최소화하고 만족도를 최대화하기 위해 노력하겠습니다.',
  '전국 네트워크를 활용하여 어디서든 안전하고 빠른 이사 서비스를 제공합니다. 대형 트럭과 전문 인력으로 대규모 이사도 가능합니다.',
  '피아노, 금고, 대형 가구 등 특수 물품 이사 전문입니다. 전문 장비와 경험을 바탕으로 안전하게 옮겨드립니다.',
  '환경 친화적인 포장재를 사용하고, 이사 후 재활용 가능한 포장재는 수거해드립니다. 환경을 생각하는 이사 서비스를 제공합니다.',
  '24시간 상담 가능하며, 긴급한 이사도 빠르게 대응합니다. 고객님의 일정에 맞춰 유연하게 서비스를 제공합니다.',
  '보험 가입으로 이사 중 발생할 수 있는 사고에 대비합니다. 고객님의 소중한 물건을 안전하게 보호합니다.',
  '후불 결제 시스템으로 이사 완료 후 만족하시면 결제하실 수 있습니다. 고객님의 신뢰를 최우선으로 생각합니다.',
];

// 유저 프로필 사진 URL (두 개 중 랜덤)
const userImageUrls = [
  'https://i.pinimg.com/736x/7b/04/b1/7b04b1f4d147f8951aa39ff976d9c209.jpg',
  'https://i.pinimg.com/1200x/1e/11/c8/1e11c88b04d5fc8dfb3a0b848f13e84c.jpg',
];

const driverImageUrls = [
  'https://i.namu.wiki/i/6HSFEPQa76yjt-2R2WSPlFVX6VfUV-oqW1pHlQSJuHht2He7GciDzk-bGDYpPRjubzeudlm7GXw3DMftNwvImY39w3hb9Knj56_l9sj-WLD0dC-MawfFBm_aIb5NPw_96zrpu9OaXgVAy0Y7Fq7mcg.webp',
  'https://i.namu.wiki/i/xruUvD5zr3Ox0nhPlkY-N0fO1Da9xil6v2E-rruLNHQ4UP2c_V50f2t5dlrnQyB7dTu4cn_0gCTxCqnCGm9aLLFWoxI4-xbWQeJPVJouOl6tEOj0k4VFVp05jFEDHOoMztw38R43TOLc8f-kkS_5Dg.webp',
];

// 주소 확장 (더 다양한 주소)
const addresses = [
  { sido: '서울특별시', sigungu: '강남구', address: '테헤란로 123', zoneCode: '06141' },
  { sido: '서울특별시', sigungu: '강동구', address: '천호대로 456', zoneCode: '05278' },
  { sido: '서울특별시', sigungu: '송파구', address: '올림픽로 789', zoneCode: '05551' },
  { sido: '서울특별시', sigungu: '강서구', address: '공항대로 321', zoneCode: '07590' },
  { sido: '서울특별시', sigungu: '서초구', address: '서초대로 654', zoneCode: '06570' },
  { sido: '서울특별시', sigungu: '마포구', address: '홍대로 987', zoneCode: '04120' },
  { sido: '서울특별시', sigungu: '용산구', address: '한강대로 147', zoneCode: '04340' },
  { sido: '서울특별시', sigungu: '종로구', address: '세종대로 258', zoneCode: '03150' },
  { sido: '서울특별시', sigungu: '영등포구', address: '여의대로 369', zoneCode: '07230' },
  { sido: '서울특별시', sigungu: '동작구', address: '사당로 741', zoneCode: '06980' },
  { sido: '서울특별시', sigungu: '관악구', address: '신림로 852', zoneCode: '08790' },
  { sido: '서울특별시', sigungu: '서대문구', address: '연세로 963', zoneCode: '03690' },
  { sido: '서울특별시', sigungu: '은평구', address: '은평로 147', zoneCode: '03380' },
  { sido: '서울특별시', sigungu: '노원구', address: '노원로 258', zoneCode: '01790' },
  { sido: '서울특별시', sigungu: '도봉구', address: '도봉로 369', zoneCode: '01450' },
  { sido: '서울특별시', sigungu: '강북구', address: '삼양로 741', zoneCode: '01090' },
  { sido: '서울특별시', sigungu: '성북구', address: '성북로 852', zoneCode: '02850' },
  { sido: '서울특별시', sigungu: '중랑구', address: '망우로 963', zoneCode: '02150' },
  { sido: '서울특별시', sigungu: '광진구', address: '능동로 147', zoneCode: '04950' },
  { sido: '서울특별시', sigungu: '성동구', address: '왕십리로 258', zoneCode: '04790' },
  { sido: '서울특별시', sigungu: '중구', address: '을지로 369', zoneCode: '04530' },
  { sido: '서울특별시', sigungu: '동대문구', address: '왕산로 741', zoneCode: '02590' },
  { sido: '서울특별시', sigungu: '금천구', address: '시흥대로 852', zoneCode: '08590' },
  { sido: '서울특별시', sigungu: '구로구', address: '구로로 963', zoneCode: '08290' },
  { sido: '경기도', sigungu: '성남시', address: '분당구 정자동 101', zoneCode: '13561' },
  { sido: '경기도', sigungu: '수원시', address: '영통구 월드컵로 202', zoneCode: '16490' },
  { sido: '경기도', sigungu: '고양시', address: '일산동구 중앙로 369', zoneCode: '10300' },
  { sido: '경기도', sigungu: '용인시', address: '기흥구 신갈로 741', zoneCode: '16890' },
  { sido: '경기도', sigungu: '안양시', address: '만안구 안양로 852', zoneCode: '13900' },
  { sido: '경기도', sigungu: '부천시', address: '원미구 중앙로 963', zoneCode: '14490' },
  { sido: '경기도', sigungu: '안산시', address: '상록구 중앙로 147', zoneCode: '15490' },
  { sido: '경기도', sigungu: '평택시', address: '서정동 중앙로 258', zoneCode: '17890' },
  { sido: '경기도', sigungu: '의정부시', address: '의정부로 369', zoneCode: '11890' },
  { sido: '경기도', sigungu: '시흥시', address: '정왕동 중앙로 741', zoneCode: '14990' },
  { sido: '경기도', sigungu: '김포시', address: '김포대로 852', zoneCode: '10090' },
  { sido: '경기도', sigungu: '광명시', address: '광명로 963', zoneCode: '14290' },
  { sido: '경기도', sigungu: '광주시', address: '경안로 147', zoneCode: '12790' },
  { sido: '경기도', sigungu: '하남시', address: '하남대로 258', zoneCode: '13090' },
  { sido: '인천광역시', sigungu: '연수구', address: '송도과학로 303', zoneCode: '21984' },
  { sido: '인천광역시', sigungu: '남동구', address: '인주대로 963', zoneCode: '21580' },
  { sido: '인천광역시', sigungu: '부평구', address: '부평대로 741', zoneCode: '21390' },
  { sido: '인천광역시', sigungu: '계양구', address: '계양대로 852', zoneCode: '21090' },
  { sido: '인천광역시', sigungu: '서구', address: '서곶로 963', zoneCode: '22790' },
  { sido: '부산광역시', sigungu: '해운대구', address: '해운대해변로 404', zoneCode: '48058' },
  { sido: '부산광역시', sigungu: '사상구', address: '낙동대로 741', zoneCode: '46940' },
  { sido: '부산광역시', sigungu: '부산진구', address: '중앙대로 852', zoneCode: '47290' },
  { sido: '부산광역시', sigungu: '동래구', address: '중앙대로 963', zoneCode: '47790' },
  { sido: '대구광역시', sigungu: '수성구', address: '범어천로 505', zoneCode: '42211' },
  { sido: '대구광역시', sigungu: '중구', address: '중앙대로 852', zoneCode: '41920' },
  { sido: '대구광역시', sigungu: '동구', address: '동부로 741', zoneCode: '41090' },
  { sido: '대전광역시', sigungu: '유성구', address: '대학로 606', zoneCode: '34111' },
  { sido: '대전광역시', sigungu: '서구', address: '둔산대로 963', zoneCode: '35260' },
  { sido: '광주광역시', sigungu: '북구', address: '첨단과기로 707', zoneCode: '61007' },
  { sido: '광주광역시', sigungu: '서구', address: '상무중앙로 147', zoneCode: '61920' },
  { sido: '울산광역시', sigungu: '남구', address: '삼산로 258', zoneCode: '44790' },
  { sido: '세종특별자치시', sigungu: '조치원읍', address: '세종로 369', zoneCode: '30010' },
  { sido: '강원도', sigungu: '춘천시', address: '중앙로 741', zoneCode: '24210' },
  { sido: '강원도', sigungu: '강릉시', address: '강릉대로 852', zoneCode: '25490' },
  { sido: '충청북도', sigungu: '청주시', address: '상당로 852', zoneCode: '28110' },
  { sido: '충청남도', sigungu: '천안시', address: '서북구 번영로 963', zoneCode: '31010' },
  { sido: '전라북도', sigungu: '전주시', address: '완산구 태평로 147', zoneCode: '55010' },
  { sido: '전라남도', sigungu: '목포시', address: '해안로 258', zoneCode: '58610' },
  { sido: '경상북도', sigungu: '포항시', address: '남구 대잠동 369', zoneCode: '37600' },
  { sido: '경상남도', sigungu: '창원시', address: '성산구 중앙대로 741', zoneCode: '51410' },
  { sido: '제주특별자치도', sigungu: '제주시', address: '연오로 852', zoneCode: '63110' },
  { sido: '서울특별시', sigungu: '강남구', address: '역삼로 111', zoneCode: '06142' },
  { sido: '서울특별시', sigungu: '강남구', address: '선릉로 222', zoneCode: '06143' },
  { sido: '서울특별시', sigungu: '서초구', address: '반포대로 333', zoneCode: '06571' },
  { sido: '서울특별시', sigungu: '송파구', address: '잠실로 444', zoneCode: '05552' },
  { sido: '경기도', sigungu: '성남시', address: '분당구 판교로 555', zoneCode: '13562' },
  { sido: '경기도', sigungu: '수원시', address: '영통구 광교로 666', zoneCode: '16491' },
  { sido: '경기도', sigungu: '용인시', address: '기흥구 용인대로 777', zoneCode: '16891' },
  { sido: '인천광역시', sigungu: '연수구', address: '송도국제대로 888', zoneCode: '21985' },
  { sido: '부산광역시', sigungu: '해운대구', address: '센텀중앙로 999', zoneCode: '48059' },
  { sido: '대구광역시', sigungu: '수성구', address: '범어천로 1111', zoneCode: '42212' },
  { sido: '대전광역시', sigungu: '유성구', address: '대학로 2222', zoneCode: '34112' },
  { sido: '광주광역시', sigungu: '북구', address: '첨단과기로 3333', zoneCode: '61008' },
  { sido: '울산광역시', sigungu: '남구', address: '삼산로 4444', zoneCode: '44791' },
  { sido: '강원도', sigungu: '원주시', address: '원주대로 5555', zoneCode: '26410' },
  { sido: '충청북도', sigungu: '충주시', address: '충주대로 6666', zoneCode: '27410' },
  { sido: '충청남도', sigungu: '아산시', address: '아산대로 7777', zoneCode: '31410' },
  { sido: '전라북도', sigungu: '익산시', address: '익산대로 8888', zoneCode: '54510' },
  { sido: '전라남도', sigungu: '여수시', address: '여수대로 9999', zoneCode: '59710' },
  { sido: '경상북도', sigungu: '구미시', address: '구미대로 1010', zoneCode: '39110' },
  { sido: '경상남도', sigungu: '김해시', address: '김해대로 2020', zoneCode: '50810' },
  { sido: '제주특별자치도', sigungu: '서귀포시', address: '서귀포대로 3030', zoneCode: '63610' },
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
  '가구 손상 없이 안전하게 옮겨주셔서 감사합니다.',
  '친절한 설명과 신속한 서비스로 만족스러웠습니다.',
  '전문 장비로 안전하게 옮겨주셔서 안심이 되었습니다.',
  '가격 협상도 잘 해주시고 서비스도 훌륭했습니다.',
  '이사 후 정리까지 도와주셔서 정말 감사합니다.',
  '시간 약속을 정확히 지켜주셔서 좋았습니다.',
  '가구 배치까지 신경써주셔서 만족스럽습니다.',
  '전문가답게 모든 과정을 책임지고 진행해주셨습니다.',
  '합리적인 가격에 최고의 서비스를 받았습니다.',
  '다음 이사도 꼭 이용하고 싶습니다.',
  '기사님이 정말 친절하셔서 편안하게 이사할 수 있었습니다.',
  '가격 협상이 잘 되어서 만족스러웠습니다.',
  '이사 전후로 꼼꼼하게 확인해주셔서 감사합니다.',
  '전문적인 장비와 인력으로 빠르게 작업해주셨습니다.',
  '가구 배치까지 신경써주셔서 정말 좋았습니다.',
  '시간 약속을 정확히 지켜주셔서 계획대로 진행되었습니다.',
  '이사 후 정리까지 도와주셔서 부담이 적었습니다.',
  '고가의 가구도 안전하게 옮겨주셔서 안심이 되었습니다.',
  '추가 비용 없이 깔끔하게 작업해주셨습니다.',
  '기사님의 친절한 설명 덕분에 이해가 잘 되었습니다.',
  '이사 과정에서 발생한 문제도 빠르게 해결해주셨습니다.',
  '가격 대비 서비스 품질이 매우 우수했습니다.',
  '다음에도 같은 기사님을 이용하고 싶습니다.',
  '이사 준비부터 마무리까지 모든 과정이 완벽했습니다.',
  '기사님의 전문성이 돋보였습니다.',
  '고객 중심의 서비스로 만족스러웠습니다.',
  '이사 후에도 A/S가 잘 되어서 좋았습니다.',
  '가격이 합리적이면서도 서비스는 최고였습니다.',
  '이사 날짜 변경 요청도 잘 받아주셔서 감사합니다.',
];

const estimateComments = {
  PENDING: [
    '안전하고 신속하게 진행하겠습니다.',
    '전문 장비와 경험으로 완벽한 이사를 약속합니다.',
    '고객 만족을 최우선으로 생각하며 진행하겠습니다.',
    '오랜 경력으로 안전한 이사를 보장합니다.',
    '친절하고 정직한 서비스로 보답하겠습니다.',
    '신속 정확한 이사 서비스를 제공하겠습니다.',
    '고객의 소중한 물건을 안전하게 옮겨드리겠습니다.',
    '전문가답게 책임지고 진행하겠습니다.',
    '깔끔하고 정확한 이사 서비스를 제공하겠습니다.',
    '합리적인 가격으로 최고의 서비스를 제공하겠습니다.',
  ],
  CONFIRMED: [
    '안전하고 신속하게 진행하겠습니다.',
    '전문 장비와 경험으로 완벽한 이사를 약속합니다.',
    '고객 만족을 최우선으로 생각하며 진행하겠습니다.',
    '오랜 경력으로 안전한 이사를 보장합니다.',
    '친절하고 정직한 서비스로 보답하겠습니다.',
    '신속 정확한 이사 서비스를 제공하겠습니다.',
    '고객의 소중한 물건을 안전하게 옮겨드리겠습니다.',
    '전문가답게 책임지고 진행하겠습니다.',
    '깔끔하고 정확한 이사 서비스를 제공하겠습니다.',
    '합리적인 가격으로 최고의 서비스를 제공하겠습니다.',
  ],
  REJECTED: [
    '일정이 맞지 않아 진행이 어렵습니다.',
    '지역이 맞지 않아 진행이 어렵습니다.',
    '서비스 타입이 맞지 않아 진행이 어렵습니다.',
    '개인 사정으로 인해 진행이 어렵습니다.',
    '현재 일정이 꽉 차서 진행이 어렵습니다.',
    '해당 지역 서비스가 불가능합니다.',
    '요청하신 날짜에 진행이 어렵습니다.',
    '다른 일정과 겹쳐 진행이 어렵습니다.',
    '서비스 범위를 벗어나 진행이 어렵습니다.',
    '현재 상황상 진행이 어렵습니다.',
  ],
  CANCELLED: [
    '요청이 취소되어 진행이 중단되었습니다.',
    '고객 요청으로 인해 진행이 중단되었습니다.',
    '일정 변경으로 인해 진행이 중단되었습니다.',
    '상황 변경으로 인해 진행이 중단되었습니다.',
    '요청 취소로 인해 진행이 중단되었습니다.',
    '고객 사정으로 인해 진행이 중단되었습니다.',
    '일정 조정으로 인해 진행이 중단되었습니다.',
    '상황 변화로 인해 진행이 중단되었습니다.',
    '요청 변경으로 인해 진행이 중단되었습니다.',
    '고객 요청에 따라 진행이 중단되었습니다.',
  ],
};

async function main() {
  logger.info('🌱 Start seeding...');

  // 데이터베이스 스키마 확인 (마이그레이션 적용 여부 확인)
  logger.info('🔍 Checking database schema...');
  try {
    // User 테이블의 isEmailVerified 컬럼 존재 여부 확인
    await prisma.$queryRaw`
      SELECT "isEmailVerified" FROM "User" LIMIT 1
    `;
    logger.info('✅ Database schema is up to date');
  } catch (error: any) {
    if (
      error.code === 'P2022' ||
      error.message?.includes('column') ||
      error.message?.includes('does not exist')
    ) {
      logger.error('❌ Database schema is not up to date!');
      logger.error('   Please run migrations first:');
      logger.error('   npx prisma migrate deploy');
      logger.error('   or');
      logger.error('   npx prisma migrate dev');
      process.exit(1);
    }
    throw error;
  }

  // 기존 데이터 삭제
  logger.info('🗑️  Deleting existing data...');
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
  logger.info('✅ Existing data deleted');

  // User 생성 (20% 규모로 축소, 배치 처리)
  // 일반 유저: 225,000 * 0.2 = 45,000명
  // 기사님: 135,000 * 0.2 = 27,000명
  // 마스터 유저: 1명
  // new-driver: 1명
  // 테스트 유저: 5,400 * 0.2 = 1,080명
  // 총: 73,082명
  logger.info('👥 Creating users...');
  const userIds: string[] = [];
  const driverIds: string[] = [];
  const masterPassword = await argon2.hash('12345678');
  let totalUsersCreated = 0;

  // 마스터 테스트 유저 생성 (모든 시나리오 테스트 가능)
  const masterUserId = uuidv4();
  userIds.push(masterUserId);
  const masterUserCreatedAt = new Date('2025-01-01T00:00:00.000Z');
  const masterUser: Prisma.UserCreateManyInput = {
    id: masterUserId,
    providerId: null,
    provider: 'local',
    type: 'USER',
    name: '마스터 유저',
    email: 'user@master.com',
    password: masterPassword,
    phone: '1000000000',
    refreshTokens: null,
    isEmailVerified: true,
    isDelete: false,
    createdAt: masterUserCreatedAt,
    updatedAt: getRandomDate2025After(masterUserCreatedAt),
  };
  await batchCreateMany(
    (args) => prisma.user.createMany(args),
    [masterUser],
    1000,
    'users (master)',
  );
  totalUsersCreated += 1;
  logger.info(`   ✅ Created master user: ${masterUserId}`);

  // 일반 유저 45,000명 생성 (20% 규모, 배치 처리)
  const userBatchSize = 1000; // 1,000명씩 배치 처리
  const totalUserBatches = Math.ceil(45000 / userBatchSize);
  logger.info(
    `   Creating 45,000 regular users in ${totalUserBatches} batches (${userBatchSize} users per batch)`,
  );

  for (let batchIndex = 0; batchIndex < totalUserBatches; batchIndex++) {
    const batchStart = batchIndex * userBatchSize;
    const batchEnd = Math.min(batchStart + userBatchSize, 45000);
    const batchSize = batchEnd - batchStart;
    const batchNumber = batchIndex + 1;

    logger.info(
      `   [Users] Processing batch ${batchNumber}/${totalUserBatches}: users ${batchStart + 1}-${batchEnd} (${batchSize} users)`,
    );

    const batchStartTime = Date.now();
    const batchUsers: Prisma.UserCreateManyInput[] = [];

    for (let i = batchStart; i < batchEnd; i++) {
      const userId = uuidv4();
      userIds.push(userId);

      const providers = ['local', 'google', 'naver', 'kakao'];
      const provider = randomItem(providers);
      const isLocal = provider === 'local';
      const createdAt = getRandomDate2025();
      const updatedAt = getRandomDate2025After(createdAt);

      batchUsers.push({
        id: userId,
        providerId: isLocal ? null : uuidv4(),
        provider,
        type: 'USER',
        name: randomItem(koreanNames),
        email: `user${i + 1}@example.com`,
        password: isLocal ? masterPassword : null,
        phone: `10${String(randomInt(1000, 9999)).padStart(4, '0')}${String(randomInt(1000, 9999)).padStart(4, '0')}`,
        refreshTokens: null,
        isEmailVerified: true,
        isDelete: false,
        createdAt,
        updatedAt,
      });
    }

    const dbBatchStartTime = Date.now();
    await batchCreateMany(
      (args) => prisma.user.createMany(args),
      batchUsers,
      1000,
      `users (regular batch ${batchNumber})`,
    );
    const dbBatchElapsed = Date.now() - dbBatchStartTime;
    totalUsersCreated += batchUsers.length;

    const batchElapsed = Date.now() - batchStartTime;
    const progress = ((batchEnd / 45000) * 100).toFixed(1);

    logger.info(
      `   [Users] Batch ${batchNumber}/${totalUserBatches} completed: ` +
        `Created ${batchUsers.length} users | ` +
        `Progress: ${batchEnd}/45,000 (${progress}%) | ` +
        `Batch time: ${batchElapsed}ms (DB: ${dbBatchElapsed}ms) | ` +
        `Total created: ${totalUsersCreated}`,
    );
  }

  // 마스터 테스트 드라이버 생성 (드라이버 기능 테스트용)
  const masterDriverId = uuidv4();
  driverIds.push(masterDriverId);
  const masterDriverCreatedAt = new Date('2025-01-01T00:00:00.000Z');
  const masterDriver: Prisma.UserCreateManyInput = {
    id: masterDriverId,
    providerId: null,
    provider: 'local',
    type: 'DRIVER',
    name: '마스터 드라이버',
    email: 'driver@master.com',
    password: masterPassword,
    phone: '1000000001',
    refreshTokens: null,
    isEmailVerified: true,
    isDelete: false,
    createdAt: masterDriverCreatedAt,
    updatedAt: getRandomDate2025After(masterDriverCreatedAt),
  };
  await batchCreateMany(
    (args) => prisma.user.createMany(args),
    [masterDriver],
    1000,
    'users (master driver)',
  );
  totalUsersCreated += 1;
  logger.info(`   ✅ Created master driver: ${masterDriverId}`);

  // ADMIN 유저 생성 (관리자 기능 테스트용)
  const adminUserId = uuidv4();
  const adminCreatedAt = new Date('2025-01-01T00:00:00.000Z');
  const adminUser: Prisma.UserCreateManyInput = {
    id: adminUserId,
    providerId: null,
    provider: 'local',
    type: 'ADMIN',
    name: '관리자',
    email: 'admin@master.com',
    password: masterPassword,
    phone: '1000000002',
    refreshTokens: null,
    isEmailVerified: true,
    isDelete: false,
    createdAt: adminCreatedAt,
    updatedAt: getRandomDate2025After(adminCreatedAt),
  };
  await batchCreateMany((args) => prisma.user.createMany(args), [adminUser], 1000, 'users (admin)');
  totalUsersCreated += 1;
  logger.info(`   ✅ Created admin user: ${adminUserId}`);

  // 기사님 27,000명 생성 (20% 규모, 배치 처리)
  const driverBatchSize = 1000; // 1,000명씩 배치 처리
  const totalDriverBatches = Math.ceil(27000 / driverBatchSize);
  logger.info(
    `   Creating 27,000 drivers in ${totalDriverBatches} batches (${driverBatchSize} drivers per batch)`,
  );

  for (let batchIndex = 0; batchIndex < totalDriverBatches; batchIndex++) {
    const batchStart = batchIndex * driverBatchSize;
    const batchEnd = Math.min(batchStart + driverBatchSize, 27000);
    const batchSize = batchEnd - batchStart;
    const batchNumber = batchIndex + 1;

    logger.info(
      `   [Drivers] Processing batch ${batchNumber}/${totalDriverBatches}: drivers ${batchStart + 1}-${batchEnd} (${batchSize} drivers)`,
    );

    const batchStartTime = Date.now();
    const batchDrivers: Prisma.UserCreateManyInput[] = [];

    for (let i = batchStart; i < batchEnd; i++) {
      const driverId = uuidv4();
      driverIds.push(driverId);

      const providers = ['local', 'google', 'naver', 'kakao'];
      const provider = randomItem(providers);
      const isLocal = provider === 'local';
      const createdAt = getRandomDate2025();
      const updatedAt = getRandomDate2025After(createdAt);

      batchDrivers.push({
        id: driverId,
        providerId: isLocal ? null : uuidv4(),
        provider,
        type: 'DRIVER',
        name: randomItem(koreanNames),
        email: `driver${i + 1}@example.com`,
        password: isLocal ? masterPassword : null,
        phone: `10${String(randomInt(1000, 9999)).padStart(4, '0')}${String(randomInt(1000, 9999)).padStart(4, '0')}`,
        refreshTokens: null,
        isEmailVerified: true,
        isDelete: false,
        createdAt,
        updatedAt,
      });
    }

    const dbBatchStartTime = Date.now();
    await batchCreateMany(
      (args) => prisma.user.createMany(args),
      batchDrivers,
      1000,
      `users (drivers batch ${batchNumber})`,
    );
    const dbBatchElapsed = Date.now() - dbBatchStartTime;
    totalUsersCreated += batchDrivers.length;

    const batchElapsed = Date.now() - batchStartTime;
    const progress = ((batchEnd / 27000) * 100).toFixed(1);

    logger.info(
      `   [Drivers] Batch ${batchNumber}/${totalDriverBatches} completed: ` +
        `Created ${batchDrivers.length} drivers | ` +
        `Progress: ${batchEnd}/27,000 (${progress}%) | ` +
        `Batch time: ${batchElapsed}ms (DB: ${dbBatchElapsed}ms) | ` +
        `Total created: ${totalUsersCreated}`,
    );
  }

  // new-driver 기사님 생성 (방금 가입해서 아무런 연결 관계가 없음)
  const newDriverId = uuidv4();
  // driverIds에는 추가하지 않음 (견적 생성 시 제외하기 위해)
  const newDriverCreatedAt = getRandomDate2025();
  const newDriver: Prisma.UserCreateManyInput = {
    id: newDriverId,
    providerId: null,
    provider: 'local',
    type: 'DRIVER',
    name: 'new-driver',
    email: 'new-driver@example.com',
    password: masterPassword,
    phone: '1099999999',
    refreshTokens: null,
    isEmailVerified: true,
    isDelete: false,
    createdAt: newDriverCreatedAt,
    updatedAt: getRandomDate2025After(newDriverCreatedAt),
  };
  await batchCreateMany(
    (args) => prisma.user.createMany(args),
    [newDriver],
    1000,
    'users (new-driver)',
  );
  totalUsersCreated += 1;
  logger.info(`   ✅ Created new-driver: ${newDriverId}`);

  // 추가 테스트 유저 1,080명 (다양한 시나리오 테스트용, 20% 규모, 배치 처리)
  const testUserBatchSize = 1000; // 1,000명씩 배치 처리
  const totalTestUserBatches = Math.ceil(1080 / testUserBatchSize);
  logger.info(
    `   Creating 1,080 test users in ${totalTestUserBatches} batches (${testUserBatchSize} users per batch)`,
  );

  for (let batchIndex = 0; batchIndex < totalTestUserBatches; batchIndex++) {
    const batchStart = batchIndex * testUserBatchSize;
    const batchEnd = Math.min(batchStart + testUserBatchSize, 1080);
    const batchSize = batchEnd - batchStart;
    const batchNumber = batchIndex + 1;

    logger.info(
      `   [Test Users] Processing batch ${batchNumber}/${totalTestUserBatches}: users ${batchStart + 1}-${batchEnd} (${batchSize} users)`,
    );

    const batchStartTime = Date.now();
    const batchTestUsers: Prisma.UserCreateManyInput[] = [];

    for (let i = batchStart; i < batchEnd; i++) {
      const testUserId = uuidv4();
      userIds.push(testUserId);
      const createdAt = getRandomDate2025();
      const updatedAt = getRandomDate2025After(createdAt);
      batchTestUsers.push({
        id: testUserId,
        providerId: null,
        provider: 'local',
        type: 'USER',
        name: `테스트유저${i + 1}`,
        email: `testuser${i + 1}@example.com`,
        password: masterPassword,
        phone: `10${String(9000 + (i % 1000)).padStart(4, '0')}${String(Math.floor(i / 1000)).padStart(4, '0')}`,
        refreshTokens: null,
        isEmailVerified: true,
        isDelete: false,
        createdAt,
        updatedAt,
      });
    }

    const dbBatchStartTime = Date.now();
    await batchCreateMany(
      (args) => prisma.user.createMany(args),
      batchTestUsers,
      1000,
      `users (test batch ${batchNumber})`,
    );
    const dbBatchElapsed = Date.now() - dbBatchStartTime;
    totalUsersCreated += batchTestUsers.length;

    const batchElapsed = Date.now() - batchStartTime;
    const progress = ((batchEnd / 1080) * 100).toFixed(1);

    logger.info(
      `   [Test Users] Batch ${batchNumber}/${totalTestUserBatches} completed: ` +
        `Created ${batchTestUsers.length} test users | ` +
        `Progress: ${batchEnd}/1,080 (${progress}%) | ` +
        `Batch time: ${batchElapsed}ms (DB: ${dbBatchElapsed}ms) | ` +
        `Total created: ${totalUsersCreated}`,
    );
  }

  logger.info(
    `✅ Created ${totalUsersCreated} users total (${userIds.length} users, ${driverIds.length} drivers, 1 admin)`,
  );

  // UserProfile 생성 (모든 유저에게 프로필 생성 - 100% 커버리지, 배치 처리)
  logger.info('👤 Creating user profiles...');
  const userProfileBatchSize = 1000; // 1,000개씩 배치 처리
  const totalUserProfileBatches = Math.ceil(userIds.length / userProfileBatchSize);
  let totalUserProfilesCreated = 0;

  logger.info(
    `   Creating ${userIds.length} user profiles in ${totalUserProfileBatches} batches (${userProfileBatchSize} profiles per batch)`,
  );

  for (let batchIndex = 0; batchIndex < totalUserProfileBatches; batchIndex++) {
    const batchStart = batchIndex * userProfileBatchSize;
    const batchEnd = Math.min(batchStart + userProfileBatchSize, userIds.length);
    const batchUserIds = userIds.slice(batchStart, batchEnd);
    const batchNumber = batchIndex + 1;

    logger.info(
      `   [User Profiles] Processing batch ${batchNumber}/${totalUserProfileBatches}: profiles ${batchStart + 1}-${batchEnd} (${batchUserIds.length} profiles)`,
    );

    const batchStartTime = Date.now();
    const batchUserProfiles: Prisma.UserProfileCreateManyInput[] = batchUserIds.map((userId) => {
      const userCreatedAt = getRandomDate2025(); // 랜덤 생성 (DB 조회 없이)
      const createdAt = getRandomDate2025After(userCreatedAt);
      const updatedAt = getRandomDate2025After(createdAt);
      return {
        userId,
        imageUrl: randomItem(userImageUrls), // 두 URL 중 랜덤
        regions: randomItems(regions, randomInt(1, 5)),
        services: randomItems(services, randomInt(1, 3)),
        createdAt,
        updatedAt,
      };
    });

    const dbBatchStartTime = Date.now();
    await batchCreateMany(
      (args) => prisma.userProfile.createMany(args),
      batchUserProfiles,
      1000,
      `user profiles (batch ${batchNumber})`,
    );
    const dbBatchElapsed = Date.now() - dbBatchStartTime;
    totalUserProfilesCreated += batchUserProfiles.length;

    const batchElapsed = Date.now() - batchStartTime;
    const progress = ((batchEnd / userIds.length) * 100).toFixed(1);

    logger.info(
      `   [User Profiles] Batch ${batchNumber}/${totalUserProfileBatches} completed: ` +
        `Created ${batchUserProfiles.length} profiles | ` +
        `Progress: ${batchEnd}/${userIds.length} (${progress}%) | ` +
        `Batch time: ${batchElapsed}ms (DB: ${dbBatchElapsed}ms) | ` +
        `Total created: ${totalUserProfilesCreated}`,
    );
  }

  logger.info(`✅ Created ${totalUserProfilesCreated} user profiles`);

  // DriverProfile 생성 (모든 기사님 프로필 생성 + 마스터 드라이버 + new-driver, NULL 값 없이 촘촘하게, 배치 처리)
  logger.info('🚗 Creating driver profiles...');
  const driverProfileBatchSize = 1000; // 1,000개씩 배치 처리
  const totalDriverProfileBatches = Math.ceil(driverIds.length / driverProfileBatchSize);
  let totalDriverProfilesCreated = 0;

  logger.info(
    `   Creating ${driverIds.length} driver profiles in ${totalDriverProfileBatches} batches (${driverProfileBatchSize} profiles per batch)`,
  );

  // 마스터 드라이버 프로필 먼저 생성
  const masterDriverOfficeAddr = randomItem(addresses);
  const masterDriverOfficeCoords = getKoreanCoordinates(
    masterDriverOfficeAddr.sido,
    masterDriverOfficeAddr.sigungu,
  );
  const masterDriverProfileUserCreatedAt = new Date('2025-01-01T00:00:00.000Z');
  const masterDriverProfileCreatedAt = getRandomDate2025After(masterDriverProfileUserCreatedAt);
  const masterDriverProfileUpdatedAt = getRandomDate2025After(masterDriverProfileCreatedAt);
  const masterDriverOfficeUpdatedAt = getRandomDate2025After(masterDriverProfileCreatedAt);
  const masterDriverProfile: Prisma.DriverProfileCreateManyInput = {
    driverId: masterDriverId,
    imageUrl: randomItem(driverImageUrls),
    career: 10,
    shortIntro: '마스터 드라이버입니다. 모든 기능을 테스트할 수 있습니다.',
    description: '드라이버 기능 테스트를 위한 마스터 계정입니다.',
    regions: ['서울', '경기', '인천'],
    services: ['SMALL_MOVING', 'HOME_MOVING', 'OFFICE_MOVING'],
    officeAddress: `${masterDriverOfficeAddr.sido} ${masterDriverOfficeAddr.sigungu} ${masterDriverOfficeAddr.address}`,
    officeLat: masterDriverOfficeCoords.lat,
    officeLng: masterDriverOfficeCoords.lng,
    officeSido: masterDriverOfficeAddr.sido,
    officeSigungu: masterDriverOfficeAddr.sigungu,
    officeZoneCode: masterDriverOfficeAddr.zoneCode,
    officeUpdatedAt: masterDriverOfficeUpdatedAt,
    createdAt: masterDriverProfileCreatedAt,
    updatedAt: masterDriverProfileUpdatedAt,
  };
  await batchCreateMany(
    (args) => prisma.driverProfile.createMany(args),
    [masterDriverProfile],
    1000,
    'driver profiles (master)',
  );
  totalDriverProfilesCreated += 1;
  logger.info(`   ✅ Created master driver profile: ${masterDriverId}`);

  // 일반 드라이버 프로필 배치 처리
  for (let batchIndex = 0; batchIndex < totalDriverProfileBatches; batchIndex++) {
    const batchStart = batchIndex * driverProfileBatchSize;
    const batchEnd = Math.min(batchStart + driverProfileBatchSize, driverIds.length);
    const batchDriverIds = driverIds.slice(batchStart, batchEnd);
    const batchNumber = batchIndex + 1;

    logger.info(
      `   [Driver Profiles] Processing batch ${batchNumber}/${totalDriverProfileBatches}: profiles ${batchStart + 1}-${batchEnd} (${batchDriverIds.length} profiles)`,
    );

    const batchStartTime = Date.now();
    const batchDriverProfiles: Prisma.DriverProfileCreateManyInput[] = batchDriverIds.map(
      (driverId) => {
        const driverCreatedAt = getRandomDate2025(); // 랜덤 생성 (DB 조회 없이)
        const createdAt = getRandomDate2025After(driverCreatedAt);
        const updatedAt = getRandomDate2025After(createdAt);
        const officeUpdatedAt = getRandomDate2025After(createdAt);

        const officeAddr = randomItem(addresses);
        const officeCoords = getKoreanCoordinates(officeAddr.sido, officeAddr.sigungu);
        return {
          driverId,
          imageUrl: randomItem(driverImageUrls),
          career: randomInt(1, 30),
          shortIntro: randomItem(shortIntros),
          description: randomItem(descriptions),
          regions: randomItems(regions, randomInt(1, 8)),
          services: randomItems(services, randomInt(1, 3)),
          officeAddress: `${officeAddr.sido} ${officeAddr.sigungu} ${officeAddr.address}`,
          officeLat: officeCoords.lat,
          officeLng: officeCoords.lng,
          officeSido: officeAddr.sido,
          officeSigungu: officeAddr.sigungu,
          officeZoneCode: officeAddr.zoneCode,
          officeUpdatedAt,
          createdAt,
          updatedAt,
        };
      },
    );

    const dbBatchStartTime = Date.now();
    await batchCreateMany(
      (args) => prisma.driverProfile.createMany(args),
      batchDriverProfiles,
      1000,
      `driver profiles (batch ${batchNumber})`,
    );
    const dbBatchElapsed = Date.now() - dbBatchStartTime;
    totalDriverProfilesCreated += batchDriverProfiles.length;

    const batchElapsed = Date.now() - batchStartTime;
    const progress = ((batchEnd / driverIds.length) * 100).toFixed(1);

    logger.info(
      `   [Driver Profiles] Batch ${batchNumber}/${totalDriverProfileBatches} completed: ` +
        `Created ${batchDriverProfiles.length} profiles | ` +
        `Progress: ${batchEnd}/${driverIds.length} (${progress}%) | ` +
        `Batch time: ${batchElapsed}ms (DB: ${dbBatchElapsed}ms) | ` +
        `Total created: ${totalDriverProfilesCreated}`,
    );
  }

  // new-driver 프로필 추가 (프로필 정보는 모두 있지만 아직 활동 없음, NULL 값 없이)
  const newDriverOfficeAddr = randomItem(addresses);
  const newDriverOfficeCoords = getKoreanCoordinates(
    newDriverOfficeAddr.sido,
    newDriverOfficeAddr.sigungu,
  );
  const newDriverUserCreatedAt = getRandomDate2025();
  const newDriverProfileCreatedAt = getRandomDate2025After(newDriverUserCreatedAt);
  const newDriverProfileUpdatedAt = getRandomDate2025After(newDriverProfileCreatedAt);
  const newDriverOfficeUpdatedAt = getRandomDate2025After(newDriverProfileCreatedAt);
  const newDriverProfile: Prisma.DriverProfileCreateManyInput = {
    driverId: newDriverId,
    imageUrl: randomItem(driverImageUrls),
    career: randomInt(5, 25),
    shortIntro: randomItem(shortIntros),
    description: randomItem(descriptions),
    regions: randomItems(regions, randomInt(2, 5)),
    services: randomItems(services, randomInt(1, 3)),
    officeAddress: `${newDriverOfficeAddr.sido} ${newDriverOfficeAddr.sigungu} ${newDriverOfficeAddr.address}`,
    officeLat: newDriverOfficeCoords.lat,
    officeLng: newDriverOfficeCoords.lng,
    officeSido: newDriverOfficeAddr.sido,
    officeSigungu: newDriverOfficeAddr.sigungu,
    officeZoneCode: newDriverOfficeAddr.zoneCode,
    officeUpdatedAt: newDriverOfficeUpdatedAt,
    createdAt: newDriverProfileCreatedAt,
    updatedAt: newDriverProfileUpdatedAt,
  };
  await batchCreateMany(
    (args) => prisma.driverProfile.createMany(args),
    [newDriverProfile],
    1000,
    'driver profiles (new-driver)',
  );
  totalDriverProfilesCreated += 1;
  logger.info(`   ✅ Created new-driver profile: ${newDriverId}`);

  logger.info(`✅ Created ${totalDriverProfilesCreated} driver profiles total`);

  // EstimateRequest 생성 (배치 처리)
  // 규칙:
  // 1. 유저당 진행 중인 요청(PENDING)은 최대 1개만 가능
  // 2. 이사일 이후에만 새로운 요청 가능 (과거 요청의 이사일이 지난 후에만 새 요청 생성)
  // 3. 활성 요청은 1개만 유지 가능
  logger.info('📋 Creating estimate requests...');
  const estimateRequestIds: string[] = [];
  const userPendingRequestMap = new Map<string, boolean>(); // 유저별 PENDING 요청 존재 여부
  const userLastMovingDateMap = new Map<string, Date>(); // 유저별 마지막 이사일 추적
  let totalEstimateRequestsCreated = 0;

  // 배치 저장을 위한 임시 배열
  const estimateRequestBatchSize = 1000; // 1,000개마다 DB에 저장
  let currentBatch: Prisma.EstimateRequestCreateManyInput[] = [];

  // 배치 저장 함수
  const flushEstimateRequestBatch = async (isFinal: boolean = false) => {
    if (currentBatch.length >= estimateRequestBatchSize || (isFinal && currentBatch.length > 0)) {
      const batchStartTime = Date.now();
      const batchCount = currentBatch.length;
      await batchCreateMany(
        (args) => prisma.estimateRequest.createMany(args),
        currentBatch,
        1000,
        `estimate requests (batch ${Math.floor(totalEstimateRequestsCreated / estimateRequestBatchSize) + 1})`,
      );
      totalEstimateRequestsCreated += batchCount;
      const batchElapsed = Date.now() - batchStartTime;
      logger.info(
        `   [Estimate Requests] Flushed batch: ${batchCount} requests saved | ` +
          `Total created: ${totalEstimateRequestsCreated} | ` +
          `Elapsed: ${batchElapsed}ms`,
      );
      currentBatch = [];
    }
  };

  // 2025년 기준 날짜 설정
  const now = new Date('2025-12-31T23:59:59.999Z'); // 2025년 말
  const pastDate = new Date('2025-01-01T00:00:00.000Z'); // 2025년 초

  // 마스터 유저를 위한 다양한 상태의 견적 요청 생성 (테스트용, 50만 건 견적 목표)
  // 마스터 유저는 PENDING 1개 + 다른 상태들 여러 개 (다양한 시나리오 테스트)
  const masterRequestStatuses: EstimateStatus[] = [];
  masterRequestStatuses.push('PENDING'); // 진행 중인 요청 1개
  // 나머지 299개 요청 생성 (CONFIRMED 50%, REJECTED 30%, CANCELLED 20%)
  for (let i = 0; i < 299; i++) {
    const rand = Math.random();
    if (rand < 0.5) masterRequestStatuses.push('CONFIRMED');
    else if (rand < 0.8) masterRequestStatuses.push('REJECTED');
    else masterRequestStatuses.push('CANCELLED');
  }

  let masterLastMovingDate = new Date(pastDate);
  for (let i = 0; i < masterRequestStatuses.length; i++) {
    const requestId = uuidv4();
    estimateRequestIds.push(requestId);
    const status = masterRequestStatuses[i];

    // PENDING인 경우 체크
    if (status === 'PENDING') {
      userPendingRequestMap.set(masterUserId, true);
      // PENDING은 2025년 내 미래 날짜
      masterLastMovingDate = getRandomDate2025After(new Date('2025-06-01'));
    } else {
      // 과거 요청들은 2025년 내 날짜로 설정
      masterLastMovingDate = getRandomDate2025Before(new Date('2025-12-31'));
      // 마지막 이사일 이후로 설정
      if (userLastMovingDateMap.has(masterUserId)) {
        const lastDate = userLastMovingDateMap.get(masterUserId)!;
        if (masterLastMovingDate <= lastDate) {
          masterLastMovingDate = getRandomDate2025After(lastDate);
        }
      }
      userLastMovingDateMap.set(masterUserId, masterLastMovingDate);
    }

    const isDesignated = i % 5 === 1; // 일부는 지정 요청
    const designatedDriverId = isDesignated ? randomItem(driverIds) : null;
    const requestCreatedAt = getRandomDate2025Before(masterLastMovingDate);
    const requestUpdatedAt = getRandomDate2025After(requestCreatedAt);

    currentBatch.push({
      id: requestId,
      userId: masterUserId,
      movingType: randomItem(services),
      movingDate: masterLastMovingDate,
      status,
      isDesignated,
      designatedDriverId,
      isDelete: i % 20 === 0, // 5%는 삭제된 요청
      createdAt: requestCreatedAt,
      updatedAt: requestUpdatedAt,
    });
    await flushEstimateRequestBatch();
  }

  // 나머지 유저들에 대한 견적 요청 생성
  // 각 유저당: PENDING 0~1개, CONFIRMED/REJECTED/CANCELLED 여러 개 가능
  // 이사일 이후에만 새로운 요청 가능
  const availableUsers = [...userIds.filter((id) => id !== masterUserId)]; // 마스터 유저 제외한 유저들
  const userRequestCount = new Map<string, number>(); // 유저별 요청 수 추적

  // 각 유저당 0~10개의 과거 요청 생성 (PENDING 제외, 더 다양한 시나리오, 50만 건 견적 목표)
  for (const userId of availableUsers) {
    const requestCount = randomInt(0, 10); // 유저당 0~10개의 과거 요청 (50만 건 견적 목표)
    userRequestCount.set(userId, requestCount);

    let lastMovingDate = new Date(pastDate);
    for (let i = 0; i < requestCount; i++) {
      const requestId = uuidv4();
      estimateRequestIds.push(requestId);

      // 2025년 내 날짜로 설정, 이전 이사일 이후로
      let movingDate = getRandomDate2025();

      // 마지막 이사일 이후로 설정
      if (movingDate <= lastMovingDate) {
        movingDate = getRandomDate2025After(lastMovingDate);
      }
      lastMovingDate = movingDate;
      userLastMovingDateMap.set(userId, lastMovingDate);

      // 상태 분포: CONFIRMED 50%, REJECTED 30%, CANCELLED 20% (PENDING 제외)
      const statusRand = Math.random();
      let status: EstimateStatus;
      if (statusRand < 0.5) status = 'CONFIRMED';
      else if (statusRand < 0.8) status = 'REJECTED';
      else status = 'CANCELLED';

      const isDesignated = Math.random() < 0.2;
      const designatedDriverId = isDesignated ? randomItem(driverIds) : null;
      const requestCreatedAt = getRandomDate2025Before(movingDate);
      const requestUpdatedAt = getRandomDate2025After(requestCreatedAt);

      currentBatch.push({
        id: requestId,
        userId,
        movingType: randomItem(services),
        movingDate,
        status,
        isDesignated,
        designatedDriverId,
        isDelete: Math.random() < 0.05, // 5%는 삭제된 요청
        createdAt: requestCreatedAt,
        updatedAt: requestUpdatedAt,
      });
      await flushEstimateRequestBatch();
    }
  }

  // 일부 유저들에게 PENDING 요청 1개씩 추가 (진행 중인 요청)
  // 이사일 이후에만 새로운 요청 가능하므로, 마지막 이사일 이후로 설정
  const usersWithPendingRequest = randomItems(
    availableUsers,
    Math.min(Math.floor(availableUsers.length * 0.4), availableUsers.length), // 40%의 유저만 PENDING 요청
  );

  for (const userId of usersWithPendingRequest) {
    if (userPendingRequestMap.has(userId)) continue; // 이미 PENDING 요청이 있으면 스킵

    const requestId = uuidv4();
    estimateRequestIds.push(requestId);
    userPendingRequestMap.set(userId, true);

    // 마지막 이사일 이후로 설정 (이사일 이후에만 새로운 요청 가능)
    let movingDate = getRandomDate2025After(new Date('2025-06-01')); // 2025년 하반기

    if (userLastMovingDateMap.has(userId)) {
      const lastDate = userLastMovingDateMap.get(userId)!;
      // 마지막 이사일이 미래인 경우, 그 이후로 설정
      if (lastDate > new Date('2025-06-01')) {
        movingDate = getRandomDate2025After(lastDate);
      } else {
        // 마지막 이사일이 과거인 경우, 2025년 하반기로 설정
        movingDate = getRandomDate2025After(new Date('2025-06-01'));
      }
    }

    const isDesignated = Math.random() < 0.2;
    const designatedDriverId = isDesignated ? randomItem(driverIds) : null;
    const requestCreatedAt = getRandomDate2025Before(movingDate);
    const requestUpdatedAt = getRandomDate2025After(requestCreatedAt);

    currentBatch.push({
      id: requestId,
      userId,
      movingType: randomItem(services),
      movingDate,
      status: 'PENDING',
      isDesignated,
      designatedDriverId,
      isDelete: false, // PENDING 요청은 삭제하지 않음
      createdAt: requestCreatedAt,
      updatedAt: requestUpdatedAt,
    });
    await flushEstimateRequestBatch();
  }

  // 마지막 배치 저장
  await flushEstimateRequestBatch(true);
  logger.info(`✅ Created ${totalEstimateRequestsCreated} estimate requests`);

  // 각 요청에 대해 견적 생성을 위해 DB에서 조회
  logger.info('   Fetching estimate requests for estimate creation...');
  const estimateRequests = await prisma.estimateRequest.findMany({
    select: {
      id: true,
      userId: true,
      movingType: true,
      movingDate: true,
      status: true,
      isDesignated: true,
      designatedDriverId: true,
      isDelete: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  const requestMap = new Map(
    estimateRequests.map((req) => [
      req.id,
      {
        id: req.id,
        userId: req.userId,
        movingType: req.movingType,
        movingDate: req.movingDate,
        status: req.status,
        isDesignated: req.isDesignated,
        designatedDriverId: req.designatedDriverId,
        isDelete: req.isDelete,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
      } as Prisma.EstimateRequestCreateManyInput,
    ]),
  );
  logger.info(`   ✅ Fetched ${estimateRequests.length} estimate requests from DB`);

  // DB에 실제로 저장된 ID 목록만 사용 (외래 키 제약 조건을 위해)
  const validEstimateRequestIds = estimateRequests.map((req) => req.id);
  if (validEstimateRequestIds.length !== estimateRequestIds.length) {
    logger.warn(
      `   ⚠️  Warning: ${estimateRequestIds.length} IDs in memory, but only ${validEstimateRequestIds.length} found in DB. Using DB IDs only.`,
    );
  }

  // Address 생성 (각 요청당 FROM, TO 주소, 배치 처리)
  logger.info('📍 Creating addresses...');
  const addressBatchSize = 1000; // 1,000개씩 배치 처리 (요청당 2개 주소이므로 실제로는 500개 요청)
  const totalAddressBatches = Math.ceil(validEstimateRequestIds.length / (addressBatchSize / 2));
  let totalAddressesCreated = 0;

  logger.info(
    `   Creating addresses for ${validEstimateRequestIds.length} requests in ${totalAddressBatches} batches (${addressBatchSize / 2} requests per batch, 2 addresses per request)`,
  );

  for (let batchIndex = 0; batchIndex < totalAddressBatches; batchIndex++) {
    const batchStart = batchIndex * (addressBatchSize / 2);
    const batchEnd = Math.min(batchStart + addressBatchSize / 2, validEstimateRequestIds.length);
    const batchRequestIds = validEstimateRequestIds.slice(batchStart, batchEnd);
    const batchNumber = batchIndex + 1;

    logger.info(
      `   [Addresses] Processing batch ${batchNumber}/${totalAddressBatches}: requests ${batchStart + 1}-${batchEnd} (${batchRequestIds.length} requests, ~${batchRequestIds.length * 2} addresses)`,
    );

    const batchStartTime = Date.now();
    const batchAddresses: Prisma.AddressCreateManyInput[] = [];

    for (const requestId of batchRequestIds) {
      const request = requestMap.get(requestId);
      if (!request) {
        logger.warn(`   ⚠️  Warning: Request ${requestId} not found in requestMap, skipping...`);
        continue;
      }
      const fromAddr = randomItem(addresses);
      let toAddr = randomItem(addresses);
      // FROM과 TO가 같지 않도록
      while (toAddr.zoneCode === fromAddr.zoneCode) {
        toAddr = randomItem(addresses);
      }

      const fromCoords = getKoreanCoordinates(fromAddr.sido, fromAddr.sigungu);
      const toCoords = getKoreanCoordinates(toAddr.sido, toAddr.sigungu);

      // 요청의 createdAt 이후 날짜로 설정
      const requestCreatedAt = request?.createdAt
        ? typeof request.createdAt === 'string'
          ? new Date(request.createdAt)
          : request.createdAt
        : getRandomDate2025();
      const addressCreatedAt = getRandomDate2025After(requestCreatedAt);
      const addressUpdatedAt = getRandomDate2025After(addressCreatedAt);

      batchAddresses.push(
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
          lat: fromCoords.lat,
          lng: fromCoords.lng,
          createdAt: addressCreatedAt,
          updatedAt: addressUpdatedAt,
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
          lat: toCoords.lat,
          lng: toCoords.lng,
          createdAt: addressCreatedAt,
          updatedAt: addressUpdatedAt,
        },
      );
    }

    const dbBatchStartTime = Date.now();
    await batchCreateMany(
      (args) => prisma.address.createMany(args),
      batchAddresses,
      1000,
      `addresses (batch ${batchNumber})`,
    );
    const dbBatchElapsed = Date.now() - dbBatchStartTime;
    totalAddressesCreated += batchAddresses.length;

    const batchElapsed = Date.now() - batchStartTime;
    const processedRequests = batchEnd;
    const progress = ((processedRequests / validEstimateRequestIds.length) * 100).toFixed(1);

    logger.info(
      `   [Addresses] Batch ${batchNumber}/${totalAddressBatches} completed: ` +
        `Created ${batchAddresses.length} addresses | ` +
        `Progress: ${processedRequests}/${validEstimateRequestIds.length} requests (${progress}%) | ` +
        `Batch time: ${batchElapsed}ms (DB: ${dbBatchElapsed}ms) | ` +
        `Total created: ${totalAddressesCreated}`,
    );
  }

  logger.info(`✅ Created ${totalAddressesCreated} addresses`);

  // Estimate 생성 (배치 처리)
  // 규칙:
  // 1. 한 견적 요청에 최대 5개의 견적
  // 2. 일반 요청: 최대 3개, 지정 요청: 추가 2개 가능 (총 5개)
  // 목표: 약 50만 건의 견적 생성
  logger.info('💰 Creating estimates...');
  const estimateIds: string[] = [];
  const requestEstimateCount = new Map<string, number>(); // 요청별 견적 수 추적
  const requestConfirmedEstimate = new Map<string, boolean>(); // 요청별 CONFIRMED 견적 존재 여부

  // 배치 처리 설정
  const estimateBatchSize = 100; // 요청당 배치 크기
  const totalRequests = validEstimateRequestIds.length;
  const totalBatches = Math.ceil(totalRequests / estimateBatchSize);
  let totalEstimatesCreated = 0;

  logger.info(
    `   Processing ${totalRequests} estimate requests in ${totalBatches} batches (${estimateBatchSize} requests per batch)`,
  );

  // 요청을 배치로 나눠서 처리
  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const batchStart = batchIndex * estimateBatchSize;
    const batchEnd = Math.min(batchStart + estimateBatchSize, totalRequests);
    const batchRequestIds = validEstimateRequestIds.slice(batchStart, batchEnd);
    const batchNumber = batchIndex + 1;

    logger.info(
      `   [Estimates] Processing batch ${batchNumber}/${totalBatches}: requests ${batchStart + 1}-${batchEnd} (${batchRequestIds.length} requests)`,
    );

    const batchStartTime = Date.now();
    const batchEstimates: Prisma.EstimateCreateManyInput[] = [];

    for (const requestId of batchRequestIds) {
      const request = requestMap.get(requestId);
      if (!request) continue;

      // 지정 요청인 경우 최대 5개 (일반 3개 + 지정 추가 2개), 일반 요청인 경우 최대 3개
      // 평균 약 2개/요청으로 50만 건 목표
      const maxEstimates = request.isDesignated ? 5 : 3;
      const estimateCount = randomInt(1, maxEstimates);
      requestEstimateCount.set(requestId, estimateCount);

      // 지정 요청인 경우 지정된 기사님을 포함
      let selectedDrivers: string[] = [];
      if (request.isDesignated && request.designatedDriverId) {
        const designatedDriverId = request.designatedDriverId as string;
        // designatedDriverId가 실제로 driverIds에 있는지 확인
        if (!driverIds.includes(designatedDriverId)) {
          logger.warn(
            `   ⚠️  Warning: designatedDriverId ${designatedDriverId} not found in driverIds, skipping designated request`,
          );
          // 일반 요청으로 처리
          selectedDrivers = randomItems(driverIds, Math.min(estimateCount, driverIds.length));
        } else {
          // 지정된 기사님을 첫 번째로 포함
          selectedDrivers = [designatedDriverId];
          // 나머지 기사님 선택 (지정된 기사님 제외)
          const otherDrivers = driverIds.filter((id) => id !== designatedDriverId);
          const additionalDrivers = randomItems(
            otherDrivers,
            Math.min(estimateCount - 1, otherDrivers.length),
          );
          selectedDrivers = [...selectedDrivers, ...additionalDrivers];
        }
      } else {
        // 일반 요청: 랜덤 선택
        selectedDrivers = randomItems(driverIds, Math.min(estimateCount, driverIds.length));
      }

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

        // 가격 범위 (더 다양한 가격대: 소형 30-100만원, 가정 100-300만원, 사무실 200-500만원)
        let priceRange: number;
        if (request.movingType === 'SMALL_MOVING') {
          priceRange = randomInt(300000, 1000000);
        } else if (request.movingType === 'HOME_MOVING') {
          priceRange = randomInt(1000000, 3000000);
        } else {
          priceRange = randomInt(2000000, 5000000);
        }

        // 모든 상태에서 comment 생성 (NULL 제거)
        const comment = randomItem(estimateComments[status]);

        // 견적 생성 날짜: 요청 생성 이후, 이사일 이전
        const requestCreatedAt = request.createdAt
          ? typeof request.createdAt === 'string'
            ? new Date(request.createdAt)
            : request.createdAt
          : getRandomDate2025();
        const estimateMovingDate = new Date(request.movingDate as Date);
        const estimateCreatedAt = getRandomDate2025After(requestCreatedAt);
        const estimateCreatedAtBeforeMoving =
          estimateCreatedAt < estimateMovingDate
            ? estimateCreatedAt
            : getRandomDate2025Before(estimateMovingDate);
        const estimateUpdatedAt = getRandomDate2025After(estimateCreatedAtBeforeMoving);

        // 모든 견적에 price와 comment 추가 (NULL 제거)
        // REJECTED나 CANCELLED 상태도 가격 제안이 있었을 수 있으므로 price 포함
        batchEstimates.push({
          id: estimateId,
          estimateRequestId: requestId,
          driverId,
          price: priceRange, // 모든 견적에 가격 포함
          comment, // 모든 견적에 코멘트 포함
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
          isDelete: Math.random() < 0.03, // 3%는 삭제된 견적
          createdAt: estimateCreatedAtBeforeMoving,
          updatedAt: estimateUpdatedAt,
        });
      }
    }

    // 배치별로 DB에 저장
    if (batchEstimates.length > 0) {
      const dbBatchStartTime = Date.now();
      await batchCreateMany(
        (args) => prisma.estimate.createMany(args),
        batchEstimates,
        1000,
        `estimates (batch ${batchNumber})`,
      );
      const dbBatchElapsed = Date.now() - dbBatchStartTime;
      totalEstimatesCreated += batchEstimates.length;

      const batchElapsed = Date.now() - batchStartTime;
      const processedRequests = batchEnd;
      const progress = ((processedRequests / totalRequests) * 100).toFixed(1);

      logger.info(
        `   [Estimates] Batch ${batchNumber}/${totalBatches} completed: ` +
          `Created ${batchEstimates.length} estimates | ` +
          `Progress: ${processedRequests}/${totalRequests} (${progress}%) | ` +
          `Batch time: ${batchElapsed}ms (DB: ${dbBatchElapsed}ms) | ` +
          `Total created: ${totalEstimatesCreated}`,
      );
    } else {
      logger.warn(`   [Estimates] Batch ${batchNumber}/${totalBatches}: No estimates to create`);
    }
  }

  logger.info(
    `✅ Created ${totalEstimatesCreated} estimates (${estimateIds.length} estimate IDs tracked)`,
  );

  // Review 생성 (확정된 견적에 충분한 리뷰 작성 - 다양한 점수 분포)
  logger.info('⭐ Creating reviews...');
  const reviews: Prisma.ReviewCreateManyInput[] = [];
  const reviewedEstimateIds = new Set<string>(); // 리뷰가 작성된 견적 ID 추적 (unique 제약)

  // CONFIRMED 상태이고 삭제되지 않은 견적 찾기 (DB에서 직접 조회)
  const confirmedEstimates = await prisma.estimate.findMany({
    where: {
      status: 'CONFIRMED',
      isDelete: false,
    },
    select: {
      id: true,
      estimateRequestId: true,
    },
  });
  logger.info(`   Found ${confirmedEstimates.length} CONFIRMED estimates`);

  // 실제 생성된 유저 ID 확인 (외래 키 제약 조건 확인용)
  const validUserIdsForReview = new Set(userIds);

  for (const estimate of confirmedEstimates) {
    // 이미 리뷰가 있는 견적은 스킵 (unique 제약)
    if (reviewedEstimateIds.has(estimate.id!)) continue;

    const request = requestMap.get(estimate.estimateRequestId);
    if (!request) continue;

    // userId가 실제로 존재하는지 확인
    const reviewUserId = request.userId as string;
    if (!validUserIdsForReview.has(reviewUserId)) {
      logger.warn(
        `   ⚠️  Warning: userId ${reviewUserId} not found in validUserIds, skipping review for estimate ${estimate.id}`,
      );
      continue;
    }

    const reviewMovingDate = new Date(request.movingDate as Date);
    const daysSinceMoving = (now.getTime() - reviewMovingDate.getTime()) / (1000 * 60 * 60 * 24);

    // 리뷰 작성 조건: 모든 CONFIRMED 견적에 리뷰 작성 (NULL 값 없이 촘촘하게)
    // 1. 이사일이 지난 경우 (과거 365일 이내) - 100% 확률로 리뷰 작성
    // 2. 이사일이 미래인 경우 - 100% 확률로 리뷰 작성 (사전 리뷰)
    // 3. 너무 오래된 경우 (365일 이상) - 100% 확률로 리뷰 작성
    // 모든 리뷰에 rating과 content 포함 (NULL 제거)

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

    // 리뷰 작성 날짜: 이사일 이후 (이사 후 리뷰 작성)
    const reviewCreatedAt = getRandomDate2025After(reviewMovingDate);
    const reviewUpdatedAt = getRandomDate2025After(reviewCreatedAt);

    reviewedEstimateIds.add(estimate.id!);
    reviews.push({
      estimateId: estimate.id!,
      userId: reviewUserId,
      rating, // 모든 리뷰에 rating 포함
      content, // 모든 리뷰에 content 포함
      createdAt: reviewCreatedAt,
      updatedAt: reviewUpdatedAt,
    });
  }

  // Review 배치 저장
  const reviewBatchSize = 1000; // 1,000개씩 배치 처리
  const totalReviewBatches = Math.ceil(reviews.length / reviewBatchSize);
  let totalReviewsCreated = 0;

  logger.info(
    `   Saving ${reviews.length} reviews in ${totalReviewBatches} batches (${reviewBatchSize} reviews per batch)`,
  );

  for (let batchIndex = 0; batchIndex < totalReviewBatches; batchIndex++) {
    const batchStart = batchIndex * reviewBatchSize;
    const batchEnd = Math.min(batchStart + reviewBatchSize, reviews.length);
    const batchReviews = reviews.slice(batchStart, batchEnd);
    const batchNumber = batchIndex + 1;

    logger.info(
      `   [Reviews] Processing batch ${batchNumber}/${totalReviewBatches}: reviews ${batchStart + 1}-${batchEnd} (${batchReviews.length} reviews)`,
    );

    const batchStartTime = Date.now();
    await batchCreateMany(
      (args) => prisma.review.createMany(args),
      batchReviews,
      1000,
      `reviews (batch ${batchNumber})`,
    );
    const batchElapsed = Date.now() - batchStartTime;
    totalReviewsCreated += batchReviews.length;

    const progress = ((batchEnd / reviews.length) * 100).toFixed(1);
    logger.info(
      `   [Reviews] Batch ${batchNumber}/${totalReviewBatches} completed: ` +
        `Created ${batchReviews.length} reviews | ` +
        `Progress: ${batchEnd}/${reviews.length} (${progress}%) | ` +
        `Batch time: ${batchElapsed}ms | ` +
        `Total created: ${totalReviewsCreated}`,
    );
  }

  logger.info(`✅ Created ${totalReviewsCreated} reviews`);

  // FavoriteDriver 생성 (랜덤하게 - 일부 기사님은 좋아요를 받지 못함)
  logger.info('❤️  Creating favorite drivers...');
  const favorites: Prisma.FavoriteDriverCreateManyInput[] = [];
  const favoritePairs = new Map<string, { userId: string; driverId: string }>(); // Map으로 userId와 driverId를 함께 저장
  const driverFavoriteCount = new Map<string, number>(); // 각 기사님이 받은 좋아요 수 추적

  // 실제 생성된 유저/기사 ID 확인 (외래 키 제약 조건 확인용)
  // 모든 userIds와 driverIds는 이미 DB에 생성되었으므로 그대로 사용
  const validUserIds = new Set(userIds);
  const validDriverIds = new Set(driverIds);

  // 기사님별 좋아요 수 초기화
  validDriverIds.forEach((driverId) => {
    driverFavoriteCount.set(driverId, 0);
  });

  // 75,000개의 좋아요 생성 (50만 건 견적 기준 비례 조정, 랜덤하게 분배, 일부 기사님은 많이 받고 일부는 적게)
  for (let i = 0; i < 75000; i++) {
    const userId = randomItem(Array.from(validUserIds));
    let driverId = randomItem(Array.from(validDriverIds));
    let pairKey = `${userId}::${driverId}`; // UUID에 하이픈이 있어서 :: 구분자 사용

    // 중복 방지
    if (favoritePairs.has(pairKey)) {
      // 중복이면 다른 기사님 선택
      const availableDrivers = Array.from(validDriverIds).filter(
        (id) => !favoritePairs.has(`${userId}::${id}`),
      );
      if (availableDrivers.length === 0) continue;
      driverId = randomItem(availableDrivers);
      // 새로운 pairKey 생성
      pairKey = `${userId}::${driverId}`;
      if (favoritePairs.has(pairKey)) continue;
    }

    favoritePairs.set(pairKey, { userId, driverId });
    const currentCount = driverFavoriteCount.get(driverId) || 0;
    driverFavoriteCount.set(driverId, currentCount + 1);
  }

  // 실제 favorite 데이터 생성
  for (const { userId, driverId } of favoritePairs.values()) {
    const favoriteCreatedAt = getRandomDate2025();
    const favoriteUpdatedAt = getRandomDate2025After(favoriteCreatedAt);
    favorites.push({
      userId,
      driverId,
      createdAt: favoriteCreatedAt,
      updatedAt: favoriteUpdatedAt,
    });
  }

  // FavoriteDriver 배치 저장
  const favoriteBatchSize = 1000; // 1,000개씩 배치 처리
  const totalFavoriteBatches = Math.ceil(favorites.length / favoriteBatchSize);
  let totalFavoritesCreated = 0;

  logger.info(
    `   Saving ${favorites.length} favorite drivers in ${totalFavoriteBatches} batches (${favoriteBatchSize} favorites per batch)`,
  );

  for (let batchIndex = 0; batchIndex < totalFavoriteBatches; batchIndex++) {
    const batchStart = batchIndex * favoriteBatchSize;
    const batchEnd = Math.min(batchStart + favoriteBatchSize, favorites.length);
    const batchFavorites = favorites.slice(batchStart, batchEnd);
    const batchNumber = batchIndex + 1;

    logger.info(
      `   [Favorite Drivers] Processing batch ${batchNumber}/${totalFavoriteBatches}: favorites ${batchStart + 1}-${batchEnd} (${batchFavorites.length} favorites)`,
    );

    const batchStartTime = Date.now();
    await batchCreateMany(
      (args) => prisma.favoriteDriver.createMany(args),
      batchFavorites,
      1000,
      `favorite drivers (batch ${batchNumber})`,
    );
    const batchElapsed = Date.now() - batchStartTime;
    totalFavoritesCreated += batchFavorites.length;

    const progress = ((batchEnd / favorites.length) * 100).toFixed(1);
    logger.info(
      `   [Favorite Drivers] Batch ${batchNumber}/${totalFavoriteBatches} completed: ` +
        `Created ${batchFavorites.length} favorites | ` +
        `Progress: ${batchEnd}/${favorites.length} (${progress}%) | ` +
        `Batch time: ${batchElapsed}ms | ` +
        `Total created: ${totalFavoritesCreated}`,
    );
  }

  const driversWithFavorites = Array.from(driverFavoriteCount.values()).filter(
    (count) => count > 0,
  ).length;
  logger.info(
    `✅ Created ${totalFavoritesCreated} favorite drivers (${driversWithFavorites}/${driverIds.length} drivers received favorites)`,
  );

  // Notification 생성 (100,000개 - 50만 건 견적 기준 비례 조정, 다양한 타입, 더 현실적인 분포)
  logger.info('🔔 Creating notifications...');
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

  // 실제 생성된 유저/기사 ID 확인 (외래 키 제약 조건 확인용)
  const validUserIdsForNotification = new Set(userIds);
  const validDriverIdsForNotification = new Set(driverIds);

  // 배열이 비어있지 않은지 확인
  if (userIds.length === 0) {
    logger.warn('   ⚠️  Warning: userIds array is empty, skipping notification creation');
  }
  if (driverIds.length === 0) {
    logger.warn('   ⚠️  Warning: driverIds array is empty, some notification types may be skipped');
  }

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

  for (let i = 0; i < 100000; i++) {
    const type = getWeightedNotificationType();
    let message = '';
    let userId = '';

    switch (type) {
      case 'REQUEST_SENT':
        if (userIds.length > 0) {
          userId = randomItem(userIds);
          message = '견적 요청이 전송되었습니다.';
        } else {
          continue; // userIds가 비어있으면 스킵
        }
        break;
      case 'ESTIMATE_RECEIVED':
        if (userIds.length > 0) {
          userId = randomItem(userIds);
          message = '새로운 견적서가 도착했습니다.';
        } else {
          continue;
        }
        break;
      case 'ESTIMATE_CONFIRMED':
        if (userIds.length > 0) {
          userId = randomItem(userIds);
          message = '견적이 확정되었습니다.';
        } else {
          continue;
        }
        break;
      case 'ESTIMATE_REJECTED':
        if (driverIds.length > 0) {
          userId = randomItem(driverIds);
          message = '견적 요청이 반려되었습니다.';
        } else {
          continue;
        }
        break;
      case 'ESTIMATE_EXPIRED':
        if (userIds.length > 0) {
          userId = randomItem(userIds);
          message = '견적이 만료되었습니다.';
        } else {
          continue;
        }
        break;
      case 'NEW_REVIEW':
        if (driverIds.length > 0) {
          userId = randomItem(driverIds);
          message = '새로운 리뷰가 작성되었습니다.';
        } else {
          continue;
        }
        break;
      case 'FAVORITE_ADDED':
        if (driverIds.length > 0) {
          userId = randomItem(driverIds);
          message = '찜하기 목록에 추가되었습니다.';
        } else {
          continue;
        }
        break;
      case 'SYSTEM_NOTICE':
        if (userIds.length > 0 && driverIds.length > 0) {
          userId = Math.random() < 0.5 ? randomItem(userIds) : randomItem(driverIds);
          message = '시스템 공지사항이 있습니다.';
        } else if (userIds.length > 0) {
          userId = randomItem(userIds);
          message = '시스템 공지사항이 있습니다.';
        } else if (driverIds.length > 0) {
          userId = randomItem(driverIds);
          message = '시스템 공지사항이 있습니다.';
        } else {
          continue;
        }
        break;
      case 'PROMOTION':
        if (userIds.length > 0 && driverIds.length > 0) {
          userId = Math.random() < 0.5 ? randomItem(userIds) : randomItem(driverIds);
          message = '새로운 프로모션이 진행 중입니다.';
        } else if (userIds.length > 0) {
          userId = randomItem(userIds);
          message = '새로운 프로모션이 진행 중입니다.';
        } else if (driverIds.length > 0) {
          userId = randomItem(driverIds);
          message = '새로운 프로모션이 진행 중입니다.';
        } else {
          continue;
        }
        break;
      default:
        if (userIds.length > 0 && driverIds.length > 0) {
          userId = Math.random() < 0.5 ? randomItem(userIds) : randomItem(driverIds);
          message = `${type} 알림입니다.`;
        } else if (userIds.length > 0) {
          userId = randomItem(userIds);
          message = `${type} 알림입니다.`;
        } else if (driverIds.length > 0) {
          userId = randomItem(driverIds);
          message = `${type} 알림입니다.`;
        } else {
          continue;
        }
    }

    // userId가 실제로 존재하는지 최종 확인
    if (!validUserIdsForNotification.has(userId) && !validDriverIdsForNotification.has(userId)) {
      logger.warn(`   ⚠️  Warning: userId ${userId} not found in valid IDs, skipping notification`);
      continue;
    }

    // 알림 생성 날짜: 2025년 랜덤
    const notificationCreatedAt = getRandomDate2025();
    const notificationUpdatedAt = getRandomDate2025After(notificationCreatedAt);

    // 읽음 상태: 최근 알림일수록 읽을 확률 높음 (시간 기반 가중치)
    // 최근 알림(7일 이내): 60% 읽음, 오래된 알림: 20% 읽음
    const daysAgo =
      (new Date('2025-12-31').getTime() - notificationCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
    const isRead = daysAgo <= 7 ? Math.random() < 0.6 : Math.random() < 0.2;

    // datajson에 실제 데이터 추가 (타입별로 다른 데이터)
    let datajson: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined = undefined;
    switch (type) {
      case 'ESTIMATE_RECEIVED':
        if (validEstimateRequestIds.length > 0 && driverIds.length > 0) {
          datajson = {
            estimateRequestId:
              validEstimateRequestIds[randomInt(0, validEstimateRequestIds.length - 1)],
            driverId: driverIds[randomInt(0, driverIds.length - 1)],
          };
        }
        break;
      case 'ESTIMATE_CONFIRMED':
        if (validEstimateRequestIds.length > 0 && estimateIds.length > 0) {
          datajson = {
            estimateRequestId:
              validEstimateRequestIds[randomInt(0, validEstimateRequestIds.length - 1)],
            estimateId: estimateIds[randomInt(0, estimateIds.length - 1)],
          };
        }
        break;
      case 'NEW_REVIEW':
        datajson = {
          reviewId: uuidv4(),
          rating: randomInt(1, 5),
        };
        break;
      case 'FAVORITE_ADDED':
        if (driverIds.length > 0) {
          datajson = {
            driverId: driverIds[randomInt(0, driverIds.length - 1)],
          };
        }
        break;
      case 'REQUEST_SENT':
        if (validEstimateRequestIds.length > 0) {
          datajson = {
            estimateRequestId:
              validEstimateRequestIds[randomInt(0, validEstimateRequestIds.length - 1)],
          };
        }
        break;
      case 'SYSTEM_NOTICE':
        datajson = {
          noticeId: uuidv4(),
          title: '시스템 점검 안내',
        };
        break;
      case 'PROMOTION':
        datajson = {
          promotionId: uuidv4(),
          title: '신규 회원 할인 이벤트',
        };
        break;
      default:
        datajson = Prisma.JsonNull;
    }

    notifications.push({
      userId,
      type,
      message,
      datajson,
      isRead,
      isDelete: Math.random() < 0.05, // 5%는 삭제된 알림
      createdAt: notificationCreatedAt,
      updatedAt: notificationUpdatedAt,
    });
  }

  // Notification 배치 저장
  const notificationBatchSize = 1000; // 1,000개씩 배치 처리
  const totalNotificationBatches = Math.ceil(notifications.length / notificationBatchSize);
  let totalNotificationsCreated = 0;

  logger.info(
    `   Saving ${notifications.length} notifications in ${totalNotificationBatches} batches (${notificationBatchSize} notifications per batch)`,
  );

  for (let batchIndex = 0; batchIndex < totalNotificationBatches; batchIndex++) {
    const batchStart = batchIndex * notificationBatchSize;
    const batchEnd = Math.min(batchStart + notificationBatchSize, notifications.length);
    const batchNotifications = notifications.slice(batchStart, batchEnd);
    const batchNumber = batchIndex + 1;

    logger.info(
      `   [Notifications] Processing batch ${batchNumber}/${totalNotificationBatches}: notifications ${batchStart + 1}-${batchEnd} (${batchNotifications.length} notifications)`,
    );

    const batchStartTime = Date.now();
    await batchCreateMany(
      (args) => prisma.notification.createMany(args),
      batchNotifications,
      1000,
      `notifications (batch ${batchNumber})`,
    );
    const batchElapsed = Date.now() - batchStartTime;
    totalNotificationsCreated += batchNotifications.length;

    const progress = ((batchEnd / notifications.length) * 100).toFixed(1);
    logger.info(
      `   [Notifications] Batch ${batchNumber}/${totalNotificationBatches} completed: ` +
        `Created ${batchNotifications.length} notifications | ` +
        `Progress: ${batchEnd}/${notifications.length} (${progress}%) | ` +
        `Batch time: ${batchElapsed}ms | ` +
        `Total created: ${totalNotificationsCreated}`,
    );
  }

  logger.info(`✅ Created ${totalNotificationsCreated} notifications`);

  // History 테이블은 비워둠
  logger.info('📜 Skipping history creation (keeping table empty)');

  logger.info('🎉 Seeding finished successfully!');
  logger.info('📊 Summary:');
  logger.info(
    `   - Users: ${totalUsersCreated} (${userIds.length} users, ${driverIds.length} drivers)`,
  );
  logger.info(`   - User Profiles: ${totalUserProfilesCreated}`);
  logger.info(`   - Driver Profiles: ${totalDriverProfilesCreated}`);
  logger.info(`   - Estimate Requests: ${totalEstimateRequestsCreated}`);
  logger.info(`   - Estimates: ${totalEstimatesCreated}`);
  logger.info(`   - Addresses: ${totalAddressesCreated}`);
  logger.info(`   - Reviews: ${totalReviewsCreated}`);
  logger.info(`   - Favorite Drivers: ${totalFavoritesCreated}`);
  logger.info(`   - Notifications: ${totalNotificationsCreated}`);
  logger.info(`   - Histories: 0 (table kept empty)`);
  logger.info('🔗 Relationship Rules Applied:');
  logger.info('   ✓ Each user can have max 1 PENDING request');
  logger.info('   ✓ Each request can have max 5 estimates (general: 3, designated: +2)');
  logger.info('   ✓ Target: ~500,000 estimates');
  logger.info('   ✓ New requests can only be created after moving date of previous request');
  logger.info('   ✓ CONFIRMED requests: exactly 1 CONFIRMED estimate + others REJECTED');
  logger.info('   ✓ PENDING requests: mostly PENDING estimates (some REJECTED)');
  logger.info('   ✓ REJECTED requests: mostly REJECTED estimates (some PENDING)');
  logger.info('   ✓ CANCELLED requests: mostly CANCELLED estimates (some PENDING)');
  logger.info('   ✓ Designated requests include designatedDriverId');
  logger.info('   ✓ Each estimate can have only 1 review (unique constraint)');
  logger.info('✨ Enhanced test scenarios:');
  logger.info('   - Extended date range: -730 to +180 days (50만 건 견적 목표)');
  logger.info('   - More diverse estimate statuses and prices (서비스 타입별 가격 차별화)');
  logger.info(
    '   - Realistic review rating distribution (100% of confirmed estimates with rating and content)',
  );
  logger.info('   - Weighted notification types');
  logger.info('   - Expanded address pool (80+ locations)');
  logger.info('   - User profile images: random from 2 URLs');
  logger.info('   - Master user (user@master.com) with 300 diverse requests');
  logger.info('   - Master driver (driver@master.com) for driver feature testing');
  logger.info('   - Admin user (admin@master.com) for admin feature testing');
  logger.info('   - Deleted requests/estimates/notifications (5% each)');
  logger.info('   - Designated requests with actual designatedDriverId');
  logger.info('   - Notification datajson with actual data per type');
  logger.info('   - All confirmed estimates have reviews with rating and content (NULL 제거)');
  logger.info('   - History table kept empty');
  logger.info('   - All users have isEmailVerified: true');
  logger.info('   - Target: ~500,000 estimates with ~73,000 users');
  logger.info('   - More diverse user scenarios (0-10 past requests per user)');
  logger.info('   - 40% of users have PENDING requests');
  logger.info('   - All users have profiles (100% coverage)');
  logger.info('   - All addresses have lat/lng coordinates (NULL 제거)');
  logger.info('   - All driver profiles have office information (NULL 제거)');
  logger.info('   - All estimates have price and comment (NULL 제거)');
  logger.info('   - All reviews have rating and content (NULL 제거)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  })
  .catch(async (e) => {
    logger.error('Seeding failed', e);
    await prisma.$disconnect();
    process.exit(1);
  });

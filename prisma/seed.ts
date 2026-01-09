import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../src/config/prisma';
import { Prisma } from '../src/generated/client';
import type {
  RegionEnum,
  ServiceEnum,
  EstimateStatus,
  NotificationType,
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

  // User 생성 (30배 규모)
  // 일반 유저: 125 * 30 = 3750명
  // 기사님: 75 * 30 = 2250명
  // 마스터 유저: 1명
  // new-driver: 1명
  // 테스트 유저: 3 * 30 = 90명
  // 총: 6092명
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
    email: 'user@master.com',
    password: masterPassword,
    phone: '1000000000',
    refreshTokens: null,
    isDelete: false,
  });

  // 일반 유저 3750명 생성 (30배)
  for (let i = 0; i < 3750; i++) {
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
      phone: `10${String(randomInt(1000, 9999)).padStart(4, '0')}${String(randomInt(1000, 9999)).padStart(4, '0')}`,
      refreshTokens: null,
      isDelete: false,
    });
  }

  // 마스터 테스트 드라이버 생성 (드라이버 기능 테스트용)
  const masterDriverId = uuidv4();
  driverIds.push(masterDriverId);
  users.push({
    id: masterDriverId,
    providerId: null,
    provider: 'local',
    type: 'DRIVER',
    name: '마스터 드라이버',
    email: 'driver@master.com',
    password: masterPassword,
    phone: '1000000001',
    refreshTokens: null,
    isDelete: false,
  });

  // ADMIN 유저 생성 (관리자 기능 테스트용)
  const adminUserId = uuidv4();
  users.push({
    id: adminUserId,
    providerId: null,
    provider: 'local',
    type: 'ADMIN',
    name: '관리자',
    email: 'admin@master.com',
    password: masterPassword,
    phone: '1000000002',
    refreshTokens: null,
    isDelete: false,
  });

  // 기사님 2250명 생성 (30배)
  for (let i = 0; i < 2250; i++) {
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
      phone: `10${String(randomInt(1000, 9999)).padStart(4, '0')}${String(randomInt(1000, 9999)).padStart(4, '0')}`,
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

  // 추가 테스트 유저 90명 (다양한 시나리오 테스트용, 30배)
  for (let i = 0; i < 90; i++) {
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
      phone: `10${String(9000 + (i % 1000)).padStart(4, '0')}${String(Math.floor(i / 1000)).padStart(4, '0')}`,
      refreshTokens: null,
      isDelete: false,
    });
  }

  await prisma.user.createMany({ data: users, skipDuplicates: true });
  console.log(
    `✅ Created ${users.length} users (${userIds.length} users, ${driverIds.length} drivers, 1 admin)\n`,
  );

  // 생성된 유저 ID 확인 (외래 키 제약 조건 확인용)
  const createdUserIds = new Set(users.map((u) => u.id));
  const createdDriverIds = new Set(users.filter((u) => u.type === 'DRIVER').map((u) => u.id));

  // userIds와 driverIds가 실제 생성된 ID와 일치하는지 확인
  const invalidUserIds = userIds.filter((id) => !createdUserIds.has(id));
  const invalidDriverIds = driverIds.filter((id) => !createdDriverIds.has(id));

  if (invalidUserIds.length > 0) {
    console.warn(`⚠️  Warning: ${invalidUserIds.length} invalid userIds found`);
  }
  if (invalidDriverIds.length > 0) {
    console.warn(`⚠️  Warning: ${invalidDriverIds.length} invalid driverIds found`);
  }

  // UserProfile 생성 (일반 유저 중 80%만 프로필 생성, 마스터 유저는 프로필 있음)
  console.log('👤 Creating user profiles...');
  const usersWithProfileCount = Math.floor(userIds.length * 0.8);
  const usersWithProfile = [masterUserId, ...userIds.slice(1, usersWithProfileCount + 1)]; // 마스터 유저 포함
  const userProfiles: Prisma.UserProfileCreateManyInput[] = usersWithProfile.map((userId) => ({
    userId,
    imageUrl: randomItem(userImageUrls), // 두 URL 중 랜덤
    regions: randomItems(regions, randomInt(1, 5)),
    services: randomItems(services, randomInt(1, 3)),
  }));

  await prisma.userProfile.createMany({ data: userProfiles, skipDuplicates: true });
  console.log(`✅ Created ${userProfiles.length} user profiles\n`);

  // DriverProfile 생성 (기사님 2250명 전부 프로필 생성 + 마스터 드라이버 + new-driver)
  console.log('🚗 Creating driver profiles...');
  const driverProfiles: Prisma.DriverProfileCreateManyInput[] = driverIds.map((driverId, index) => {
    // 마스터 드라이버는 특별한 프로필 설정
    if (driverId === masterDriverId) {
      return {
        driverId,
        imageUrl: randomItem(driverImageUrls),
        career: 10,
        shortIntro: '마스터 드라이버입니다. 모든 기능을 테스트할 수 있습니다.',
        description: '드라이버 기능 테스트를 위한 마스터 계정입니다.',
        regions: ['서울', '경기', '인천'],
        services: ['SMALL_MOVING', 'HOME_MOVING', 'OFFICE_MOVING'],
      };
    }
    return {
      driverId,
      imageUrl: randomItem(driverImageUrls),
      career: randomInt(1, 30),
      shortIntro: randomItem(shortIntros),
      description: randomItem(descriptions),
      regions: randomItems(regions, randomInt(1, 8)),
      services: randomItems(services, randomInt(1, 3)),
    };
  });

  // new-driver 프로필 추가 (프로필 정보는 모두 있지만 아직 활동 없음)
  driverProfiles.push({
    driverId: newDriverId,
    imageUrl: randomItem(driverImageUrls),
    career: randomInt(5, 25),
    shortIntro: randomItem(shortIntros),
    description: randomItem(descriptions),
    regions: randomItems(regions, randomInt(2, 5)),
    services: randomItems(services, randomInt(1, 3)),
  });

  await prisma.driverProfile.createMany({ data: driverProfiles, skipDuplicates: true });
  console.log(`✅ Created ${driverProfiles.length} driver profiles\n`);

  // EstimateRequest 생성
  // 규칙:
  // 1. 유저당 진행 중인 요청(PENDING)은 최대 1개만 가능
  // 2. 이사일 이후에만 새로운 요청 가능 (과거 요청의 이사일이 지난 후에만 새 요청 생성)
  // 3. 활성 요청은 1개만 유지 가능
  console.log('📋 Creating estimate requests...');
  const estimateRequests: Prisma.EstimateRequestCreateManyInput[] = [];
  const estimateRequestIds: string[] = [];
  const userPendingRequestMap = new Map<string, boolean>(); // 유저별 PENDING 요청 존재 여부
  const userLastMovingDateMap = new Map<string, Date>(); // 유저별 마지막 이사일 추적

  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setDate(pastDate.getDate() - 365); // 1년 전까지 확장

  // 마스터 유저를 위한 다양한 상태의 견적 요청 생성 (테스트용)
  // 마스터 유저는 PENDING 1개 + 다른 상태들 여러 개 (다양한 시나리오 테스트)
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
    'REJECTED',
    'CONFIRMED',
    'REJECTED',
    'CANCELLED',
    'CONFIRMED',
    'REJECTED',
    'CONFIRMED',
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
    'REJECTED',
    'CONFIRMED',
    'REJECTED',
    'CANCELLED',
    'CONFIRMED',
    'REJECTED',
    'CONFIRMED',
    'CANCELLED',
    'CONFIRMED',
    'REJECTED',
    'CONFIRMED',
    'REJECTED',
    'CANCELLED',
    'CONFIRMED',
  ]; // 50개의 다양한 상태 요청

  let masterLastMovingDate = new Date(pastDate);
  for (let i = 0; i < masterRequestStatuses.length; i++) {
    const requestId = uuidv4();
    estimateRequestIds.push(requestId);
    const status = masterRequestStatuses[i];

    // PENDING인 경우 체크
    if (status === 'PENDING') {
      userPendingRequestMap.set(masterUserId, true);
      // PENDING은 미래 날짜
      const daysOffset = randomInt(1, 90);
      masterLastMovingDate = new Date(now);
      masterLastMovingDate.setDate(masterLastMovingDate.getDate() + daysOffset);
    } else {
      // 과거 요청들은 이사일 이후에만 생성 가능
      const daysOffset = randomInt(-365, -1);
      masterLastMovingDate = new Date(now);
      masterLastMovingDate.setDate(masterLastMovingDate.getDate() + daysOffset);
      // 마지막 이사일 이후로 설정
      if (userLastMovingDateMap.has(masterUserId)) {
        const lastDate = userLastMovingDateMap.get(masterUserId)!;
        if (masterLastMovingDate <= lastDate) {
          masterLastMovingDate = new Date(lastDate);
          masterLastMovingDate.setDate(masterLastMovingDate.getDate() + randomInt(1, 30));
        }
      }
      userLastMovingDateMap.set(masterUserId, masterLastMovingDate);
    }

    const isDesignated = i % 5 === 1; // 일부는 지정 요청
    const designatedDriverId = isDesignated ? randomItem(driverIds) : null;

    estimateRequests.push({
      id: requestId,
      userId: masterUserId,
      movingType: randomItem(services),
      movingDate: masterLastMovingDate,
      status,
      isDesignated,
      designatedDriverId,
      isDelete: i % 20 === 0, // 5%는 삭제된 요청
    });
  }

  // 나머지 유저들에 대한 견적 요청 생성
  // 각 유저당: PENDING 0~1개, CONFIRMED/REJECTED/CANCELLED 여러 개 가능
  // 이사일 이후에만 새로운 요청 가능
  const availableUsers = [...userIds.filter((id) => id !== masterUserId)]; // 마스터 유저 제외한 유저들
  const userRequestCount = new Map<string, number>(); // 유저별 요청 수 추적

  // 각 유저당 0~5개의 과거 요청 생성 (PENDING 제외)
  for (const userId of availableUsers) {
    const requestCount = randomInt(0, 5); // 유저당 0~5개의 과거 요청
    userRequestCount.set(userId, requestCount);

    let lastMovingDate = new Date(pastDate);
    for (let i = 0; i < requestCount; i++) {
      const requestId = uuidv4();
      estimateRequestIds.push(requestId);

      // 과거 날짜로 설정, 이전 이사일 이후로
      const daysOffset = randomInt(-365, -1);
      const movingDate = new Date(now);
      movingDate.setDate(movingDate.getDate() + daysOffset);

      // 마지막 이사일 이후로 설정
      if (movingDate <= lastMovingDate) {
        movingDate.setTime(lastMovingDate.getTime() + randomInt(1, 30) * 24 * 60 * 60 * 1000);
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

      estimateRequests.push({
        id: requestId,
        userId,
        movingType: randomItem(services),
        movingDate,
        status,
        isDesignated,
        designatedDriverId,
        isDelete: Math.random() < 0.05, // 5%는 삭제된 요청
      });
    }
  }

  // 일부 유저들에게 PENDING 요청 1개씩 추가 (진행 중인 요청)
  // 이사일 이후에만 새로운 요청 가능하므로, 마지막 이사일 이후로 설정
  const usersWithPendingRequest = randomItems(
    availableUsers,
    Math.min(Math.floor(availableUsers.length * 0.3), availableUsers.length), // 30%의 유저만 PENDING 요청
  );

  for (const userId of usersWithPendingRequest) {
    if (userPendingRequestMap.has(userId)) continue; // 이미 PENDING 요청이 있으면 스킵

    const requestId = uuidv4();
    estimateRequestIds.push(requestId);
    userPendingRequestMap.set(userId, true);

    // 마지막 이사일 이후로 설정 (이사일 이후에만 새로운 요청 가능)
    let movingDate = new Date(now);
    movingDate.setDate(movingDate.getDate() + randomInt(1, 90)); // 미래 날짜

    if (userLastMovingDateMap.has(userId)) {
      const lastDate = userLastMovingDateMap.get(userId)!;
      // 마지막 이사일이 미래인 경우, 그 이후로 설정
      if (lastDate > now) {
        movingDate = new Date(lastDate);
        movingDate.setDate(movingDate.getDate() + randomInt(1, 30));
      } else {
        // 마지막 이사일이 과거인 경우, 현재 이후로 설정
        movingDate = new Date(now);
        movingDate.setDate(movingDate.getDate() + randomInt(1, 90));
      }
    }

    const isDesignated = Math.random() < 0.2;
    const designatedDriverId = isDesignated ? randomItem(driverIds) : null;

    estimateRequests.push({
      id: requestId,
      userId,
      movingType: randomItem(services),
      movingDate,
      status: 'PENDING',
      isDesignated,
      designatedDriverId,
      isDelete: false, // PENDING 요청은 삭제하지 않음
    });
  }

  await prisma.estimateRequest.createMany({ data: estimateRequests, skipDuplicates: true });
  console.log(`✅ Created ${estimateRequests.length} estimate requests\n`);

  // Address 생성 (각 요청당 FROM, TO 주소)
  console.log('📍 Creating addresses...');
  const addressesData: Prisma.AddressCreateManyInput[] = [];

  for (const requestId of estimateRequestIds) {
    const fromAddr = randomItem(addresses);
    let toAddr = randomItem(addresses);
    // FROM과 TO가 같지 않도록
    while (toAddr.zoneCode === fromAddr.zoneCode) {
      toAddr = randomItem(addresses);
    }

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

  // Estimate 생성
  // 규칙:
  // 1. 한 견적 요청에 최대 8개의 견적
  // 2. 일반 요청: 최대 5개, 지정 요청: 추가 3개 가능 (총 8개)
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

    // 지정 요청인 경우 최대 8개 (일반 5개 + 지정 추가 3개), 일반 요청인 경우 최대 5개
    const maxEstimates = request.isDesignated ? 8 : 5;
    const estimateCount = randomInt(1, maxEstimates);
    requestEstimateCount.set(requestId, estimateCount);

    // 지정 요청인 경우 지정된 기사님을 포함
    let selectedDrivers: string[] = [];
    if (request.isDesignated && request.designatedDriverId) {
      // 지정된 기사님을 첫 번째로 포함
      selectedDrivers = [request.designatedDriverId as string];
      // 나머지 기사님 선택 (지정된 기사님 제외)
      const otherDrivers = driverIds.filter((id) => id !== request.designatedDriverId);
      const additionalDrivers = randomItems(
        otherDrivers,
        Math.min(estimateCount - 1, otherDrivers.length),
      );
      selectedDrivers = [...selectedDrivers, ...additionalDrivers];
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

      // 가격 범위 (더 다양한 가격대)
      const priceRange = randomInt(300000, 5000000);

      // 모든 상태에서 comment 생성
      const comment = randomItem(estimateComments[status]);

      estimates.push({
        id: estimateId,
        estimateRequestId: requestId,
        driverId,
        price: status !== 'REJECTED' && status !== 'CANCELLED' ? priceRange : null,
        comment,
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
      });
    }
  }

  await prisma.estimate.createMany({ data: estimates, skipDuplicates: true });
  console.log(`✅ Created ${estimates.length} estimates\n`);

  // Review 생성 (확정된 견적에 충분한 리뷰 작성 - 다양한 점수 분포)
  console.log('⭐ Creating reviews...');
  const reviews: Prisma.ReviewCreateManyInput[] = [];
  const reviewedEstimateIds = new Set<string>(); // 리뷰가 작성된 견적 ID 추적 (unique 제약)

  // CONFIRMED 상태이고 삭제되지 않은 견적 찾기
  const confirmedEstimates = estimates.filter((est) => est.status === 'CONFIRMED' && !est.isDelete);
  console.log(`   Found ${confirmedEstimates.length} CONFIRMED estimates`);

  for (const estimate of confirmedEstimates) {
    // 이미 리뷰가 있는 견적은 스킵 (unique 제약)
    if (reviewedEstimateIds.has(estimate.id!)) continue;

    const request = requestMap.get(estimate.estimateRequestId);
    if (!request) continue;

    const movingDate = new Date(request.movingDate as Date);
    const daysSinceMoving = (now.getTime() - movingDate.getTime()) / (1000 * 60 * 60 * 24);

    // 리뷰 작성 조건:
    // 1. 이사일이 지난 경우 (과거 180일 이내) - 85% 확률로 리뷰 작성 (일부는 리뷰 없음)
    // 2. 이사일이 미래인 경우 - 25% 확률로 리뷰 작성 (사전 리뷰)
    // 3. 너무 오래된 경우 (180일 이상) - 20% 확률로 리뷰 작성
    let shouldCreateReview = false;
    if (movingDate <= now && daysSinceMoving <= 180) {
      // 과거 180일 이내: 85% 확률 (15%는 리뷰 없음)
      shouldCreateReview = Math.random() < 0.85;
    } else if (movingDate > now) {
      // 미래: 25% 확률 (사전 리뷰)
      shouldCreateReview = Math.random() < 0.25;
    } else {
      // 180일 이상 지난 경우: 20% 확률
      shouldCreateReview = Math.random() < 0.2;
    }

    if (!shouldCreateReview) continue;

    // Review 내용 작성 여부 (추가)
    const shouldWriteReviewBody = Math.random() < 0.7; // 70%는 실제 리뷰 작성, 30% 리뷰 미작성(견적 생성 시 테이블만 존재하는 경우)

    let rating: number | undefined;
    let content: string | undefined;

    if (shouldWriteReviewBody) {
      // 점수 분포: 5점 50%, 4점 30%, 3점 15%, 2점 4%, 1점 1% (더 현실적인 분포)
      const ratingRand = Math.random();
      if (ratingRand < 0.5) rating = 5;
      else if (ratingRand < 0.8) rating = 4;
      else if (ratingRand < 0.95) rating = 3;
      else if (ratingRand < 0.99) rating = 2;
      else rating = 1;

      // 낮은 점수일 경우 더 구체적인 리뷰 내용
      content =
        rating <= 2
          ? randomItem([
              '시간 약속을 지키지 않았습니다.',
              '가구 보호가 제대로 되지 않았습니다.',
              '서비스가 기대에 못 미쳤습니다.',
              '가격 대비 서비스가 아쉬웠습니다.',
            ])
          : randomItem(reviewContents);
    }

    reviewedEstimateIds.add(estimate.id!);
    reviews.push({
      estimateId: estimate.id!,
      userId: request.userId as string,
      ...(shouldWriteReviewBody && {
        rating,
        content,
      }),
    });
  }

  await prisma.review.createMany({ data: reviews, skipDuplicates: true });
  console.log(`✅ Created ${reviews.length} reviews\n`);

  // FavoriteDriver 생성 (랜덤하게 - 일부 기사님은 좋아요를 받지 못함)
  console.log('❤️  Creating favorite drivers...');
  const favorites: Prisma.FavoriteDriverCreateManyInput[] = [];
  const favoritePairs = new Map<string, { userId: string; driverId: string }>(); // Map으로 userId와 driverId를 함께 저장
  const driverFavoriteCount = new Map<string, number>(); // 각 기사님이 받은 좋아요 수 추적

  // 실제 생성된 유저/기사 ID 확인 (외래 키 제약 조건 확인용)
  const validUserIds = new Set(userIds.filter((id) => createdUserIds.has(id)));
  const validDriverIds = new Set(driverIds.filter((id) => createdDriverIds.has(id)));

  // 기사님별 좋아요 수 초기화
  validDriverIds.forEach((driverId) => {
    driverFavoriteCount.set(driverId, 0);
  });

  // 6000개의 좋아요 생성 (30배 규모, 랜덤하게 분배, 일부 기사님은 많이 받고 일부는 적게)
  for (let i = 0; i < 6000; i++) {
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

  // Notification 생성 (7500개 - 30배 규모, 다양한 타입, 더 현실적인 분포)
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

  for (let i = 0; i < 7500; i++) {
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
    // 최근 알림(7일 이내): 60% 읽음, 오래된 알림: 20% 읽음
    const daysAgo = randomInt(0, 90);
    const isRead = daysAgo <= 7 ? Math.random() < 0.6 : Math.random() < 0.2;

    // datajson에 실제 데이터 추가 (타입별로 다른 데이터)
    let datajson: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined = undefined;
    switch (type) {
      case 'ESTIMATE_RECEIVED':
        datajson = {
          estimateRequestId: estimateRequestIds[randomInt(0, estimateRequestIds.length - 1)],
          driverId: driverIds[randomInt(0, driverIds.length - 1)],
        };
        break;
      case 'ESTIMATE_CONFIRMED':
        datajson = {
          estimateRequestId: estimateRequestIds[randomInt(0, estimateRequestIds.length - 1)],
          estimateId: estimateIds[randomInt(0, estimateIds.length - 1)],
        };
        break;
      case 'NEW_REVIEW':
        datajson = {
          reviewId: uuidv4(),
          rating: randomInt(1, 5),
        };
        break;
      case 'FAVORITE_ADDED':
        datajson = {
          driverId: driverIds[randomInt(0, driverIds.length - 1)],
        };
        break;
      case 'REQUEST_SENT':
        datajson = {
          estimateRequestId: estimateRequestIds[randomInt(0, estimateRequestIds.length - 1)],
        };
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
    });
  }

  await prisma.notification.createMany({ data: notifications, skipDuplicates: true });
  console.log(`✅ Created ${notifications.length} notifications\n`);

  // History 테이블은 비워둠
  console.log('📜 Skipping history creation (keeping table empty)\n');

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
  console.log(`   - Histories: 0 (table kept empty)`);
  console.log('\n🔗 Relationship Rules Applied:');
  console.log('   ✓ Each user can have max 1 PENDING request');
  console.log('   ✓ Each request can have max 8 estimates (general: 5, designated: +3)');
  console.log('   ✓ New requests can only be created after moving date of previous request');
  console.log('   ✓ CONFIRMED requests: exactly 1 CONFIRMED estimate + others REJECTED');
  console.log('   ✓ PENDING requests: mostly PENDING estimates (some REJECTED)');
  console.log('   ✓ REJECTED requests: mostly REJECTED estimates (some PENDING)');
  console.log('   ✓ CANCELLED requests: mostly CANCELLED estimates (some PENDING)');
  console.log('   ✓ Designated requests include designatedDriverId');
  console.log('   ✓ Each estimate can have only 1 review (unique constraint)');
  console.log('\n✨ Enhanced test scenarios:');
  console.log('   - Extended date range: -365 to +90 days');
  console.log('   - More diverse estimate statuses and prices');
  console.log('   - Realistic review rating distribution (85% of confirmed estimates)');
  console.log('   - Weighted notification types');
  console.log('   - Expanded address pool (60+ locations)');
  console.log('   - User profile images: random from 2 URLs');
  console.log('   - Master user (user@master.com) with 50+ diverse requests');
  console.log('   - Master driver (driver@master.com) for driver feature testing');
  console.log('   - Admin user (admin@master.com) for admin feature testing');
  console.log('   - Deleted requests/estimates/notifications (5% each)');
  console.log('   - Designated requests with actual designatedDriverId');
  console.log('   - Notification datajson with actual data per type');
  console.log('   - Some confirmed estimates without reviews (15%)');
  console.log('   - History table kept empty');
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

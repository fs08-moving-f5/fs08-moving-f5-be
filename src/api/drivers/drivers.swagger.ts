/**
 * @swagger
 * components:
 *   schemas:
 *     DriverProfileInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 드라이버 프로필 ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         imageUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: 프로필 이미지 URL
 *           example: "https://example.com/image.jpg"
 *         shortIntro:
 *           type: string
 *           nullable: true
 *           description: 짧은 소개
 *           example: "안전하고 신속한 이사를 약속드립니다"
 *         description:
 *           type: string
 *           nullable: true
 *           description: 상세 설명
 *           example: "10년 이상의 경력을 가진 전문 이사 기사입니다. 고객 만족을 최우선으로 생각합니다."
 *         regions:
 *           type: array
 *           items:
 *             type: string
 *             enum: [서울, 경기, 인천, 강원, 충북, 충남, 대전, 세종, 전북, 전남, 광주, 경북, 경남, 대구, 부산, 울산, 제주]
 *           description: 가능 지역 목록
 *           example: ["서울", "경기", "인천"]
 *         services:
 *           type: array
 *           items:
 *             type: string
 *             enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *           description: 제공 서비스 목록
 *           example: ["HOME_MOVING", "OFFICE_MOVING"]
 *         officeAddress:
 *           type: string
 *           nullable: true
 *           description: 사무실 주소
 *           example: "서울특별시 강남구 테헤란로 123"
 *         officeLat:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: 사무실 위도
 *           example: 37.5665
 *         officeLng:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: 사무실 경도
 *           example: 126.9780
 *         officeUpdatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 사무실 정보 업데이트 일시
 *           example: "2024-01-15T10:30:00Z"
 *
 *     DriverListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 드라이버(기사) ID
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *         name:
 *           type: string
 *           description: 드라이버 이름
 *           example: "홍길동"
 *         driverProfile:
 *           oneOf:
 *             - $ref: '#/components/schemas/DriverProfileInfo'
 *             - type: "null"
 *           description: 드라이버 프로필 정보 (프로필이 없는 경우 null)
 *         career:
 *           type: integer
 *           nullable: true
 *           description: 드라이버 경력 (년)
 *           example: 10
 *         favoriteDriverCount:
 *           type: integer
 *           description: 해당 드라이버를 찜한 사용자 수
 *           example: 45
 *         confirmedEstimateCount:
 *           type: integer
 *           description: 확정된 견적 수 (작업 진행 건수)
 *           example: 150
 *         averageRating:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: 리뷰 평균 평점 (소수점 첫째 자리까지, 리뷰가 없으면 null)
 *           example: 4.5
 *         reviewCount:
 *           type: integer
 *           description: 리뷰 총 개수
 *           example: 120
 *         isFavorite:
 *           type: boolean
 *           description: 현재 사용자가 해당 드라이버를 찜했는지 여부 (로그인하지 않은 경우 false)
 *           example: true
 *
 *     PaginationInfo:
 *       type: object
 *       properties:
 *         hasNext:
 *           type: boolean
 *           description: 다음 페이지 존재 여부
 *           example: true
 *         nextCursor:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: 다음 페이지 조회를 위한 커서 (다음 페이지가 없으면 null)
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: 요청 성공 여부
 *           example: true
 *         data:
 *           description: 응답 데이터
 *         pagination:
 *           description: 페이지네이션 정보
 *         message:
 *           type: string
 *           nullable: true
 *           description: 응답 메시지
 *
 *     UpdateDriverOfficeRequest:
 *       type: object
 *       required:
 *         - officeAddress
 *       properties:
 *         officeAddress:
 *           type: string
 *           minLength: 1
 *           description: 사무실 주소 (필수)
 *           example: "서울특별시 용산구 한강대로 405"
 *         officeZoneCode:
 *           type: string
 *           nullable: true
 *           description: 우편번호 (선택)
 *           example: "04321"
 *         officeSido:
 *           type: string
 *           nullable: true
 *           description: 시도 (선택)
 *           example: "서울특별시"
 *         officeSigungu:
 *           type: string
 *           nullable: true
 *           description: 시군구 (선택)
 *           example: "용산구"
 *
 *     UpdateDriverOfficeResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 드라이버 프로필 ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         officeAddress:
 *           type: string
 *           nullable: true
 *           description: 사무실 주소
 *           example: "서울특별시 용산구 한강대로 405"
 *         officeZoneCode:
 *           type: string
 *           nullable: true
 *           description: 우편번호
 *           example: "04321"
 *         officeSido:
 *           type: string
 *           nullable: true
 *           description: 시도
 *           example: "서울특별시"
 *         officeSigungu:
 *           type: string
 *           nullable: true
 *           description: 시군구
 *           example: "용산구"
 *         officeLat:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: 사무실 위도 (주소 변환 결과)
 *           example: 37.5548375992165
 *         officeLng:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: 사무실 경도 (주소 변환 결과)
 *           example: 126.971732581232
 *         officeUpdatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 사무실 정보 업데이트 일시
 *           example: "2026-01-12T07:37:17.260Z"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: 에러 메시지 (한국어로 제공되며, 필드명과 함께 표시될 수 있음)
 *           example: "officeAddress: 사무실 주소는 필수입니다"
 *         statusCode:
 *           type: integer
 *           description: HTTP 상태 코드
 *           example: 400
 *         name:
 *           type: string
 *           description: 에러 이름
 *           example: "AppError"
 *         stack:
 *           type: string
 *           nullable: true
 *           description: 에러 스택 트레이스 (개발 환경에서만 제공)
 *
 *   parameters:
 *     regionQuery:
 *       in: query
 *       name: region
 *       required: false
 *       schema:
 *         type: string
 *         enum: [seoul, gyeonggi, incheon, gangwon, chungbuk, chungnam, daejeon, sejong, jeonbuk, jeonnam, gwangju, gyeongbuk, gyeongnam, daegu, busan, ulsan, jeju]
 *       description: |
 *         지역 필터 (소문자로 입력)
 *         가능한 값: seoul(서울), gyeonggi(경기), incheon(인천), gangwon(강원), chungbuk(충북), chungnam(충남), daejeon(대전), sejong(세종), jeonbuk(전북), jeonnam(전남), gwangju(광주), gyeongbuk(경북), gyeongnam(경남), daegu(대구), busan(부산), ulsan(울산), jeju(제주)
 *         해당 지역에서 서비스를 제공하는 드라이버만 조회됩니다.
 *       example: "seoul"
 *
 *     serviceQuery:
 *       in: query
 *       name: service
 *       required: false
 *       schema:
 *         type: string
 *         enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *       description: |
 *         서비스 필터
 *         가능한 값: SMALL_MOVING(소형 이사), HOME_MOVING(가정 이사), OFFICE_MOVING(사무실 이사)
 *         해당 서비스를 제공하는 드라이버만 조회됩니다.
 *       example: "HOME_MOVING"
 *
 *     sortQuery:
 *       in: query
 *       name: sort
 *       required: false
 *       schema:
 *         type: string
 *         enum: [review, rating, career, confirmed-estimate]
 *       description: |
 *         정렬 기준
 *         - review: 리뷰 수 내림차순
 *         - rating: 평균 평점 내림차순
 *         - career: 경력 내림차순
 *         - confirmed-estimate: 확정된 견적 수 내림차순
 *         기본값: 정렬 없음 (등록 순서)
 *       example: "rating"
 *
 *     cursorQuery:
 *       in: query
 *       name: cursor
 *       required: false
 *       schema:
 *         type: string
 *         format: uuid
 *       description: |
 *         페이지네이션 커서 (다음 페이지 조회 시 사용)
 *         이전 응답의 pagination.nextCursor 값을 사용하여 다음 페이지를 조회할 수 있습니다.
 *         첫 페이지 조회 시에는 생략 가능합니다.
 *       example: "123e4567-e89b-12d3-a456-426614174000"
 *
 *     limitQuery:
 *       in: query
 *       name: limit
 *       required: false
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 15
 *       description: |
 *         조회할 항목 수 (기본값: 15)
 *         한 번에 가져올 드라이버의 개수를 지정합니다.
 *         최소값은 1이며, 생략 시 기본값 15가 적용됩니다.
 *       example: 15
 *
 *     searchQuery:
 *       in: query
 *       name: search
 *       required: false
 *       schema:
 *         type: string
 *       description: |
 *         기사님 이름 검색
 *         기사님 이름에 포함된 문자열로 검색합니다. 대소문자 구분 없이 검색됩니다.
 *       example: "홍길동"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT 토큰 인증 (선택사항 - 로그인하지 않아도 조회 가능하지만, isFavorite 필드는 false로 반환됨)
 *
 * tags:
 *   - name: Drivers
 *     description: 드라이버(기사) 목록 조회, 사무실 정보 관리 및 주변 견적 요청 조회 API
 */

/**
 * @swagger
 * /api/drivers:
 *   get:
 *     tags:
 *       - Drivers
 *     summary: 드라이버(기사) 목록 조회
 *     description: |
 *       등록된 드라이버(기사) 목록을 조회합니다.
 *       지역, 서비스 유형으로 필터링하고, 기사님 이름으로 검색할 수 있으며, 리뷰 수, 평균 평점, 경력, 확정된 견적 수로 정렬할 수 있습니다.
 *       커서 기반 페이지네이션을 지원하며, 각 드라이버 정보에는 프로필, 경력, 찜하기 수, 확정된 견적 수, 리뷰 평균 평점, 리뷰 총 개수가 포함됩니다.
 *
 *       **쿼리 파라미터:**
 *       - `region` (선택): 지역 필터. 소문자로 입력 (예: seoul, gyeonggi)
 *       - `service` (선택): 서비스 필터 (SMALL_MOVING, HOME_MOVING, OFFICE_MOVING)
 *       - `sort` (선택): 정렬 기준 (review, rating, career, confirmed-estimate)
 *       - `search` (선택): 기사님 이름 검색. 이름에 포함된 문자열로 검색합니다.
 *       - `cursor` (선택): 다음 페이지 조회를 위한 커서 값. 이전 응답의 `pagination.nextCursor` 값을 사용합니다.
 *       - `limit` (선택): 조회할 항목 수. 기본값은 15입니다.
 *
 *       **사용 예시:**
 *       - 전체 드라이버 조회: `GET /api/drivers?limit=15`
 *       - 서울 지역 필터: `GET /api/drivers?region=seoul&limit=15`
 *       - 가정 이사 서비스 필터: `GET /api/drivers?service=HOME_MOVING&limit=15`
 *       - 평균 평점 정렬: `GET /api/drivers?sort=rating&limit=15`
 *       - 이름 검색: `GET /api/drivers?search=홍길동&limit=15`
 *       - 복합 필터 및 정렬: `GET /api/drivers?region=seoul&service=HOME_MOVING&sort=rating&limit=15`
 *       - 검색과 필터 조합: `GET /api/drivers?region=seoul&search=홍길동&limit=15`
 *       - 다음 페이지: `GET /api/drivers?cursor=123e4567-e89b-12d3-a456-426614174000&limit=15`
 *
 *       **참고사항:**
 *       - 로그인하지 않은 사용자도 조회 가능하지만, `isFavorite` 필드는 항상 `false`로 반환됩니다.
 *       - 로그인한 사용자의 경우, 자신이 찜한 드라이버는 `isFavorite: true`로 표시됩니다.
 *       - 필터 조건에 맞는 드라이버가 없으면 빈 배열이 반환됩니다.
 *     operationId: getDrivers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/regionQuery'
 *       - $ref: '#/components/parameters/serviceQuery'
 *       - $ref: '#/components/parameters/sortQuery'
 *       - $ref: '#/components/parameters/searchQuery'
 *       - $ref: '#/components/parameters/cursorQuery'
 *       - $ref: '#/components/parameters/limitQuery'
 *     responses:
 *       '200':
 *         description: 성공적으로 드라이버 목록을 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 요청 성공 여부
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DriverListItem'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *                 message:
 *                   type: string
 *                   nullable: true
 *                   description: 응답 메시지
 *             examples:
 *               success:
 *                 summary: 성공 응답 예시 (로그인한 사용자)
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "123e4567-e89b-12d3-a456-426614174001"
 *                       name: "홍길동"
 *                       driverProfile:
 *                         id: "123e4567-e89b-12d3-a456-426614174000"
 *                         imageUrl: "https://example.com/image.jpg"
 *                         shortIntro: "안전하고 신속한 이사를 약속드립니다"
 *                         description: "10년 이상의 경력을 가진 전문 이사 기사입니다."
 *                         regions: ["서울", "경기", "인천"]
 *                         services: ["HOME_MOVING", "OFFICE_MOVING"]
 *                       career: 10
 *                       favoriteDriverCount: 45
 *                       confirmedEstimateCount: 150
 *                       averageRating: 4.5
 *                       reviewCount: 120
 *                       isFavorite: true
 *                     - id: "123e4567-e89b-12d3-a456-426614174002"
 *                       name: "김철수"
 *                       driverProfile:
 *                         id: "123e4567-e89b-12d3-a456-426614174003"
 *                         imageUrl: "https://example.com/image2.jpg"
 *                         shortIntro: "경험 많은 전문가가 책임지고 진행합니다"
 *                         description: "15년 경력의 베테랑 이사 기사입니다."
 *                         regions: ["서울", "경기"]
 *                         services: ["HOME_MOVING"]
 *                       career: 15
 *                       favoriteDriverCount: 60
 *                       confirmedEstimateCount: 200
 *                       averageRating: 4.8
 *                       reviewCount: 180
 *                       isFavorite: false
 *                   pagination:
 *                     hasNext: true
 *                     nextCursor: "123e4567-e89b-12d3-a456-426614174002"
 *               empty:
 *                 summary: 조회 결과가 없는 경우
 *                 value:
 *                   success: true
 *                   data: []
 *                   pagination:
 *                     hasNext: false
 *                     nextCursor: null
 *               noProfile:
 *                 summary: 프로필이 없는 드라이버가 포함된 경우
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "123e4567-e89b-12d3-a456-426614174001"
 *                       name: "홍길동"
 *                       driverProfile: null
 *                       career: null
 *                       favoriteDriverCount: 0
 *                       confirmedEstimateCount: 0
 *                       averageRating: null
 *                       reviewCount: 0
 *                       isFavorite: false
 *                   pagination:
 *                     hasNext: false
 *                     nextCursor: null
 *               lastPage:
 *                 summary: 마지막 페이지인 경우
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "123e4567-e89b-12d3-a456-426614174001"
 *                       name: "홍길동"
 *                       driverProfile:
 *                         id: "123e4567-e89b-12d3-a456-426614174000"
 *                         imageUrl: "https://example.com/image.jpg"
 *                         shortIntro: "안전하고 신속한 이사를 약속드립니다"
 *                         description: "10년 이상의 경력을 가진 전문 이사 기사입니다."
 *                         regions: ["서울", "경기"]
 *                         services: ["HOME_MOVING"]
 *                       career: 10
 *                       favoriteDriverCount: 45
 *                       confirmedEstimateCount: 150
 *                       averageRating: 4.5
 *                       reviewCount: 120
 *                       isFavorite: true
 *                   pagination:
 *                     hasNext: false
 *                     nextCursor: null
 *       '400':
 *         description: 잘못된 요청입니다. 쿼리 파라미터 값이 유효하지 않습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidRegion:
 *                 summary: 잘못된 region 값
 *                 value:
 *                   message: "region: 유효하지 않은 지역입니다. 유효한 지역 중 하나를 선택해주세요."
 *                   statusCode: 400
 *                   name: "AppError"
 *               invalidSort:
 *                 summary: 잘못된 sort 값
 *                 value:
 *                   message: "sort: 유효하지 않은 정렬 기준입니다. 유효한 정렬 기준 중 하나를 선택해주세요."
 *                   statusCode: 400
 *                   name: "AppError"
 *               invalidLimit:
 *                 summary: 잘못된 limit 값
 *                 value:
 *                   message: "limit: Number must be greater than or equal to 1"
 *                   statusCode: 400
 *                   name: "AppError"
 *               invalidCursor:
 *                 summary: 잘못된 cursor 값
 *                 value:
 *                   message: "cursor: 유효하지 않은 커서입니다. 유효한 커서를 선택해주세요."
 *                   statusCode: 400
 *                   name: "AppError"
 *       '500':
 *         description: 서버 내부 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 summary: 서버 오류 예시
 *                 value:
 *                   message: "서버 내부 오류가 발생했습니다."
 *                   name: "InternalServerError"
 */

/**
 * @swagger
 * /api/drivers/me/office:
 *   patch:
 *     tags:
 *       - Drivers
 *     summary: 내 사무실 정보 업데이트
 *     description: |
 *       현재 로그인한 드라이버(기사)의 사무실 정보를 업데이트합니다.
 *       주소를 입력하면 자동으로 위도/경도로 변환되어 저장됩니다.
 *
 *       **요청 본문:**
 *       - `officeAddress` (필수): 사무실 주소
 *       - `officeZoneCode` (선택): 우편번호
 *       - `officeSido` (선택): 시도
 *       - `officeSigungu` (선택): 시군구
 *
 *       **응답:**
 *       - 업데이트된 사무실 정보가 반환됩니다.
 *       - `officeLat`, `officeLng`는 주소를 자동으로 변환한 결과입니다.
 *       - `officeUpdatedAt`은 업데이트 일시입니다.
 *
 *       **에러 처리:**
 *       - 주소가 없거나 빈 문자열인 경우: 400 Bad Request
 *       - 주소 변환(geocoding) 실패 시: 500 Internal Server Error
 *       - 인증되지 않은 사용자: 401 Unauthorized
 *       - 드라이버가 아닌 사용자: 403 Forbidden
 *     operationId: updateDriverOffice
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDriverOfficeRequest'
 *           examples:
 *             basic:
 *               summary: 기본 예시
 *               value:
 *                 officeAddress: "서울특별시 용산구 한강대로 405"
 *             withDetails:
 *               summary: 상세 정보 포함
 *               value:
 *                 officeAddress: "서울특별시 용산구 한강대로 405"
 *                 officeZoneCode: "04321"
 *                 officeSido: "서울특별시"
 *                 officeSigungu: "용산구"
 *     responses:
 *       '200':
 *         description: 사무실 정보가 성공적으로 업데이트되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 요청 성공 여부
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UpdateDriverOfficeResponse'
 *             examples:
 *               success:
 *                 summary: 성공 응답 예시
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "123e4567-e89b-12d3-a456-426614174000"
 *                     officeAddress: "서울특별시 용산구 한강대로 405"
 *                     officeZoneCode: "04321"
 *                     officeSido: "서울특별시"
 *                     officeSigungu: "용산구"
 *                     officeLat: 37.5548375992165
 *                     officeLng: 126.971732581232
 *                     officeUpdatedAt: "2026-01-12T07:37:17.260Z"
 *       '400':
 *         description: 잘못된 요청입니다. 요청 본문이 유효하지 않습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingAddress:
 *                 summary: 주소 누락
 *                 value:
 *                   message: "officeAddress: 사무실 주소는 필수입니다"
 *                   statusCode: 400
 *                   name: "AppError"
 *               emptyAddress:
 *                 summary: 빈 주소
 *                 value:
 *                   message: "officeAddress: 사무실 주소는 필수입니다"
 *                   statusCode: 400
 *                   name: "AppError"
 *               invalidBody:
 *                 summary: 잘못된 요청 본문
 *                 value:
 *                   message: "필수 데이터가 누락되었습니다"
 *                   statusCode: 400
 *                   name: "AppError"
 *       '401':
 *         description: 인증이 필요합니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 summary: 인증되지 않은 사용자
 *                 value:
 *                   message: "인증이 필요합니다"
 *                   statusCode: 401
 *                   name: "AppError"
 *       '403':
 *         description: 드라이버 권한이 필요합니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 summary: 드라이버가 아닌 사용자
 *                 value:
 *                   message: "드라이버 권한이 필요합니다"
 *                   statusCode: 403
 *                   name: "AppError"
 *       '500':
 *         description: 서버 내부 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               geocodingFailed:
 *                 summary: 주소 변환 실패
 *                 value:
 *                   message: "주소 변환에 실패했습니다"
 *                   statusCode: 500
 *                   name: "AppError"
 *               serverError:
 *                 summary: 서버 오류
 *                 value:
 *                   message: "서버 내부 오류가 발생했습니다"
 *                   statusCode: 500
 *                   name: "AppError"
 */

/**
 * @swagger
 * /api/drivers/me/requests/nearby:
 *   get:
 *     tags:
 *       - Drivers
 *     summary: 내 사무실 주변 견적 요청 조회
 *     description: |
 *       현재 로그인한 드라이버(기사)의 사무실 위치를 기준으로 반경 내의 견적 요청을 조회합니다.
 *       거리순으로 정렬되어 반환되며, 각 견적 요청에는 출발지 주소, 이사 유형, 이사 예정일, 거리 정보가 포함됩니다.
 *
 *       **동작 방식:**
 *       1. 드라이버의 사무실 위치(위도/경도)를 조회합니다.
 *       2. 지정된 반경(radiusKm) 내의 견적 요청 출발지를 검색합니다.
 *       3. 실제 거리를 계산하여 반경 내의 요청만 필터링합니다.
 *       4. 거리순으로 정렬하여 반환합니다.
 *
 *       **쿼리 파라미터:**
 *       - `radiusKm` (선택): 검색 반경 (킬로미터). 기본값은 20km이며, 최소 0km, 최대 200km까지 설정 가능합니다.
 *
 *       **주의사항:**
 *       - 사무실 주소가 등록되어 있지 않거나 위도/경도가 없는 경우 400 에러가 발생합니다.
 *       - 먼저 `/api/drivers/me/office` 엔드포인트로 사무실 주소를 등록해야 합니다.
 *       - 거리는 Haversine 공식을 사용하여 계산됩니다.
 *
 *       **사용 예시:**
 *       - 기본 반경(20km) 조회: `GET /api/drivers/me/requests/nearby`
 *       - 10km 반경 조회: `GET /api/drivers/me/requests/nearby?radiusKm=10`
 *       - 50km 반경 조회: `GET /api/drivers/me/requests/nearby?radiusKm=50`
 *     operationId: getNearbyEstimateRequests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: radiusKm
 *         required: false
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 200
 *           default: 20
 *         description: |
 *           검색 반경 (킬로미터)
 *           기본값: 20km
 *           최소값: 0km
 *           최대값: 200km
 *         example: 20
 *     responses:
 *       '200':
 *         description: 성공적으로 주변 견적 요청을 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 요청 성공 여부
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       estimateRequestId:
 *                         type: string
 *                         format: uuid
 *                         description: 견적 요청 ID
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       distanceKm:
 *                         type: number
 *                         format: float
 *                         description: 사무실로부터의 거리 (킬로미터)
 *                         example: 5.2
 *                       movingType:
 *                         type: string
 *                         enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *                         description: 이사 유형
 *                         example: "HOME_MOVING"
 *                       movingDate:
 *                         type: string
 *                         format: date-time
 *                         description: 이사 예정일
 *                         example: "2026-02-01T09:00:00.000Z"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: 견적 요청 생성 일시
 *                         example: "2026-01-12T10:00:00.000Z"
 *                       fromAddress:
 *                         type: object
 *                         properties:
 *                           sido:
 *                             type: string
 *                             description: 시도
 *                             example: "서울특별시"
 *                           sigungu:
 *                             type: string
 *                             description: 시군구
 *                             example: "강남구"
 *                           address:
 *                             type: string
 *                             nullable: true
 *                             description: 전체 주소
 *                             example: "서울특별시 강남구 테헤란로 123"
 *                           lat:
 *                             type: number
 *                             format: float
 *                             description: 출발지 위도
 *                             example: 37.5665
 *                           lng:
 *                             type: number
 *                             format: float
 *                             description: 출발지 경도
 *                             example: 126.9780
 *                         description: 출발지 주소 정보
 *             examples:
 *               success:
 *                 summary: 성공 응답 예시 (견적 요청이 있는 경우)
 *                 value:
 *                   success: true
 *                   data:
 *                     - estimateRequestId: "123e4567-e89b-12d3-a456-426614174000"
 *                       distanceKm: 3.5
 *                       movingType: "HOME_MOVING"
 *                       movingDate: "2026-02-01T09:00:00.000Z"
 *                       createdAt: "2026-01-12T10:00:00.000Z"
 *                       fromAddress:
 *                         sido: "서울특별시"
 *                         sigungu: "강남구"
 *                         address: "서울특별시 강남구 테헤란로 123"
 *                         lat: 37.5665
 *                         lng: 126.9780
 *                     - estimateRequestId: "123e4567-e89b-12d3-a456-426614174001"
 *                       distanceKm: 8.2
 *                       movingType: "OFFICE_MOVING"
 *                       movingDate: "2026-02-05T14:00:00.000Z"
 *                       createdAt: "2026-01-12T11:00:00.000Z"
 *                       fromAddress:
 *                         sido: "서울특별시"
 *                         sigungu: "송파구"
 *                         address: "서울특별시 송파구 올림픽로 300"
 *                         lat: 37.5133
 *                         lng: 127.1028
 *               empty:
 *                 summary: 주변에 견적 요청이 없는 경우
 *                 value:
 *                   success: true
 *                   data: []
 *       '400':
 *         description: 잘못된 요청입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noOffice:
 *                 summary: 사무실 주소가 등록되지 않은 경우
 *                 value:
 *                   message: "사무실 주소(위도/경도)가 필요합니다"
 *                   statusCode: 400
 *                   name: "AppError"
 *               invalidRadius:
 *                 summary: 유효하지 않은 반경 값
 *                 value:
 *                   message: "유효하지 않은 반경입니다"
 *                   statusCode: 400
 *                   name: "AppError"
 *       '401':
 *         description: 인증이 필요합니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 summary: 인증되지 않은 사용자
 *                 value:
 *                   message: "인증이 필요합니다"
 *                   statusCode: 401
 *                   name: "AppError"
 *       '403':
 *         description: 드라이버 권한이 필요합니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 summary: 드라이버가 아닌 사용자
 *                 value:
 *                   message: "드라이버 권한이 필요합니다"
 *                   statusCode: 403
 *                   name: "AppError"
 *       '500':
 *         description: 서버 내부 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 summary: 서버 오류
 *                 value:
 *                   message: "서버 내부 오류가 발생했습니다"
 *                   statusCode: 500
 *                   name: "AppError"
 */

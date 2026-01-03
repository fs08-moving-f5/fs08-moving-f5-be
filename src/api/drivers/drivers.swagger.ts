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
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: 에러 메시지
 *         name:
 *           type: string
 *           description: 에러 이름
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
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT 토큰 인증 (선택사항 - 로그인하지 않아도 조회 가능하지만, isFavorite 필드는 false로 반환됨)
 *
 * tags:
 *   - name: Drivers
 *     description: 드라이버(기사) 목록 조회 관련 API
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
 *       지역, 서비스 유형으로 필터링하고, 리뷰 수, 평균 평점, 경력, 확정된 견적 수로 정렬할 수 있습니다.
 *       커서 기반 페이지네이션을 지원하며, 각 드라이버 정보에는 프로필, 찜하기 수, 확정된 견적 수, 리뷰 평균 평점, 리뷰 총 개수가 포함됩니다.
 *
 *       **쿼리 파라미터:**
 *       - `region` (선택): 지역 필터. 소문자로 입력 (예: seoul, gyeonggi)
 *       - `service` (선택): 서비스 필터 (SMALL_MOVING, HOME_MOVING, OFFICE_MOVING)
 *       - `sort` (선택): 정렬 기준 (review, rating, career, confirmed-estimate)
 *       - `cursor` (선택): 다음 페이지 조회를 위한 커서 값. 이전 응답의 `pagination.nextCursor` 값을 사용합니다.
 *       - `limit` (선택): 조회할 항목 수. 기본값은 15입니다.
 *
 *       **사용 예시:**
 *       - 전체 드라이버 조회: `GET /api/drivers?limit=15`
 *       - 서울 지역 필터: `GET /api/drivers?region=seoul&limit=15`
 *       - 가정 이사 서비스 필터: `GET /api/drivers?service=HOME_MOVING&limit=15`
 *       - 평균 평점 정렬: `GET /api/drivers?sort=rating&limit=15`
 *       - 복합 필터 및 정렬: `GET /api/drivers?region=seoul&service=HOME_MOVING&sort=rating&limit=15`
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
 *       - $ref: '#/components/parameters/cursorQuery'
 *       - $ref: '#/components/parameters/limitQuery'
 *     responses:
 *       '200':
 *         description: 성공적으로 드라이버 목록을 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DriverListItem'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationInfo'
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
 *                   message: "유효하지 않은 region 값입니다."
 *                   name: "ValidationError"
 *               invalidSort:
 *                 summary: 잘못된 sort 값
 *                 value:
 *                   message: "유효하지 않은 sort 값입니다."
 *                   name: "ValidationError"
 *               invalidLimit:
 *                 summary: 잘못된 limit 값
 *                 value:
 *                   message: "limit은 1 이상의 정수여야 합니다."
 *                   name: "ValidationError"
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

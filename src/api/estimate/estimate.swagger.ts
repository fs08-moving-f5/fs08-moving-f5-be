/**
 * @swagger
 * components:
 *   schemas:
 *     Estimate:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 견적 ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         price:
 *           type: integer
 *           nullable: true
 *           description: 견적 가격 (원)
 *           example: 500000
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, REJECTED, CANCELLED]
 *           description: 견적 상태
 *           example: "PENDING"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성 일시
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정 일시
 *           example: "2024-01-15T10:30:00Z"
 *
 *     EstimateRequestInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 견적 요청 ID
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *         movingType:
 *           type: string
 *           enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *           description: 이사 유형
 *           example: "HOME_MOVING"
 *         movingDate:
 *           type: string
 *           format: date-time
 *           description: 이사 예정일
 *           example: "2024-02-01T09:00:00Z"
 *         isDesignated:
 *           type: boolean
 *           description: 지정 기사 여부
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성 일시
 *           example: "2024-01-15T10:00:00Z"
 *         addresses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AddressInfo'
 *           description: 주소 정보 목록
 *
 *     AddressInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 주소 ID
 *           example: "123e4567-e89b-12d3-a456-426614174002"
 *         addressType:
 *           type: string
 *           enum: [FROM, TO]
 *           description: 주소 유형 (출발지/도착지)
 *           example: "FROM"
 *         address:
 *           type: string
 *           nullable: true
 *           description: 전체 주소
 *           example: "서울특별시 강남구 테헤란로 123"
 *         sido:
 *           type: string
 *           nullable: true
 *           description: 시도
 *           example: "서울특별시"
 *         sigungu:
 *           type: string
 *           nullable: true
 *           description: 시군구
 *           example: "강남구"
 *
 *     DriverProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 드라이버 프로필 ID
 *           example: "123e4567-e89b-12d3-a456-426614174003"
 *         imageUrl:
 *           type: string
 *           nullable: true
 *           description: 프로필 이미지 URL
 *           example: "https://example.com/image.jpg"
 *         career:
 *           type: string
 *           nullable: true
 *           description: 경력 정보
 *           example: "5년차 전문 이사 기사"
 *         shortIntro:
 *           type: string
 *           nullable: true
 *           description: 짧은 소개
 *           example: "안전하고 신속한 이사를 약속드립니다"
 *         confirmedEstimateCount:
 *           type: integer
 *           description: 확정된 견적 수
 *           example: 150
 *         favoriteDriverCount:
 *           type: integer
 *           description: 찜하기 수
 *           example: 45
 *         averageRating:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: 리뷰 평균 점수 (소수점 첫째 자리까지)
 *           example: 4.5
 *
 *     ReviewInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 리뷰 ID
 *           example: "123e4567-e89b-12d3-a456-426614174004"
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: 평점 (1-5)
 *           example: 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 리뷰 작성 일시
 *           example: "2024-01-10T14:20:00Z"
 *
 *     Driver:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 드라이버(기사) ID
 *           example: "123e4567-e89b-12d3-a456-426614174005"
 *         isFavorite:
 *           type: boolean
 *           description: 찜하기 여부
 *           example: true
 *         driverProfile:
 *           oneOf:
 *             - $ref: '#/components/schemas/DriverProfile'
 *             - type: "null"
 *           description: 드라이버 프로필 정보
 *
 *     PendingEstimateItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 견적 ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         price:
 *           type: integer
 *           nullable: true
 *           description: 견적 가격 (원)
 *           example: 500000
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, REJECTED, CANCELLED]
 *           description: 견적 상태
 *           example: "PENDING"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성 일시
 *           example: "2024-01-15T10:30:00Z"
 *         driver:
 *           oneOf:
 *             - $ref: '#/components/schemas/Driver'
 *             - type: "null"
 *           description: 드라이버 정보
 *
 *     PendingEstimate:
 *       type: object
 *       properties:
 *         estimateRequest:
 *           $ref: '#/components/schemas/EstimateRequestInfo'
 *           description: 견적 요청 정보
 *         estimates:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PendingEstimateItem'
 *           description: 해당 견적 요청에 대한 견적 목록
 *
 *     ReceivedEstimate:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 견적 ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         price:
 *           type: integer
 *           nullable: true
 *           description: 견적 가격 (원)
 *           example: 500000
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, REJECTED, CANCELLED]
 *           description: 견적 상태
 *           example: "PENDING"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성 일시
 *           example: "2024-01-15T10:30:00Z"
 *         estimateRequest:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               description: 견적 요청 ID
 *             movingType:
 *               type: string
 *               enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *               description: 이사 유형
 *             movingDate:
 *               type: string
 *               format: date-time
 *               description: 이사 예정일
 *             isDesignated:
 *               type: boolean
 *               description: 지정 기사 여부
 *             status:
 *               type: string
 *               enum: [PENDING, CONFIRMED, REJECTED, CANCELLED]
 *               description: 견적 요청 상태
 *             addresses:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AddressInfo'
 *               description: 주소 정보 목록
 *           description: 견적 요청 정보
 *         driver:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               description: 드라이버 ID
 *             driverProfile:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DriverProfile'
 *                 - type: "null"
 *               description: 드라이버 프로필 정보
 *           description: 드라이버 정보
 *
 *     EstimateDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 견적 ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         price:
 *           type: integer
 *           nullable: true
 *           description: 견적 가격 (원)
 *           example: 500000
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, REJECTED, CANCELLED]
 *           description: 견적 상태
 *           example: "PENDING"
 *         estimateRequest:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               description: 견적 요청 ID
 *             movingType:
 *               type: string
 *               enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *               description: 이사 유형
 *             movingDate:
 *               type: string
 *               format: date-time
 *               description: 이사 예정일
 *             isDesignated:
 *               type: boolean
 *               description: 지정 기사 여부
 *             addresses:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   addressType:
 *                     type: string
 *                     enum: [FROM, TO]
 *                   address:
 *                     type: string
 *                     nullable: true
 *               description: 주소 정보 목록
 *           description: 견적 요청 정보
 *         driver:
 *           oneOf:
 *             - type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   description: 드라이버 ID
 *                 driverProfile:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/DriverProfile'
 *                     - type: "null"
 *                   description: 드라이버 프로필 정보
 *             - type: "null"
 *           description: 드라이버 정보
 *
 *     ConfirmedEstimate:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 견적 ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         estimateRequestId:
 *           type: string
 *           format: uuid
 *           description: 견적 요청 ID
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *         driverId:
 *           type: string
 *           format: uuid
 *           description: 드라이버 ID
 *           example: "123e4567-e89b-12d3-a456-426614174005"
 *         price:
 *           type: integer
 *           nullable: true
 *           description: 견적 가격 (원)
 *           example: 500000
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성 일시
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정 일시
 *           example: "2024-01-15T11:00:00Z"
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
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: 검증 실패 메시지
 *         errors:
 *           type: object
 *           description: 검증 에러 상세 정보
 *
 *     NotFoundErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: 에러 메시지
 *
 *   parameters:
 *     estimateId:
 *       in: path
 *       name: estimateId
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       description: 견적 ID
 *       example: "123e4567-e89b-12d3-a456-426614174000"
 *
 *     statusQuery:
 *       in: query
 *       name: status
 *       required: false
 *       schema:
 *         type: string
 *         enum: [PENDING, CONFIRMED, REJECTED, CANCELLED]
 *       description: 견적 상태 필터 (대소문자 구분 없음)
 *       example: "PENDING"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT 토큰 인증
 *
 * tags:
 *   - name: Estimate
 *     description: 견적 관련 API
 */

/**
 * @swagger
 * /api/estimate/pending:
 *   get:
 *     tags:
 *       - Estimate
 *     summary: 대기 중인 견적 목록 조회
 *     description: |
 *       현재 사용자가 요청한 견적 중에서 상태가 PENDING인 견적 요청 목록을 조회합니다.
 *       각 견적 요청에는 해당 요청에 대한 모든 PENDING 견적들이 포함됩니다.
 *       각 견적에는 드라이버 정보, 찜하기 여부, 드라이버의 확정된 견적 수, 찜하기 수, 리뷰 평균 점수가 포함됩니다.
 *       응답은 EstimateRequest 기준으로 그룹화되어 제공됩니다.
 *     operationId: getPendingEstimates
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: 성공적으로 대기 중인 견적 목록을 조회했습니다.
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
 *                         $ref: '#/components/schemas/PendingEstimate'
 *             examples:
 *               success:
 *                 summary: 성공 응답 예시
 *                 value:
 *                   success: true
 *                   data:
 *                     - estimateRequest:
 *                         id: "123e4567-e89b-12d3-a456-426614174001"
 *                         movingType: "HOME_MOVING"
 *                         movingDate: "2024-02-01T09:00:00Z"
 *                         isDesignated: false
 *                         createdAt: "2024-01-15T10:00:00Z"
 *                         addresses:
 *                           - id: "123e4567-e89b-12d3-a456-426614174002"
 *                             addressType: "FROM"
 *                             sido: "서울특별시"
 *                             sigungu: "강남구"
 *                           - id: "123e4567-e89b-12d3-a456-426614174003"
 *                             addressType: "TO"
 *                             sido: "서울특별시"
 *                             sigungu: "송파구"
 *                       estimates:
 *                         - id: "123e4567-e89b-12d3-a456-426614174000"
 *                           price: 500000
 *                           status: "PENDING"
 *                           createdAt: "2024-01-15T10:30:00Z"
 *                           driver:
 *                             id: "123e4567-e89b-12d3-a456-426614174005"
 *                             isFavorite: true
 *                             driverProfile:
 *                               id: "123e4567-e89b-12d3-a456-426614174003"
 *                               imageUrl: "https://example.com/image.jpg"
 *                               career: "5년차 전문 이사 기사"
 *                               shortIntro: "안전하고 신속한 이사를 약속드립니다"
 *                               confirmedEstimateCount: 150
 *                               favoriteDriverCount: 45
 *                               averageRating: 4.5
 *                         - id: "123e4567-e89b-12d3-a456-426614174006"
 *                           price: 450000
 *                           status: "PENDING"
 *                           createdAt: "2024-01-15T11:00:00Z"
 *                           driver:
 *                             id: "123e4567-e89b-12d3-a456-426614174007"
 *                             isFavorite: false
 *                             driverProfile:
 *                               id: "123e4567-e89b-12d3-a456-426614174008"
 *                               imageUrl: "https://example.com/image2.jpg"
 *                               career: "10년차 전문 이사 기사"
 *                               shortIntro: "경험 많은 전문가가 책임지고 진행합니다"
 *                               confirmedEstimateCount: 200
 *                               favoriteDriverCount: 60
 *                               averageRating: 4.8
 *       '401':
 *         description: 인증되지 않은 사용자입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 서버 내부 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/estimate/received:
 *   get:
 *     tags:
 *       - Estimate
 *     summary: 받은 견적 목록 조회
 *     description: |
 *       현재 사용자가 받은 견적 목록을 조회합니다.
 *       status 쿼리 파라미터를 통해 특정 상태의 견적만 필터링할 수 있습니다.
 *       가능한 상태 값: PENDING, CONFIRMED, REJECTED, CANCELLED (대소문자 구분 없음)
 *       각 견적에는 드라이버 정보, 견적 요청 정보, 드라이버의 확정된 견적 수, 찜하기 수, 리뷰 평균 점수가 포함됩니다.
 *     operationId: getReceivedEstimates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/statusQuery'
 *     responses:
 *       '200':
 *         description: 성공적으로 받은 견적 목록을 조회했습니다.
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
 *                         $ref: '#/components/schemas/ReceivedEstimate'
 *             examples:
 *               allEstimates:
 *                 summary: 전체 견적 조회 (status 파라미터 없음)
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "123e4567-e89b-12d3-a456-426614174000"
 *                       price: 500000
 *                       status: "PENDING"
 *                       createdAt: "2024-01-15T10:30:00Z"
 *                       estimateRequest:
 *                         id: "123e4567-e89b-12d3-a456-426614174001"
 *                         movingType: "HOME_MOVING"
 *                         movingDate: "2024-02-01T09:00:00Z"
 *                         isDesignated: false
 *                         status: "PENDING"
 *                         addresses:
 *                           - id: "123e4567-e89b-12d3-a456-426614174002"
 *                             addressType: "FROM"
 *                             address: "서울특별시 강남구 테헤란로 123"
 *                             sido: "서울특별시"
 *                             sigungu: "강남구"
 *                       driver:
 *                         id: "123e4567-e89b-12d3-a456-426614174005"
 *                         driverProfile:
 *                           id: "123e4567-e89b-12d3-a456-426614174003"
 *                           imageUrl: "https://example.com/image.jpg"
 *                           career: "5년차 전문 이사 기사"
 *                           shortIntro: "안전하고 신속한 이사를 약속드립니다"
 *                           confirmedEstimateCount: 150
 *                           favoriteDriverCount: 45
 *                           averageRating: 4.5
 *               filteredEstimates:
 *                 summary: 특정 상태 견적 조회 (status=PENDING)
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "123e4567-e89b-12d3-a456-426614174000"
 *                       price: 500000
 *                       status: "PENDING"
 *                       createdAt: "2024-01-15T10:30:00Z"
 *                       estimateRequest:
 *                         id: "123e4567-e89b-12d3-a456-426614174001"
 *                         movingType: "HOME_MOVING"
 *                         movingDate: "2024-02-01T09:00:00Z"
 *                         isDesignated: false
 *                         status: "PENDING"
 *                         addresses:
 *                           - id: "123e4567-e89b-12d3-a456-426614174002"
 *                             addressType: "FROM"
 *                             address: "서울특별시 강남구 테헤란로 123"
 *                             sido: "서울특별시"
 *                             sigungu: "강남구"
 *                       driver:
 *                         id: "123e4567-e89b-12d3-a456-426614174005"
 *                         driverProfile:
 *                           id: "123e4567-e89b-12d3-a456-426614174003"
 *                           imageUrl: "https://example.com/image.jpg"
 *                           career: "5년차 전문 이사 기사"
 *                           shortIntro: "안전하고 신속한 이사를 약속드립니다"
 *                           confirmedEstimateCount: 150
 *                           favoriteDriverCount: 45
 *                           averageRating: 4.5
 *       '400':
 *         description: 잘못된 요청입니다. status 값이 유효하지 않습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: 인증되지 않은 사용자입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 서버 내부 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/estimate/{estimateId}:
 *   get:
 *     tags:
 *       - Estimate
 *     summary: 견적 상세 조회
 *     description: |
 *       특정 견적의 상세 정보를 조회합니다.
 *       견적 ID를 통해 해당 견적의 가격, 상태, 견적 요청 정보, 드라이버 정보 등을 확인할 수 있습니다.
 *       드라이버의 확정된 견적 수, 찜하기 수, 리뷰 평균 점수가 함께 제공됩니다.
 *     operationId: getEstimateDetail
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/estimateId'
 *     responses:
 *       '200':
 *         description: 성공적으로 견적 상세 정보를 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       oneOf:
 *                         - $ref: '#/components/schemas/EstimateDetail'
 *                         - type: "null"
 *             examples:
 *               success:
 *                 summary: 성공 응답 예시
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "123e4567-e89b-12d3-a456-426614174000"
 *                     price: 500000
 *                     status: "PENDING"
 *                     estimateRequest:
 *                       id: "123e4567-e89b-12d3-a456-426614174001"
 *                       movingType: "HOME_MOVING"
 *                       movingDate: "2024-02-01T09:00:00Z"
 *                       isDesignated: false
 *                       addresses:
 *                         - id: "123e4567-e89b-12d3-a456-426614174002"
 *                           addressType: "FROM"
 *                           address: "서울특별시 강남구 테헤란로 123"
 *                         - id: "123e4567-e89b-12d3-a456-426614174003"
 *                           addressType: "TO"
 *                           address: "서울특별시 송파구 올림픽로 456"
 *                     driver:
 *                       id: "123e4567-e89b-12d3-a456-426614174005"
 *                       driverProfile:
 *                         id: "123e4567-e89b-12d3-a456-426614174003"
 *                         imageUrl: "https://example.com/image.jpg"
 *                         career: "5년차 전문 이사 기사"
 *                         shortIntro: "안전하고 신속한 이사를 약속드립니다"
 *                         confirmedEstimateCount: 150
 *                         favoriteDriverCount: 45
 *                         averageRating: 4.5
 *               notFound:
 *                 summary: 견적을 찾을 수 없는 경우
 *                 value:
 *                   success: true
 *                   data: null
 *       '400':
 *         description: 잘못된 요청입니다. estimateId가 유효하지 않습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: 인증되지 않은 사용자입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: 견적을 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 서버 내부 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/estimate/{estimateId}/confirm:
 *   post:
 *     tags:
 *       - Estimate
 *     summary: 견적 확정
 *     description: |
 *       특정 견적을 확정(CONFIRMED) 상태로 변경합니다.
 *       견적이 확정되면 해당 견적 요청의 상태도 함께 변경됩니다.
 *       확정된 견적은 취소하거나 변경할 수 없으므로 신중하게 결정해야 합니다.
 *     operationId: confirmEstimate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/estimateId'
 *     responses:
 *       '200':
 *         description: 성공적으로 견적을 확정했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ConfirmedEstimate'
 *             examples:
 *               success:
 *                 summary: 성공 응답 예시
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "123e4567-e89b-12d3-a456-426614174000"
 *                     estimateRequestId: "123e4567-e89b-12d3-a456-426614174001"
 *                     driverId: "123e4567-e89b-12d3-a456-426614174005"
 *                     price: 500000
 *                     createdAt: "2024-01-15T10:30:00Z"
 *                     updatedAt: "2024-01-15T11:00:00Z"
 *       '400':
 *         description: 잘못된 요청입니다. estimateId가 유효하지 않거나 이미 확정/취소된 견적입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: 인증되지 않은 사용자입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: 견적을 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '409':
 *         description: 견적을 확정할 수 없는 상태입니다. (이미 확정되었거나 취소된 견적)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 서버 내부 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

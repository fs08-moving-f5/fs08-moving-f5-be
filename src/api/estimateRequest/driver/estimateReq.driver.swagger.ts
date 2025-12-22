/**
 * @swagger
 * components:
 *   schemas:
 *     EstimateConfirm:
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
 *           enum: [PENDING, CONFIRMED]
 *           description: 견적 상태
 *           example: "PENDING"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성 일시
 *           example: "2024-01-15T10:30:00Z"
 *         hasReview:
 *           type: boolean
 *           description: 리뷰 작성 여부
 *           example: false
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               description: 사용자 ID
 *               example: "123e4567-e89b-12d3-a456-426614174001"
 *             name:
 *               type: string
 *               description: 사용자 이름
 *               example: "홍길동"
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
 *         from:
 *           type: object
 *           nullable: true
 *           properties:
 *             sido:
 *               type: string
 *               description: 시도
 *               example: "서울특별시"
 *             sigungu:
 *               type: string
 *               description: 시군구
 *               example: "강남구"
 *         to:
 *           type: object
 *           nullable: true
 *           properties:
 *             sido:
 *               type: string
 *               description: 시도
 *               example: "부산광역시"
 *             sigungu:
 *               type: string
 *               description: 시군구
 *               example: "해운대구"
 *
 *     EstimateConfirmDetail:
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
 *         userName:
 *           type: string
 *           description: 사용자 이름
 *           example: "홍길동"
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
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정 일시
 *           example: "2024-01-15T11:00:00Z"
 *         fromAddress:
 *           type: string
 *           nullable: true
 *           description: 출발지 주소
 *           example: "서울특별시 강남구 테헤란로 123"
 *         toAddress:
 *           type: string
 *           nullable: true
 *           description: 도착지 주소
 *           example: "부산광역시 해운대구 해운대해변로 264"
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
 * tags:
 *   name: Driver EstimateReq
 *   description: 기사 견적 관련 API
 */

/**
 * @swagger
 * /api/estimate-request/driver/requests:
 *   get:
 *     summary: 받은 견적 요청 목록 조회 (기사)
 *     description: |
 *       기사에게 들어온 견적 요청 목록을 조회합니다.
 *       - status는 항상 PENDING
 *       - isDesignated = false 인 요청만 조회됩니다.
 *       - 커서 기반 페이지네이션을 지원합니다.
 *     tags:
 *       - Driver EstimateReq
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: movingType
 *         schema:
 *           type: string
 *           enum: [HOME, OFFICE, ETC]
 *         description: 이사 유형 필터
 *       - in: query
 *         name: serviceRegionFilter
 *         schema:
 *           type: boolean
 *         description: true일 경우 기사 서비스 지역과 일치하는 요청만 조회
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 사용자 이름 검색
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest, oldest, moving-latest, moving-oldest]
 *         description: 정렬 기준
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *           nullable: true
 *         description: 커서 기준 estimateRequest id
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         description: 조회 개수
 *     responses:
 *       200:
 *         description: 받은 견적 요청 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 받은 견적 요청 리스트 조회 성공
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "uuid-estimate-request-id"
 *                       name:
 *                         type: string
 *                         example: 홍길동
 *                       movingType:
 *                         type: string
 *                         example: HOME
 *                       movingDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-01T00:00:00.000Z"
 *                       isDesignated:
 *                         type: boolean
 *                         example: false
 *                       from:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           sido:
 *                             type: string
 *                             example: 서울특별시
 *                           sigungu:
 *                             type: string
 *                             example: 강남구
 *                       to:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           sido:
 *                             type: string
 *                             example: 부산광역시
 *                           sigungu:
 *                             type: string
 *                             example: 해운대구
 *       401:
 *         description: 기사 인증 실패
 */

/**
 * @swagger
 * /api/estimate-request/driver/requests/:estimateRequestId/create:
 *   post:
 *     summary: 견적 보내기 (기사)
 *     tags: [Driver EstimateReq]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estimateRequestId
 *               - driverId
 *               - price
 *               - comment
 *             properties:
 *               estimateRequestId:
 *                 type: string
 *               price:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: 견적 전송 성공
 */

/**
 * @swagger
 * /api/estimate-request/driver/requests/:estimateRequestId/reject:
 *   post:
 *     summary: 견적 반려 (기사)
 *     tags: [Driver EstimateReq]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estimateRequestId
 *               - rejectReason
 *               - driverId
 *             properties:
 *               estimateRequestId:
 *                 type: string
 *               rejectReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: 견적 반려 성공
 */

/**
 * @swagger
 * /api/estimate-request/driver/confirms:
 *   get:
 *     summary: 확정(및 대기) 견적 목록 조회 (기사)
 *     description: >
 *       기사가 유저에게 보낸 견적 중
 *       상태가 PENDING 또는 CONFIRMED 인 견적 목록을 조회합니다.
 *       이사 완료 여부는 isCompleted 필드로 판단합니다.
 *     tags:
 *       - Driver EstimateReq
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest]
 *         description: "정렬 기준 (기본값: latest)"
 *
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *           nullable: true
 *         description: 커서 기반 페이지네이션용 estimate id
 *
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           example: 6
 *         description: 조회 개수 (기본값 6)
 *
 *     responses:
 *       200:
 *         description: 확정 견적 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 확정 견적 목록 조회 성공
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EstimateConfirm'
 *
 *       401:
 *         description: 기사 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/estimate-request/driver/confirms/{estimateId}:
 *   get:
 *     summary: 확정 견적 상세 조회 (기사)
 *     description: 기사가 유저에게 보낸 견적의 상세 정보를 조회합니다.
 *     tags:
 *       - Driver EstimateReq
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estimateId
 *         required: true
 *         schema:
 *           type: string
 *         description: 조회할 견적 ID
 *
 *     responses:
 *       200:
 *         description: 확정 견적 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/EstimateConfirmDetail'
 *
 *       401:
 *         description: 기사 인증 실패
 *
 *       404:
 *         description: 견적을 찾을 수 없음
 */

/**
 * @swagger
 * /api/estimate-request/driver/rejects:
 *   get:
 *     summary: 반려 견적 목록 조회 (기사)
 *     description: |
 *       기사가 반려한 견적 목록을 조회합니다.
 *       - 본인(driverId)의 견적만 조회됩니다.
 *       - status는 항상 REJECTED 입니다.
 *       - 커서 기반 페이지네이션을 지원합니다.
 *     tags:
 *       - Driver EstimateReq
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest]
 *         description: "정렬 기준 (기본값: latest)"
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *           nullable: true
 *         description: 커서 기준 estimate id
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         description: 조회 개수 (기본값 서버 설정값)
 *     responses:
 *       200:
 *         description: 반려 견적 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 반려 견적 목록 조회 성공
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "uuid-estimate-id"
 *                       status:
 *                         type: string
 *                         example: REJECTED
 *                       isRejected:
 *                         type: boolean
 *                         example: true
 *                       estimateRequest:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "uuid-estimate-request-id"
 *                           movingType:
 *                             type: string
 *                             example: HOME
 *                           movingDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-12-01T00:00:00.000Z"
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "uuid-user-id"
 *                               name:
 *                                 type: string
 *                                 example: 홍길동
 *                           addresses:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 addressType:
 *                                   type: string
 *                                   example: FROM
 *                                 sido:
 *                                   type: string
 *                                   example: 서울특별시
 *                                 sigungu:
 *                                   type: string
 *                                   example: 강남구
 *       401:
 *         description: 기사 인증 실패
 */

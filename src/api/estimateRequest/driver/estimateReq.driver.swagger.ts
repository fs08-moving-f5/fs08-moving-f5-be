/**
 * @swagger
 * tags:
 *   name: Driver Estimate
 *   description: 기사 견적 관련 API
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         statusCode:
 *           type: number
 *         name:
 *           type: string
 *         stack:
 *           type: string
 *
 *     AddressSummary:
 *       type: object
 *       properties:
 *         sido:
 *           type: string
 *           example: 서울
 *         sigungu:
 *           type: string
 *           example: 강남구
 */

/**
 * @swagger
 * /api/estimate-request/driver/requests:
 *   get:
 *     tags: [Driver Estimate]
 *     summary: 받은 견적 요청 목록 조회 (기사)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: movingType
 *         schema:
 *           type: string
 *           enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *       - in: query
 *         name: serviceRegionFilter
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest, oldest, moving-latest, moving-oldest]
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: take
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "req_1"
 *                   name: "홍길동"
 *                   movingType: HOME_MOVING
 *                   movingDate: "2025-01-01T00:00:00.000Z"
 *                   isDesignated: false
 *                   createdAt: "2024-12-01T10:00:00.000Z"
 *                   updatedAt: "2024-12-01T10:00:00.000Z"
 *                   from: { sido: 서울, sigungu: 강남구 }
 *                   to: { sido: 경기, sigungu: 성남시 }
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             example:
 *               message: "잘못된 요청입니다."
 *               statusCode: 400
 *               name: "Error"
 *               stack: "string"
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             example:
 *               message: "기사 로그인이 필요합니다."
 *               statusCode: 401
 *               name: "Error"
 *               stack: "string"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 *               statusCode: 500
 *               name: "Error"
 *               stack: "string"
 */

/**
 * @swagger
 * /api/estimate-request/driver/requests/{estimateRequestId}/create:
 *   post:
 *     tags: [Driver Estimate]
 *     summary: 견적 보내기 (기사)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estimateRequestId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             price: 300000
 *             comment: "합리적인 가격으로 진행 가능합니다."
 *     responses:
 *       200:
 *         description: 견적 생성 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "est_1"
 *                 price: 300000
 *                 status: CONFIRMED
 *       400:
 *         description: 요청 오류
 *         content:
 *           application/json:
 *             example:
 *               message: "필수 값이 누락되었습니다."
 *               statusCode: 400
 *               name: "Error"
 *               stack: "string"
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             example:
 *               message: "기사 로그인이 필요합니다."
 *               statusCode: 401
 *               name: "Error"
 *               stack: "string"
 *       404:
 *         description: 견적 요청 없음
 *         content:
 *           application/json:
 *             example:
 *               message: "해당 견적 요청이 존재하지 않습니다."
 *               statusCode: 404
 *               name: "Error"
 *               stack: "string"
 *       409:
 *         description: 이미 견적 제출됨
 *         content:
 *           application/json:
 *             example:
 *               message: "이미 해당 요청에 견적을 제출했습니다."
 *               statusCode: 409
 *               name: "Error"
 *               stack: "string"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 *               statusCode: 500
 *               name: "Error"
 *               stack: "string"
 */

/**
 * @swagger
 * /api/estimate-request/driver/requests/{estimateRequestId}/reject:
 *   post:
 *     tags: [Driver Estimate]
 *     summary: 견적 반려 (기사)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estimateRequestId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             rejectReason: "일정이 맞지 않습니다."
 *     responses:
 *       200:
 *         description: 견적 반려 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "est_2"
 *                 status: REJECTED
 *       400:
 *         description: 요청 오류
 *         content:
 *           application/json:
 *             example:
 *               message: "필수 값이 누락되었습니다."
 *               statusCode: 400
 *               name: "Error"
 *               stack: "string"
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             example:
 *               message: "기사 로그인이 필요합니다."
 *               statusCode: 401
 *               name: "Error"
 *               stack: "string"
 *       404:
 *         description: 견적 요청 없음
 *         content:
 *           application/json:
 *             example:
 *               message: "해당 견적 요청이 존재하지 않습니다."
 *               statusCode: 404
 *               name: "Error"
 *               stack: "string"
 *       409:
 *         description: 이미 처리된 요청
 *         content:
 *           application/json:
 *             example:
 *               message: "이미 해당 요청에 견적을 제출했습니다."
 *               statusCode: 409
 *               name: "Error"
 *               stack: "string"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 *               statusCode: 500
 *               name: "Error"
 *               stack: "string"
 */

/**
 * @swagger
 * /api/estimate-request/driver/confirms:
 *   get:
 *     tags: [Driver Estimate]
 *     summary: 확정 견적 목록 조회 (기사)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "est_1"
 *                   price: 300000
 *                   status: CONFIRMED
 *                   createdAt: "2025-01-01T00:00:00.000Z"
 *                   isCompleted: false
 *                   user:
 *                     id: "user_10"
 *                     name: "박영희"
 *                   movingType: HOME_MOVING
 *                   movingDate: "2025-02-01T00:00:00.000Z"
 *                   isDesignated: false
 *                   from: { sido: 서울, sigungu: 강남구 }
 *                   to: { sido: 경기, sigungu: 성남시 }
 *       400:
 *         description: 요청 오류
 *         content:
 *           application/json:
 *             example:
 *               message: "잘못된 요청입니다."
 *               statusCode: 400
 *               name: "Error"
 *               stack: "string"
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             example:
 *               message: "기사 로그인이 필요합니다."
 *               statusCode: 401
 *               name: "Error"
 *               stack: "string"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 *               statusCode: 500
 *               name: "Error"
 *               stack: "string"
 */

/**
 * @swagger
 * /api/estimate-request/driver/confirms/{estimateId}:
 *   get:
 *     tags: [Driver Estimate]
 *     summary: 확정 견적 상세 조회 (기사)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estimateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "est_1"
 *                 price: 300000
 *                 userName: "홍길동"
 *                 movingType: HOME_MOVING
 *                 movingDate: "2025-01-01T00:00:00.000Z"
 *                 fromAddress: "서울 강남구"
 *                 toAddress: "경기 성남시"
 *       400:
 *         description: 요청 오류
 *         content:
 *           application/json:
 *             example:
 *               message: "필수 값이 누락되었습니다."
 *               statusCode: 400
 *               name: "Error"
 *               stack: "string"
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             example:
 *               message: "기사 로그인이 필요합니다."
 *               statusCode: 401
 *               name: "Error"
 *               stack: "string"
 *       404:
 *         description: 견적 없음
 *         content:
 *           application/json:
 *             example:
 *               message: "해당 견적이 존재하지 않습니다."
 *               statusCode: 404
 *               name: "Error"
 *               stack: "string"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 *               statusCode: 500
 *               name: "Error"
 *               stack: "string"
 */

/**
 * @swagger
 * /api/estimate-request/driver/rejects:
 *   get:
 *     tags: [Driver Estimate]
 *     summary: 반려 견적 목록 조회 (기사)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "est_3"
 *                   status: REJECTED
 *                   estimateRequestId: "req_9"
 *                   movingType: SMALL_MOVING
 *                   movingDate: "2025-02-01T00:00:00.000Z"
 *                   user:
 *                     id: "user_1"
 *                     name: "김철수"
 *                   from: { sido: 서울, sigungu: 마포구 }
 *                   to: { sido: 인천, sigungu: 연수구 }
 *                   isRejected: true
 *       400:
 *         description: 요청 오류
 *         content:
 *           application/json:
 *             example:
 *               message: "잘못된 요청입니다."
 *               statusCode: 400
 *               name: "Error"
 *               stack: "string"
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             example:
 *               message: "기사 로그인이 필요합니다."
 *               statusCode: 401
 *               name: "Error"
 *               stack: "string"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 *               statusCode: 500
 *               name: "Error"
 *               stack: "string"
 */

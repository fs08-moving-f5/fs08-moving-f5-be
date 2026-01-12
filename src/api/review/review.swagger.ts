/**
 * @swagger
 * tags:
 *   name: Review
 *   description: 리뷰 관련 API (일반 유저)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: 에러 메시지
 *         statusCode:
 *           type: number
 *           example: 400
 *         name:
 *           type: string
 *           example: Error
 *         stack:
 *           type: string
 *           example: string
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
 * /api/review/written:
 *   get:
 *     tags: [Review]
 *     summary: 내가 작성한 리뷰 목록 조회 (일반 유저)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest]
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
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
 *                 reviews:
 *                   - rating: 5
 *                     content: "아주 만족스러운 이사였습니다."
 *                     createdAt: "2025-01-01T10:00:00.000Z"
 *                     driver:
 *                       name: "김기사"
 *                       shortIntro: "10년 경력 기사입니다."
 *                     movingType: HOME_MOVING
 *                     movingDate: "2025-01-10T00:00:00.000Z"
 *                     isDesignated: false
 *                     from: { sido: 서울, sigungu: 강남구 }
 *                     to: { sido: 경기, sigungu: 성남시 }
 *                 total: 1
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             example:
 *               message: "유저 로그인이 필요합니다."
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
 * /api/reviews/writable:
 *   get:
 *     tags: [Review]
 *     summary: 리뷰 작성 가능한 견적 목록 조회 (일반 유저)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest]
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
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
 *                 estimates:
 *                   - id: "est_1"
 *                     price: 300000
 *                     createdAt: "2025-01-01T09:00:00.000Z"
 *                     driver:
 *                       name: "이기사"
 *                       shortIntro: "친절한 이사 전문가"
 *                     movingType: SMALL_MOVING
 *                     movingDate: "2025-01-15T00:00:00.000Z"
 *                     isDesignated: true
 *                     from: { sido: 서울, sigungu: 마포구 }
 *                     to: { sido: 인천, sigungu: 연수구 }
 *                 total: 1
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             example:
 *               message: "유저 로그인이 필요합니다."
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
 * /api/reviews/{reviewId}:
 *   patch:
 *     tags: [Review]
 *     summary: 리뷰 작성 (일반 유저)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             estimateId: "est_1"
 *             rating: 5
 *             content: "기사님이 정말 친절했습니다."
 *     responses:
 *       200:
 *         description: 리뷰 작성 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "rev_1"
 *                 rating: 5
 *                 content: "기사님이 정말 친절했습니다."
 *       400:
 *         description: 잘못된 요청
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
 *               message: "유저 로그인이 필요합니다."
 *               statusCode: 401
 *               name: "Error"
 *               stack: "string"
 *       404:
 *         description: 리뷰 대상 없음
 *         content:
 *           application/json:
 *             example:
 *               message: "해당 리뷰가 존재하지 않습니다."
 *               statusCode: 404
 *               name: "Error"
 *               stack: "string"
 *       409:
 *         description: 이미 리뷰 작성됨
 *         content:
 *           application/json:
 *             example:
 *               message: "이미 해당 견적에 리뷰를 제출했습니다."
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

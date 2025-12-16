/**
 * @swagger
 * tags:
 *   name: Review
 *   description: 리뷰 관련 API
 */

/**
 * @swagger
 * /api/review/written:
 *   get:
 *     summary: 내가 작성한 리뷰 목록 조회
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest]
 *         description: "정렬 기준 (기본: latest)"
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: 페이징 offset
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이징 limit
 *     responses:
 *       200:
 *         description: 내가 작성한 리뷰 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     reviews:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           rating:
 *                             type: integer
 *                           content:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           driver:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               shortIntro:
 *                                 type: string
 *                                 nullable: true
 *                           movingType:
 *                             type: string
 *                           movingDate:
 *                             type: string
 *                             format: date-time
 *                           isDesignated:
 *                             type: boolean
 *                           from:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               sido:
 *                                 type: string
 *                               sigungu:
 *                                 type: string
 *                           to:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               sido:
 *                                 type: string
 *                               sigungu:
 *                                 type: string
 */

/**
 * @swagger
 * /api/review/writable:
 *   get:
 *     summary: 작성 가능한 리뷰 목록 조회
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest]
 *         description: "정렬 기준 (기본: latest)"
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: 페이징 offset
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이징 limit
 *     responses:
 *       200:
 *         description: 작성 가능한 리뷰 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     estimates:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           price:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           driver:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               shortIntro:
 *                                 type: string
 *                                 nullable: true
 *                           movingType:
 *                             type: string
 *                           movingDate:
 *                             type: string
 *                             format: date-time
 *                           isDesignated:
 *                             type: boolean
 *                           from:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               sido:
 *                                 type: string
 *                               sigungu:
 *                                 type: string
 *                           to:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               sido:
 *                                 type: string
 *                               sigungu:
 *                                 type: string
 */

/**
 * @swagger
 * /api/review/write:
 *   patch:
 *     summary: 리뷰 작성 (기존 Review 업데이트)
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estimateId
 *               - rating
 *               - content
 *             properties:
 *               estimateId:
 *                 type: string
 *                 description: 리뷰 대상 견적 ID
 *               rating:
 *                 type: integer
 *                 description: 평점
 *               content:
 *                 type: string
 *                 description: 리뷰 내용
 *     responses:
 *       200:
 *         description: 리뷰 작성(업데이트) 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 리뷰 작성 성공
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     rating:
 *                       type: integer
 *                     content:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 */

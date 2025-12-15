/**
 * @swagger
 * tags:
 *   name: Estimate
 *   description: 받은 요청(기사) API
 */

/**
 * @swagger
 * /estimate/requests:
 *   get:
 *     summary: 받은 견적 요청 목록 조회 (기사)
 *     tags: [Estimate]
 *     parameters:
 *       - in: query
 *         name: movingType
 *         schema:
 *           type: string
 *           enum: [HOME, OFFICE, ETC]
 *       - in: query
 *         name: movingDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: serviceRegionFilter
 *         schema:
 *           type: boolean
 *         description: true면 드라이버의 서비스 지역과 일치하는 요청만 필터링
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
 *         description: 성공적으로 조회됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       movingType:
 *                         type: string
 *                       movingDate:
 *                         type: string
 *                         format: date
 *                       from:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           sido:
 *                             type: string
 *                           sigungu:
 *                             type: string
 *                       to:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           sido:
 *                             type: string
 *                           sigungu:
 *                             type: string
 */

/**
 * @swagger
 * /estimate/create:
 *   post:
 *     summary: 견적 보내기 (기사)
 *     tags: [Estimate]
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
 * /estimate/reject:
 *   post:
 *     summary: 견적 반려 (기사)
 *     tags: [Estimate]
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

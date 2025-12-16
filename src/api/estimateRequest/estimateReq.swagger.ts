/**
 * @swagger
 * tags:
 *   name: EstimateReq
 *   description: 기사 견적 관련 API
 */

/**
 * @swagger
 * /api/driver-estimate/requests:
 *   get:
 *     summary: 받은 견적 요청 목록 조회 (기사)
 *     tags: [EstimateReq]
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
 * /api/driver-estimate/create:
 *   post:
 *     summary: 견적 보내기 (기사)
 *     tags: [EstimateReq]
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
 * /api/driver-estimate/reject:
 *   post:
 *     summary: 견적 반려 (기사)
 *     tags: [EstimateReq]
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
 * /api/driver-estimate/confirm:
 *   get:
 *     summary: 확정(및 대기) 견적 목록 조회 (기사)
 *     description: >
 *       기사가 유저에게 보낸 견적 중
 *       상태가 PENDING 또는 CONFIRMED 인 견적 목록을 조회합니다.
 *       이사 완료 여부는 isCompleted 필드로 판단합니다.
 *     tags:
 *       - EstimateReq
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest]
 *         description: 정렬 방식 (기본값 latest)
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
 * /estimate/confirm/{estimateId}:
 *   get:
 *     summary: 확정 견적 상세 조회 (기사)
 *     description: 기사가 유저에게 보낸 견적의 상세 정보를 조회합니다.
 *     tags:
 *       - Estimate
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

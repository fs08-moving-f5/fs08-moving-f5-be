/**
 * @swagger
 * /api/estimate-request/user/pending:
 *   get:
 *     summary: 진행 중인 견적 요청 조회 (유저)
 *     tags: [EstimateReq]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 진행 중인 견적 요청 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 진행 중인 견적 요청 조회 성공
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
 *                         enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *                         example: HOME_MOVING
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
 *         description: 유저 인증 실패
 */

/**
 * @swagger
 * /api/estimate-request/user/request:
 *   post:
 *     summary: 견적 요청 (유저)
 *     tags: [EstimateReq]
 *     description:
 *       유저가 새로운 견적 요청을 생성합니다.
 *       - from, to는 카카오 우편번호 API의 Address 타입 마이너 버전입니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movingType
 *               - movingDate
 *               - from
 *               - to
 *             properties:
 *               movingType:
 *                 type: string
 *                 enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *                 example: HOME_MOVING
 *               movingDate:
 *                 type: string
 *                 format: date-time
 *               from:
 *                 type: object
 *                 required:
 *                   - zoneCode
 *                   - address
 *                   - addressEnglish
 *                   - sido
 *                   - sidoEnglish
 *                   - sigungu
 *                   - sigunguEnglish
 *                 properties:
 *                   zoneCode:
 *                      type: string
 *                      example: 06035
 *                   address:
 *                      type: string
 *                      example: 서울 강남구 가로수길 5
 *                   addressEnglish:
 *                      type: string
 *                      example: 5 Garosu-gil, Gangnam-gu, Seoul, Republic of Korea
 *                   sido:
 *                      type: string
 *                      example: 서울
 *                   sidoEnglish:
 *                      type: string
 *                      example: Seoul
 *                   sigungu:
 *                      type: string
 *                      example: 강남구
 *                   sigunguEnglish:
 *                      type: string
 *                      example: Gangnam-gu
 *               to:
 *                 type: object
 *                 required:
 *                   - zoneCode
 *                   - address
 *                   - addressEnglish
 *                   - sido
 *                   - sidoEnglish
 *                   - sigungu
 *                   - sigunguEnglish
 *                 properties:
 *                   zoneCode:
 *                      type: string
 *                      example: 06035
 *                   address:
 *                      type: string
 *                      example: 서울 강남구 가로수길 5
 *                   addressEnglish:
 *                      type: string
 *                      example: 5 Garosu-gil, Gangnam-gu, Seoul, Republic of Korea
 *                   sido:
 *                      type: string
 *                      example: 서울
 *                   sidoEnglish:
 *                      type: string
 *                      example: Seoul
 *                   sigungu:
 *                      type: string
 *                      example: 강남구
 *                   sigunguEnglish:
 *                      type: string
 *                      example: Gangnam-gu
 *     responses:
 *       200:
 *         description: 견적 요청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 견적 요청 성공
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "uuid-estimate-request-id"
 *                     name:
 *                       type: string
 *                       example: 홍길동
 *                     movingType:
 *                       type: string
 *                       enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *                       example: HOME_MOVING
 *                     movingDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-01T00:00:00.000Z"
 *                     isDesignated:
 *                       type: boolean
 *                       example: false
 *                     from:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         sido:
 *                           type: string
 *                           example: 서울특별시
 *                         sigungu:
 *                           type: string
 *                           example: 강남구
 *                     to:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         sido:
 *                           type: string
 *                           example: 부산광역시
 *                         sigungu:
 *                           type: string
 *                           example: 해운대구
 *       401:
 *         description: 유저 인증 실패
 *       400:
 *         description: 필수 데이터 누락
 *       409:
 *         description: 이미 진행 중인 견적 요청 존재
 */

/**
 * @swagger
 * /api/estimate-request/user/request/designated:
 *   post:
 *     summary: 지정 견적 요청 (유저)
 *     tags: [EstimateReq]
 *     description: |
 *       유저가 특정 기사에게 지정 견적 요청을 생성합니다.
 *       - designatedDriverId: 지정할 기사(User) id
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movingType
 *               - movingDate
 *               - from
 *               - to
 *               - designatedDriverId
 *             properties:
 *               movingType:
 *                 type: string
 *               movingDate:
 *                 type: string
 *                 format: date-time
 *               designatedDriverId:
 *                 type: string
 *                 example: "uuid-driver-user-id"
 *               from:
 *                 type: object
 *               to:
 *                 type: object
 *     responses:
 *       200:
 *         description: 지정 견적 요청 성공
 *       400:
 *         description: 필수 데이터 누락
 *       401:
 *         description: 유저 인증 실패
 *       404:
 *         description: 지정 기사 정보 없음
 *       409:
 *         description: 이미 진행 중인 견적 요청 존재
 */

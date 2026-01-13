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
 *     description: |
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
 * /api/estimate-request/user/request/geocode:
 *   post:
 *     summary: 견적 요청 생성 (좌표 변환 포함)
 *     tags: [EstimateReq]
 *     description: |
 *       유저가 새로운 견적 요청을 생성합니다. 주소를 자동으로 위도/경도로 변환하여 저장합니다.
 *       - 주소를 입력하면 자동으로 Kakao Geocoding API를 통해 위도/경도로 변환됩니다.
 *       - 변환된 좌표는 주변 견적 요청 조회 등에 활용됩니다.
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
 *                 description: 이사 유형
 *               movingDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-02-01T09:00:00.000Z"
 *                 description: 이사 예정일
 *               from:
 *                 type: object
 *                 required:
 *                   - address
 *                   - zoneCode
 *                   - addressEnglish
 *                   - sido
 *                   - sidoEnglish
 *                   - sigungu
 *                   - sigunguEnglish
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: "서울 강남구 가로수길 5"
 *                     description: 전체 주소
 *                   zoneCode:
 *                     type: number
 *                     example: 06035
 *                     description: 우편번호
 *                   addressEnglish:
 *                     type: string
 *                     example: "5 Garosu-gil, Gangnam-gu, Seoul, Republic of Korea"
 *                     description: 영문 주소
 *                   sido:
 *                     type: string
 *                     example: "서울"
 *                     description: 시도
 *                   sidoEnglish:
 *                     type: string
 *                     example: "Seoul"
 *                     description: 영문 시도
 *                   sigungu:
 *                     type: string
 *                     example: "강남구"
 *                     description: 시군구
 *                   sigunguEnglish:
 *                     type: string
 *                     example: "Gangnam-gu"
 *                     description: 영문 시군구
 *               to:
 *                 type: object
 *                 required:
 *                   - address
 *                   - zoneCode
 *                   - addressEnglish
 *                   - sido
 *                   - sidoEnglish
 *                   - sigungu
 *                   - sigunguEnglish
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: "부산 해운대구 해운대해변로 264"
 *                     description: 전체 주소
 *                   zoneCode:
 *                     type: number
 *                     example: 48058
 *                     description: 우편번호
 *                   addressEnglish:
 *                     type: string
 *                     example: "264 Haeundaehaebyeon-ro, Haeundae-gu, Busan, Republic of Korea"
 *                     description: 영문 주소
 *                   sido:
 *                     type: string
 *                     example: "부산"
 *                     description: 시도
 *                   sidoEnglish:
 *                     type: string
 *                     example: "Busan"
 *                     description: 영문 시도
 *                   sigungu:
 *                     type: string
 *                     example: "해운대구"
 *                     description: 시군구
 *                   sigunguEnglish:
 *                     type: string
 *                     example: "Haeundae-gu"
 *                     description: 영문 시군구
 *           examples:
 *             basic:
 *               summary: 기본 예시
 *               value:
 *                 movingType: "HOME_MOVING"
 *                 movingDate: "2026-02-01T09:00:00.000Z"
 *                 from:
 *                   address: "서울 강남구 가로수길 5"
 *                   zoneCode: 06035
 *                   addressEnglish: "5 Garosu-gil, Gangnam-gu, Seoul, Republic of Korea"
 *                   sido: "서울"
 *                   sidoEnglish: "Seoul"
 *                   sigungu: "강남구"
 *                   sigunguEnglish: "Gangnam-gu"
 *                 to:
 *                   address: "부산 해운대구 해운대해변로 264"
 *                   zoneCode: 48058
 *                   addressEnglish: "264 Haeundaehaebyeon-ro, Haeundae-gu, Busan, Republic of Korea"
 *                   sido: "부산"
 *                   sidoEnglish: "Busan"
 *                   sigungu: "해운대구"
 *                   sigunguEnglish: "Haeundae-gu"
 *     responses:
 *       201:
 *         description: 견적 요청 생성 성공 (좌표 변환 완료)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                   description: 요청 성공 여부
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                       description: 견적 요청 ID
 *                     name:
 *                       type: string
 *                       example: "홍길동"
 *                       description: 유저 이름
 *                     movingType:
 *                       type: string
 *                       enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *                       example: "HOME_MOVING"
 *                       description: 이사 유형
 *                     movingDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-02-01T09:00:00.000Z"
 *                       description: 이사 예정일
 *                     from:
 *                       type: string
 *                       nullable: true
 *                       example: "서울 강남구 가로수길 5"
 *                       description: 출발지 주소
 *                     to:
 *                       type: string
 *                       nullable: true
 *                       example: "부산 해운대구 해운대해변로 264"
 *                       description: 도착지 주소
 *             examples:
 *               success:
 *                 summary: 성공 응답 예시
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "123e4567-e89b-12d3-a456-426614174000"
 *                     name: "홍길동"
 *                     movingType: "HOME_MOVING"
 *                     movingDate: "2026-02-01T09:00:00.000Z"
 *                     from: "서울 강남구 가로수길 5"
 *                     to: "부산 해운대구 해운대해변로 264"
 *       400:
 *         description: 잘못된 요청입니다. 요청 본문이 유효하지 않습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 에러 메시지 (한국어로 제공되며, 필드명과 함께 표시될 수 있음)
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP 상태 코드
 *                 name:
 *                   type: string
 *                   description: 에러 이름
 *             examples:
 *               missingData:
 *                 summary: 필수 데이터 누락
 *                 value:
 *                   message: "필수 데이터가 누락되었습니다."
 *                   statusCode: 400
 *                   name: "AppError"
 *               invalidField:
 *                 summary: 필드 검증 실패
 *                 value:
 *                   message: "movingType: Invalid enum value"
 *                   statusCode: 400
 *                   name: "AppError"
 *       401:
 *         description: 인증이 필요합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 name:
 *                   type: string
 *             examples:
 *               unauthorized:
 *                 summary: 인증되지 않은 사용자
 *                 value:
 *                   message: "유저 로그인이 필요합니다."
 *                   statusCode: 401
 *                   name: "AppError"
 *       409:
 *         description: 이미 진행 중인 견적 요청이 있습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 name:
 *                   type: string
 *             examples:
 *               conflict:
 *                 summary: 진행 중인 견적 요청 존재
 *                 value:
 *                   message: "이미 진행 중인 견적 요청이 있습니다."
 *                   statusCode: 409
 *                   name: "AppError"
 *       500:
 *         description: 서버 내부 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 name:
 *                   type: string
 *             examples:
 *               geocodingFailed:
 *                 summary: 주소 변환 실패
 *                 value:
 *                   message: "주소 변환에 실패했습니다."
 *                   statusCode: 500
 *                   name: "AppError"
 *               serverError:
 *                 summary: 서버 오류
 *                 value:
 *                   message: "서버 내부 오류가 발생했습니다."
 *                   statusCode: 500
 *                   name: "AppError"
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

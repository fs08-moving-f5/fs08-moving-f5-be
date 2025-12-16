/**
 * @swagger
 * components:
 *   schemas:
 *     FavoriteDriver:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 즐겨찾기 ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         userId:
 *           type: string
 *           format: uuid
 *           description: 사용자 ID
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *         driverId:
 *           type: string
 *           format: uuid
 *           description: 드라이버(기사) ID
 *           example: "123e4567-e89b-12d3-a456-426614174002"
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
 *     DriverProfileInfo:
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
 *         description:
 *           type: string
 *           nullable: true
 *           description: 상세 설명
 *           example: "10년 이상의 경력을 가진 전문 이사 기사입니다."
 *         tasksCount:
 *           type: integer
 *           description: 확정된 견적 수
 *           example: 150
 *         favoriteCount:
 *           type: integer
 *           description: 찜하기 수
 *           example: 45
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성 일시
 *           example: "2024-01-10T09:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정 일시
 *           example: "2024-01-15T10:00:00Z"
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
 *
 *     FavoriteDriverWithDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 즐겨찾기 ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         userId:
 *           type: string
 *           format: uuid
 *           description: 사용자 ID
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *         driverId:
 *           type: string
 *           format: uuid
 *           description: 드라이버(기사) ID
 *           example: "123e4567-e89b-12d3-a456-426614174002"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성 일시
 *           example: "2024-01-15T10:30:00Z"
 *         driver:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               description: 드라이버 ID
 *               example: "123e4567-e89b-12d3-a456-426614174002"
 *             driverProfile:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DriverProfileInfo'
 *               description: 드라이버 프로필 정보 목록
 *             reviews:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReviewInfo'
 *               description: 리뷰 목록
 *           description: 드라이버 정보
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
 *           description: 다음 페이지 커서 (다음 페이지가 없으면 null)
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *
 *     DeleteResponse:
 *       type: object
 *       properties:
 *         removed:
 *           type: boolean
 *           description: 삭제 성공 여부
 *           example: true
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
 *   parameters:
 *     driverId:
 *       in: path
 *       name: driverId
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       description: 드라이버(기사) ID
 *       example: "123e4567-e89b-12d3-a456-426614174002"
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
 *         default: 10
 *       description: |
 *         조회할 항목 수 (기본값: 10)
 *         한 번에 가져올 즐겨찾기 항목의 개수를 지정합니다.
 *         최소값은 1이며, 생략 시 기본값 10이 적용됩니다.
 *       example: 10
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT 토큰 인증
 *
 * tags:
 *   - name: Favorite
 *     description: 즐겨찾기(기사 찜하기) 관련 API
 */

/**
 * @swagger
 * /api/favorite:
 *   get:
 *     tags:
 *       - Favorite
 *     summary: 찜한 기사 목록 조회
 *     description: |
 *       현재 사용자가 찜한 기사 목록을 조회합니다.
 *       커서 기반 페이지네이션을 지원하며, 각 기사 정보에는 드라이버 프로필, 리뷰, 확정된 견적 수, 찜하기 수가 포함됩니다.
 *
 *       **쿼리 파라미터:**
 *       - `cursor` (선택): 다음 페이지 조회를 위한 커서 값. 이전 응답의 `pagination.nextCursor` 값을 사용합니다.
 *       - `limit` (선택): 조회할 항목 수. 기본값은 10입니다.
 *
 *       **사용 예시:**
 *       - 첫 페이지: `GET /api/favorite?limit=10`
 *       - 다음 페이지: `GET /api/favorite?cursor=123e4567-e89b-12d3-a456-426614174000&limit=10`
 *     operationId: getFavoriteDrivers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/cursorQuery'
 *       - $ref: '#/components/parameters/limitQuery'
 *     responses:
 *       '200':
 *         description: 성공적으로 찜한 기사 목록을 조회했습니다.
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
 *                         $ref: '#/components/schemas/FavoriteDriverWithDetails'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationInfo'
 *             examples:
 *               success:
 *                 summary: 성공 응답 예시
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "123e4567-e89b-12d3-a456-426614174000"
 *                       userId: "123e4567-e89b-12d3-a456-426614174001"
 *                       driverId: "123e4567-e89b-12d3-a456-426614174002"
 *                       createdAt: "2024-01-15T10:30:00Z"
 *                       driver:
 *                         id: "123e4567-e89b-12d3-a456-426614174002"
 *                         driverProfile:
 *                           - id: "123e4567-e89b-12d3-a456-426614174003"
 *                             imageUrl: "https://example.com/image.jpg"
 *                             career: "5년차 전문 이사 기사"
 *                             shortIntro: "안전하고 신속한 이사를 약속드립니다"
 *                             description: "10년 이상의 경력을 가진 전문 이사 기사입니다."
 *                             tasksCount: 150
 *                             favoriteCount: 45
 *                             createdAt: "2024-01-10T09:00:00Z"
 *                             updatedAt: "2024-01-15T10:00:00Z"
 *                         reviews:
 *                           - id: "123e4567-e89b-12d3-a456-426614174004"
 *                             rating: 5
 *                   pagination:
 *                     hasNext: true
 *                     nextCursor: "123e4567-e89b-12d3-a456-426614174005"
 *               empty:
 *                 summary: 찜한 기사가 없는 경우
 *                 value:
 *                   success: true
 *                   data: []
 *                   pagination:
 *                     hasNext: false
 *                     nextCursor: null
 *       '400':
 *         description: 잘못된 요청입니다. userId가 필요합니다.
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
 * /api/favorite/driver:
 *   delete:
 *     tags:
 *       - Favorite
 *     summary: 여러 기사 즐겨찾기 일괄 삭제
 *     description: |
 *       현재 사용자가 찜한 여러 기사를 한 번에 삭제합니다.
 *       요청 본문에 삭제할 기사 ID 배열을 전달합니다.
 *     operationId: deleteManyFavoriteDrivers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *               format: uuid
 *             description: 삭제할 드라이버 ID 배열
 *             minItems: 1
 *           examples:
 *             example:
 *               summary: 삭제할 기사 ID 배열 예시
 *               value:
 *                 - "123e4567-e89b-12d3-a456-426614174002"
 *                 - "123e4567-e89b-12d3-a456-426614174003"
 *     responses:
 *       '200':
 *         description: 성공적으로 즐겨찾기를 삭제했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DeleteResponse'
 *             examples:
 *               success:
 *                 summary: 성공 응답 예시
 *                 value:
 *                   success: true
 *                   data:
 *                     removed: true
 *       '400':
 *         description: 잘못된 요청입니다. userId가 필요하거나 1개 이상의 driverId가 필요합니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingUserId:
 *                 summary: userId가 없는 경우
 *                 value:
 *                   message: userId가 필요합니다.
 *               emptyDriverIds:
 *                 summary: driverId 배열이 비어있는 경우
 *                 value:
 *                   message: 1개 이상의 driverId가 필요합니다.
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
 * /api/favorite/driver/{driverId}:
 *   post:
 *     tags:
 *       - Favorite
 *     summary: 기사 즐겨찾기 추가
 *     description: |
 *       특정 기사를 즐겨찾기에 추가합니다.
 *       이미 찜한 기사인 경우 409 Conflict 에러가 반환됩니다.
 *     operationId: addFavoriteDriver
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/driverId'
 *     responses:
 *       '201':
 *         description: 성공적으로 즐겨찾기에 추가했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FavoriteDriver'
 *             examples:
 *               success:
 *                 summary: 성공 응답 예시
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "123e4567-e89b-12d3-a456-426614174000"
 *                     userId: "123e4567-e89b-12d3-a456-426614174001"
 *                     driverId: "123e4567-e89b-12d3-a456-426614174002"
 *                     createdAt: "2024-01-15T10:30:00Z"
 *                     updatedAt: "2024-01-15T10:30:00Z"
 *       '400':
 *         description: 잘못된 요청입니다. userId 또는 driverId가 필요합니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingParams:
 *                 summary: 필수 파라미터가 없는 경우
 *                 value:
 *                   message: userId 또는 driverId가 필요합니다.
 *       '401':
 *         description: 인증되지 않은 사용자입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '409':
 *         description: 이미 찜한 기사입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               alreadyFavorite:
 *                 summary: 이미 찜한 기사인 경우
 *                 value:
 *                   message: 이미 찜한 기사입니다.
 *       '500':
 *         description: 서버 내부 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/favorite/driver/{driverId}:
 *   delete:
 *     tags:
 *       - Favorite
 *     summary: 기사 즐겨찾기 삭제
 *     description: |
 *       특정 기사를 즐겨찾기에서 삭제합니다.
 *       존재하지 않는 즐겨찾기인 경우에도 성공으로 처리됩니다 (removed: false 반환).
 *     operationId: deleteFavoriteDriver
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/driverId'
 *     responses:
 *       '200':
 *         description: 성공적으로 즐겨찾기를 삭제했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DeleteResponse'
 *             examples:
 *               success:
 *                 summary: 성공 응답 예시
 *                 value:
 *                   success: true
 *                   data:
 *                     removed: true
 *               notFound:
 *                 summary: 존재하지 않는 즐겨찾기인 경우
 *                 value:
 *                   success: true
 *                   data:
 *                     removed: false
 *       '400':
 *         description: 잘못된 요청입니다. userId 또는 driverId가 필요합니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingParams:
 *                 summary: 필수 파라미터가 없는 경우
 *                 value:
 *                   message: userId 또는 driverId가 필요합니다.
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

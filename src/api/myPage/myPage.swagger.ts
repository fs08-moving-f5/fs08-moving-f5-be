/**
 * @swagger
 * components:
 *   schemas:
 *     MyPageData:
 *       type: object
 *       properties:
 *         profile:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               description: 드라이버 ID
 *               example: "123e4567-e89b-12d3-a456-426614174000"
 *             name:
 *               type: string
 *               description: 드라이버 이름
 *               example: "김코드"
 *             imageUrl:
 *               type: string
 *               format: uri
 *               nullable: true
 *               description: 프로필 이미지 URL
 *               example: "https://example.com/profile.jpg"
 *             career:
 *               type: integer
 *               nullable: true
 *               description: 경력 (년)
 *               example: 7
 *             shortIntro:
 *               type: string
 *               nullable: true
 *               description: 한줄 소개
 *               example: "친절하고 신속한 이사 서비스를 제공합니다"
 *             description:
 *               type: string
 *               nullable: true
 *               description: 상세 설명
 *               example: "고객님의 물품을 소중하고 안전하게 운송하여 드립니다..."
 *             services:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *               description: 제공 서비스 목록
 *               example: ["SMALL_MOVING", "HOME_MOVING"]
 *             regions:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [서울, 경기, 인천, 강원, 충북, 충남, 대전, 세종, 전북, 전남, 광주, 경북, 경남, 대구, 부산, 울산, 제주]
 *               description: 서비스 가능 지역
 *               example: ["서울", "경기"]
 *         activity:
 *           type: object
 *           properties:
 *             completedCount:
 *               type: integer
 *               description: 완료된 이사 건수
 *               example: 334
 *             averageRating:
 *               type: number
 *               format: float
 *               description: 평균 별점
 *               example: 5.0
 *             career:
 *               type: integer
 *               nullable: true
 *               description: 경력 (년)
 *               example: 7
 *         reviewDistribution:
 *           type: object
 *           properties:
 *             1:
 *               type: integer
 *               description: 1점 리뷰 개수
 *               example: 0
 *             2:
 *               type: integer
 *               description: 2점 리뷰 개수
 *               example: 0
 *             3:
 *               type: integer
 *               description: 3점 리뷰 개수
 *               example: 0
 *             4:
 *               type: integer
 *               description: 4점 리뷰 개수
 *               example: 8
 *             5:
 *               type: integer
 *               description: 5점 리뷰 개수
 *               example: 170
 *
 *     MyPageReview:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 리뷰 ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         rating:
 *           type: integer
 *           nullable: true
 *           minimum: 1
 *           maximum: 5
 *           description: 별점
 *           example: 5
 *         content:
 *           type: string
 *           nullable: true
 *           description: 리뷰 내용
 *           example: "토탈데포 정말 친절하시고 물건도 잘 옮겨주셨어요~~"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 리뷰 작성 일시
 *           example: "2024-07-01T00:00:00Z"
 *         userName:
 *           type: string
 *           description: 리뷰 작성자 이름
 *           example: "kim****"
 *
 *     MyPageReviewsResponse:
 *       type: object
 *       properties:
 *         reviews:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MyPageReview'
 *         pagination:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: integer
 *               description: 현재 페이지 번호
 *               example: 1
 *             totalPages:
 *               type: integer
 *               description: 전체 페이지 수
 *               example: 18
 *             totalItems:
 *               type: integer
 *               description: 전체 리뷰 개수
 *               example: 178
 *             itemsPerPage:
 *               type: integer
 *               description: 페이지당 아이템 수
 *               example: 10
 */

/**
 * @swagger
 * /api/my-page:
 *   get:
 *     summary: 드라이버 마이페이지 전체 데이터 조회
 *     description: 로그인한 드라이버의 프로필, 활동 현황, 리뷰 분포를 조회합니다
 *     tags:
 *       - MyPage
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 마이페이지 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MyPageData'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "인증이 필요합니다"
 *       403:
 *         description: 권한 없음 (드라이버가 아닌 경우)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "드라이버만 접근할 수 있습니다"
 *       404:
 *         description: 드라이버를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "드라이버를 찾을 수 없습니다"
 */

/**
 * @swagger
 * /api/my-page/reviews:
 *   get:
 *     summary: 드라이버 마이페이지 리뷰 목록 조회
 *     description: 로그인한 드라이버의 리뷰 목록을 페이지네이션하여 조회합니다
 *     tags:
 *       - MyPage
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 페이지 번호
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 페이지당 아이템 수
 *         example: 10
 *     responses:
 *       200:
 *         description: 리뷰 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MyPageReviewsResponse'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "인증이 필요합니다"
 *       403:
 *         description: 권한 없음 (드라이버가 아닌 경우)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "드라이버만 접근할 수 있습니다"
 */

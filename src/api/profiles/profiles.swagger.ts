/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 프로필 ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         userId:
 *           type: string
 *           format: uuid
 *           description: 사용자 ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         imageUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: 프로필 이미지 URL
 *           example: "https://example.com/profile.jpg"
 *         regions:
 *           type: array
 *           items:
 *             type: string
 *             enum: [서울, 경기, 인천, 강원, 충북, 충남, 대전, 세종, 전북, 전남, 광주, 경북, 경남, 대구, 부산, 울산, 제주]
 *           description: 희망 지역 목록
 *           example: ["서울", "경기"]
 *         services:
 *           type: array
 *           items:
 *             type: string
 *             enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *           description: 희망 서비스 목록
 *           example: ["HOME_MOVING"]
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
 *     DriverProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 프로필 ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         driverId:
 *           type: string
 *           format: uuid
 *           description: 기사 ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         imageUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: 프로필 이미지 URL
 *           example: "https://example.com/driver.jpg"
 *         career:
 *           type: string
 *           nullable: true
 *           description: 경력
 *           maxLength: 500
 *           example: "10년 이상 이사 경력"
 *         shortIntro:
 *           type: string
 *           nullable: true
 *           description: 한줄 소개
 *           maxLength: 100
 *           example: "친절하고 신속한 이사 서비스를 제공합니다"
 *         description:
 *           type: string
 *           nullable: true
 *           description: 상세 설명
 *           maxLength: 2000
 *           example: "고객님의 소중한 짐을 안전하게 운반해드립니다..."
 *         regions:
 *           type: array
 *           items:
 *             type: string
 *             enum: [서울, 경기, 인천, 강원, 충북, 충남, 대전, 세종, 전북, 전남, 광주, 경북, 경남, 대구, 부산, 울산, 제주]
 *           description: 가능 지역 목록
 *           example: ["서울", "경기", "인천"]
 *         services:
 *           type: array
 *           items:
 *             type: string
 *             enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *           description: 제공 서비스 목록
 *           example: ["HOME_MOVING", "OFFICE_MOVING"]
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
 *     CreateUserProfileRequest:
 *       type: object
 *       required:
 *         - regions
 *         - services
 *       properties:
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: 프로필 이미지 URL
 *           example: "https://example.com/profile.jpg"
 *         regions:
 *           type: array
 *           items:
 *             type: string
 *             enum: [서울, 경기, 인천, 강원, 충북, 충남, 대전, 세종, 전북, 전남, 광주, 경북, 경남, 대구, 부산, 울산, 제주]
 *           minItems: 1
 *           maxItems: 17
 *           description: 희망 지역 목록 (최소 1개)
 *           example: ["서울", "경기"]
 *         services:
 *           type: array
 *           items:
 *             type: string
 *             enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *           minItems: 1
 *           maxItems: 3
 *           description: 희망 서비스 목록 (최소 1개)
 *           example: ["HOME_MOVING"]
 *
 *     UpdateUserProfileRequest:
 *       type: object
 *       properties:
 *         imageUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: 프로필 이미지 URL
 *           example: "https://example.com/profile.jpg"
 *         regions:
 *           type: array
 *           items:
 *             type: string
 *             enum: [서울, 경기, 인천, 강원, 충북, 충남, 대전, 세종, 전북, 전남, 광주, 경북, 경남, 대구, 부산, 울산, 제주]
 *           minItems: 1
 *           maxItems: 17
 *           description: 희망 지역 목록
 *           example: ["서울", "경기", "인천"]
 *         services:
 *           type: array
 *           items:
 *             type: string
 *             enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *           minItems: 1
 *           maxItems: 3
 *           description: 희망 서비스 목록
 *           example: ["HOME_MOVING", "OFFICE_MOVING"]
 *
 *     CreateDriverProfileRequest:
 *       type: object
 *       required:
 *         - regions
 *         - services
 *       properties:
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: 프로필 이미지 URL
 *           example: "https://example.com/driver.jpg"
 *         career:
 *           type: string
 *           maxLength: 500
 *           description: 경력
 *           example: "10년 이상 이사 경력"
 *         shortIntro:
 *           type: string
 *           maxLength: 100
 *           description: 한줄 소개
 *           example: "친절하고 신속한 이사 서비스를 제공합니다"
 *         description:
 *           type: string
 *           maxLength: 2000
 *           description: 상세 설명
 *           example: "고객님의 소중한 짐을 안전하게 운반해드립니다..."
 *         regions:
 *           type: array
 *           items:
 *             type: string
 *             enum: [서울, 경기, 인천, 강원, 충북, 충남, 대전, 세종, 전북, 전남, 광주, 경북, 경남, 대구, 부산, 울산, 제주]
 *           minItems: 1
 *           maxItems: 17
 *           description: 가능 지역 목록 (최소 1개)
 *           example: ["서울", "경기", "인천"]
 *         services:
 *           type: array
 *           items:
 *             type: string
 *             enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *           minItems: 1
 *           maxItems: 3
 *           description: 제공 서비스 목록 (최소 1개)
 *           example: ["HOME_MOVING", "OFFICE_MOVING"]
 *
 *     UpdateDriverProfileRequest:
 *       type: object
 *       properties:
 *         imageUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: 프로필 이미지 URL
 *           example: "https://example.com/driver.jpg"
 *         career:
 *           type: string
 *           nullable: true
 *           maxLength: 500
 *           description: 경력
 *           example: "10년 이상 이사 경력"
 *         shortIntro:
 *           type: string
 *           nullable: true
 *           maxLength: 100
 *           description: 한줄 소개
 *           example: "친절하고 신속한 이사 서비스를 제공합니다"
 *         description:
 *           type: string
 *           nullable: true
 *           maxLength: 2000
 *           description: 상세 설명
 *           example: "고객님의 소중한 짐을 안전하게 운반해드립니다..."
 *         regions:
 *           type: array
 *           items:
 *             type: string
 *             enum: [서울, 경기, 인천, 강원, 충북, 충남, 대전, 세종, 전북, 전남, 광주, 경북, 경남, 대구, 부산, 울산, 제주]
 *           minItems: 1
 *           maxItems: 17
 *           description: 가능 지역 목록
 *           example: ["서울", "경기", "인천", "강원"]
 *         services:
 *           type: array
 *           items:
 *             type: string
 *             enum: [SMALL_MOVING, HOME_MOVING, OFFICE_MOVING]
 *           minItems: 1
 *           maxItems: 3
 *           description: 제공 서비스 목록
 *           example: ["SMALL_MOVING", "HOME_MOVING", "OFFICE_MOVING"]
 *
 * /api/profile/me:
 *   get:
 *     summary: 내 프로필 조회 (유저 타입 자동 판별)
 *     description: 로그인한 사용자의 프로필을 조회합니다. 유저 타입에 따라 UserProfile 또는 DriverProfile을 반환합니다.
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/UserProfile'
 *                     - $ref: '#/components/schemas/DriverProfile'
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 프로필을 찾을 수 없음
 *
 * /api/profile/user:
 *   get:
 *     summary: 유저 프로필 조회
 *     description: 일반 유저의 프로필을 조회합니다.
 *     tags:
 *       - Profiles - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 일반 유저만 접근 가능
 *       404:
 *         description: 프로필을 찾을 수 없음
 *
 *   post:
 *     summary: 유저 프로필 생성
 *     description: 일반 유저의 프로필을 생성합니다.
 *     tags:
 *       - Profiles - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserProfileRequest'
 *     responses:
 *       201:
 *         description: 프로필 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 일반 유저만 접근 가능
 *       409:
 *         description: 이미 프로필이 존재함
 *
 *   patch:
 *     summary: 유저 프로필 수정
 *     description: 일반 유저의 프로필을 수정합니다.
 *     tags:
 *       - Profiles - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserProfileRequest'
 *     responses:
 *       200:
 *         description: 프로필 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 일반 유저만 접근 가능
 *       404:
 *         description: 프로필을 찾을 수 없음
 *
 * /api/profile/driver:
 *   get:
 *     summary: 기사 프로필 조회
 *     description: 기사의 프로필을 조회합니다.
 *     tags:
 *       - Profiles - Driver
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DriverProfile'
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 기사만 접근 가능
 *       404:
 *         description: 프로필을 찾을 수 없음
 *
 *   post:
 *     summary: 기사 프로필 생성
 *     description: 기사의 프로필을 생성합니다.
 *     tags:
 *       - Profiles - Driver
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDriverProfileRequest'
 *     responses:
 *       201:
 *         description: 프로필 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DriverProfile'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 기사만 접근 가능
 *       409:
 *         description: 이미 프로필이 존재함
 *
 *   patch:
 *     summary: 기사 프로필 수정
 *     description: 기사의 프로필을 수정합니다.
 *     tags:
 *       - Profiles - Driver
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDriverProfileRequest'
 *     responses:
 *       200:
 *         description: 프로필 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DriverProfile'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 기사만 접근 가능
 *       404:
 *         description: 프로필을 찾을 수 없음
 */

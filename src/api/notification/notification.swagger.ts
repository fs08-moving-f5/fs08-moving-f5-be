/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 알림 ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         type:
 *           type: string
 *           enum: [REQUEST_SENT, REQUEST_REJECTED, REQUEST_CANCELLED, ESTIMATE_RECEIVED, ESTIMATE_CONFIRMED, ESTIMATE_REJECTED, ESTIMATE_EXPIRED, NEW_REVIEW]
 *           description: 알림 유형
 *           example: "ESTIMATE_RECEIVED"
 *         message:
 *           type: string
 *           description: 알림 메시지
 *           example: "새로운 견적이 도착했습니다."
 *         isRead:
 *           type: boolean
 *           description: 읽음 여부
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성 일시
 *           example: "2024-01-15T10:30:00Z"
 *
 *     NotificationType:
 *       type: string
 *       enum: [REQUEST_SENT, REQUEST_REJECTED, REQUEST_CANCELLED, ESTIMATE_RECEIVED, ESTIMATE_CONFIRMED, ESTIMATE_REJECTED, ESTIMATE_EXPIRED, NEW_REVIEW]
 *       description: |
 *         알림 유형
 *         - REQUEST_SENT: 유저가 견적 요청을 보냄
 *         - REQUEST_REJECTED: 유저가 견적을 거절
 *         - REQUEST_CANCELLED: 유저가 견적 요청을 취소
 *         - ESTIMATE_RECEIVED: 기사가 견적을 작성하여 유저에게 도착
 *         - ESTIMATE_CONFIRMED: 유저가 견적서를 보고 견적 확정
 *         - ESTIMATE_REJECTED: 기사가 요청을 거절(반려 사유)
 *         - ESTIMATE_EXPIRED: 견적 시간 만료
 *         - NEW_REVIEW: 새 리뷰 등록
 *
 *     UnreadCountEvent:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           description: 읽지 않은 알림 개수
 *           example: 5
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
 *     notificationId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       description: 알림 ID
 *       example: "123e4567-e89b-12d3-a456-426614174000"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT 토큰 인증
 *
 * tags:
 *   - name: Notification
 *     description: 알림 관련 API
 */

/**
 * @swagger
 * /api/notification/stream:
 *   get:
 *     tags:
 *       - Notification
 *     summary: 알림 스트림 연결 (Server-Sent Events)
 *     description: |
 *       Server-Sent Events (SSE)를 통해 실시간으로 알림을 수신합니다.
 *       연결이 성립되면 즉시 읽지 않은 알림 개수를 전송하며,
 *       이후 30초마다 heartbeat 메시지를 전송하여 연결을 유지합니다.
 *       클라이언트가 연결을 종료하면 자동으로 스트림이 해제됩니다.
 *     operationId: getNotificationStream
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: SSE 스트림 연결 성공
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *             examples:
 *               unreadCount:
 *                 summary: 읽지 않은 알림 개수 이벤트
 *                 value: |
 *                   event: unreadCount
 *                   data: {"count":5}
 *               heartbeat:
 *                 summary: Heartbeat 메시지
 *                 value: |
 *                   : ping
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
 * /api/notification:
 *   get:
 *     tags:
 *       - Notification
 *     summary: 알림 목록 조회
 *     description: |
 *       현재 사용자의 읽지 않은 알림 목록을 최신순으로 조회합니다.
 *       최대 30개의 알림을 반환하며, 삭제되지 않은 읽지 않은 알림만 조회됩니다.
 *     operationId: getNotifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: 성공적으로 알림 목록을 조회했습니다.
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
 *                         $ref: '#/components/schemas/Notification'
 *             examples:
 *               success:
 *                 summary: 성공 응답 예시
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "123e4567-e89b-12d3-a456-426614174000"
 *                       type: "ESTIMATE_RECEIVED"
 *                       message: "새로운 견적이 도착했습니다."
 *                       isRead: false
 *                       createdAt: "2024-01-15T10:30:00Z"
 *                     - id: "123e4567-e89b-12d3-a456-426614174001"
 *                       type: "ESTIMATE_CONFIRMED"
 *                       message: "견적이 확정되었습니다."
 *                       isRead: false
 *                       createdAt: "2024-01-15T09:15:00Z"
 *               empty:
 *                 summary: 알림이 없는 경우
 *                 value:
 *                   success: true
 *                   data: []
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
 * /api/notification/{id}:
 *   patch:
 *     tags:
 *       - Notification
 *     summary: 알림 읽음 처리
 *     description: |
 *       특정 알림을 읽음 처리합니다.
 *       알림이 읽음 처리되면 읽지 않은 알림 개수가 업데이트되어
 *       SSE 스트림을 통해 클라이언트에 자동으로 전송됩니다.
 *     operationId: readNotification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/notificationId'
 *     responses:
 *       '200':
 *         description: 성공적으로 알림을 읽음 처리했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: "null"
 *             examples:
 *               success:
 *                 summary: 성공 응답 예시
 *                 value:
 *                   success: true
 *                   data: null
 *       '400':
 *         description: 잘못된 요청입니다. notificationId가 유효하지 않습니다.
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
 *       '404':
 *         description: 알림을 찾을 수 없습니다.
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

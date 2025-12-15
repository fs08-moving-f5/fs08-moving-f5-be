/**
 * @swagger
 * tags:
 *   name: Favorite
 *   description: 즐겨찾기(기사 찜하기) API
 */

/**
 * @swagger
 * /favorite/driver/{driverId}:
 *   post:
 *     summary: 기사 즐겨찾기 추가
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *         description: 즐겨찾기할 기사 ID
 *     responses:
 *       201:
 *         description: 즐겨찾기 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: 즐겨찾기 ID
 *                     userId:
 *                       type: string
 *                       description: 사용자 ID
 *                     driverId:
 *                       type: string
 *                       description: 기사 ID
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 잘못된 요청 (userId 또는 driverId가 없음)
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
 *                   example: userId 또는 driverId가 필요합니다.
 *       409:
 *         description: 이미 찜한 기사입니다
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
 *                   example: 이미 찜한 기사입니다.
 */

/**
 * @swagger
 * /favorite/driver/{driverId}:
 *   delete:
 *     summary: 기사 즐겨찾기 삭제
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *         description: 즐겨찾기에서 삭제할 기사 ID
 *     responses:
 *       200:
 *         description: 즐겨찾기 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     removed:
 *                       type: boolean
 *                       description: 삭제 성공 여부
 *                       example: true
 *       400:
 *         description: 잘못된 요청 (userId 또는 driverId가 없음)
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
 *                   example: userId 또는 driverId가 필요합니다.
 */

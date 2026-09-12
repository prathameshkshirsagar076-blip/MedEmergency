const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * @swagger
 * /api/requests/create:
 *   post:
 *     summary: Broadcast an emergency medicine request to nearby pharmacies
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patient_lat, patient_lng]
 *             properties:
 *               prescription_id:
 *                 type: integer
 *                 example: 1
 *               is_emergency:
 *                 type: boolean
 *                 example: true
 *               patient_lat:
 *                 type: number
 *                 example: 18.5204
 *               patient_lng:
 *                 type: number
 *                 example: 73.8567
 *               search_radius_km:
 *                 type: number
 *                 example: 10
 *     responses:
 *       201:
 *         description: Emergency request created and broadcasted via Socket.io
 */
router.post('/create', authenticateToken, requestController.createRequest);

/**
 * @swagger
 * /api/requests/my-requests:
 *   get:
 *     summary: Get request history for the logged-in patient
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patient's emergency requests
 *       403:
 *         description: Requires patient role
 */
router.get('/my-requests', authenticateToken, requireRole('patient'), requestController.getMyPatientRequests);

/**
 * @swagger
 * /api/requests/store/active:
 *   get:
 *     summary: Get active incoming emergency broadcasts in pharmacy's zone
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active incoming requests
 *       403:
 *         description: Requires store role
 */
router.get('/store/active', authenticateToken, requireRole('store'), requestController.getStoreActiveRequests);

/**
 * @swagger
 * /api/requests/store/history:
 *   get:
 *     summary: Get history of requests responded to by this pharmacy
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of past responded requests
 *       403:
 *         description: Requires store role
 */
router.get('/store/history', authenticateToken, requireRole('store'), requestController.getStoreHistory);

/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     summary: Get emergency request status, details, and responding pharmacies by ID
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request tracking details returned
 *       404:
 *         description: Request not found
 */
router.get('/:id', authenticateToken, requestController.getRequestById);

/**
 * @swagger
 * /api/requests/{id}/respond:
 *   put:
 *     summary: Pharmacy responds Available or Not Available to emergency request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [response]
 *             properties:
 *               response:
 *                 type: string
 *                 enum: [available, not_available]
 *                 example: available
 *               notes:
 *                 type: string
 *                 example: In stock, ready for immediate pickup.
 *     responses:
 *       200:
 *         description: Response recorded and live match event emitted to patient
 */
router.put('/:id/respond', authenticateToken, requireRole('store'), requestController.respondToRequest);

/**
 * @swagger
 * /api/requests/{id}/resolve:
 *   put:
 *     summary: Mark emergency request as resolved/fulfilled
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request resolved
 */
router.put('/:id/resolve', authenticateToken, requestController.resolveRequest);

/**
 * @swagger
 * /api/requests/{id}/expand-radius:
 *   put:
 *     summary: Dynamically expand emergency radar search radius (e.g. 5km -> 10km -> 15km)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               search_radius_km:
 *                 type: number
 *                 example: 15
 *     responses:
 *       200:
 *         description: Search radius expanded and new pharmacies alerted
 */
router.put('/:id/expand-radius', authenticateToken, requestController.expandRadius);

module.exports = router;

const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * @swagger
 * /api/stores/nearby:
 *   get:
 *     summary: Discover nearby verified medical stores via Haversine geolocation
 *     tags: [Stores]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         example: 18.5204
 *         description: Latitude of user/patient
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         example: 73.8567
 *         description: Longitude of user/patient
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         example: 10
 *         description: Search radius in kilometers (default 10)
 *     responses:
 *       200:
 *         description: List of approved, online stores sorted by distance
 */
router.get('/nearby', storeController.getNearbyStores);

/**
 * @swagger
 * /api/stores/profile:
 *   get:
 *     summary: Get logged-in pharmacy store profile details
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Store profile details returned
 *       403:
 *         description: Requires store role
 */
router.get('/profile', authenticateToken, requireRole('store'), storeController.getStoreProfile);

/**
 * @swagger
 * /api/stores/register:
 *   post:
 *     summary: Submit pharmacy store registration profile
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [store_name, license_number, address]
 *             properties:
 *               store_name:
 *                 type: string
 *                 example: Apollo 24/7 Pharmacy
 *               license_number:
 *                 type: string
 *                 example: MH-PUN-2026-88912
 *               address:
 *                 type: string
 *                 example: Shop 12, Main Road, Pune
 *               latitude:
 *                 type: number
 *                 example: 18.5204
 *               longitude:
 *                 type: number
 *                 example: 73.8567
 *               phone:
 *                 type: string
 *                 example: "+91 9876543210"
 *               operating_hours:
 *                 type: string
 *                 example: 24 Hours / 7 Days
 *     responses:
 *       201:
 *         description: Store registered (pending admin review)
 */
router.post('/register', authenticateToken, storeController.registerStore);

/**
 * @swagger
 * /api/stores/status:
 *   put:
 *     summary: Toggle pharmacy online/offline dispatch receiving status
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_online:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Store status toggled successfully
 */
router.put('/status', authenticateToken, requireRole('store'), storeController.updateOnlineStatus);

// Admin endpoints
/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: List all pharmacy stores with verification status (Admin only)
 *     tags: [Admin, Stores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Full list of stores
 *       403:
 *         description: Requires admin role
 */
router.get('/', authenticateToken, requireRole('admin'), storeController.getAllStores);

/**
 * @swagger
 * /api/stores/{id}/approve:
 *   put:
 *     summary: Approve or revoke pharmacy drug license (Admin only)
 *     tags: [Admin, Stores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Store ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_approved:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: License approval status updated
 */
router.put('/:id/approve', authenticateToken, requireRole('admin'), storeController.approveStore);

/**
 * @swagger
 * /api/stores/{id}/toggle-active:
 *   put:
 *     summary: Activate or deactivate a pharmacy store account (Admin only)
 *     tags: [Admin, Stores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Store ID
 *     responses:
 *       200:
 *         description: Store active state toggled
 */
router.put('/:id/toggle-active', authenticateToken, requireRole('admin'), storeController.toggleStoreActive);

module.exports = router;

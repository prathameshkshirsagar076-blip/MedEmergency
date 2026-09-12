const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken, requireRole('admin'));

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get administrative overview stats (total stores, pending approvals, requests, matches)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Administrative statistical metrics returned
 *       403:
 *         description: Requires admin role
 */
router.get('/stats', adminController.getAdminStats);

/**
 * @swagger
 * /api/admin/requests:
 *   get:
 *     summary: Get live emergency dispatch feed and system request history
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all emergency requests across all pharmacies
 *       403:
 *         description: Requires admin role
 */
router.get('/requests', adminController.getAdminRequests);

module.exports = router;

const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * @swagger
 * /api/medicines/search:
 *   get:
 *     summary: Search master medicines catalog with fuzzy matching / autocomplete
 *     tags: [Medicines]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: EpiPen
 *         description: Search query / drug name
 *     responses:
 *       200:
 *         description: List of matching medicines with confidence scores
 */
router.get('/search', medicineController.searchMedicines);

/**
 * @swagger
 * /api/medicines:
 *   get:
 *     summary: Get all master catalog medicines
 *     tags: [Medicines]
 *     responses:
 *       200:
 *         description: List of all emergency medicines
 */
router.get('/', medicineController.getAllMedicines);

/**
 * @swagger
 * /api/medicines:
 *   post:
 *     summary: Add a new master medicine entry (Admin only)
 *     tags: [Medicines, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Epinephrine Auto-Injector (EpiPen)
 *               generic_name:
 *                 type: string
 *                 example: Epinephrine
 *               category:
 *                 type: string
 *                 example: Emergency / Anaphylaxis
 *               dosage_form:
 *                 type: string
 *                 example: Auto-Injector 0.3mg
 *               alternatives:
 *                 type: string
 *                 example: Adrenaline Injection
 *               description:
 *                 type: string
 *                 example: Emergency treatment for severe allergic reactions
 *     responses:
 *       201:
 *         description: Medicine created successfully
 *       403:
 *         description: Requires admin role
 */
router.post('/', authenticateToken, requireRole('admin'), medicineController.addMedicine);

module.exports = router;

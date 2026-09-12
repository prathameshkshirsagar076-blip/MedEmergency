const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../services/storageService');

/**
 * @swagger
 * /api/prescriptions/upload:
 *   post:
 *     summary: Upload a prescription image and run Gemini Vision AI extraction
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [prescription]
 *             properties:
 *               prescription:
 *                 type: string
 *                 format: binary
 *                 description: Prescription image file (JPG, PNG, WEBP, PDF)
 *               is_emergency:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Prescription uploaded and extracted successfully
 *       400:
 *         description: No file uploaded
 */
router.post('/upload', authenticateToken, upload.single('prescription'), prescriptionController.uploadPrescription);

/**
 * @swagger
 * /api/prescriptions/{id}/extract:
 *   post:
 *     summary: Re-extract medicines using Google Gemini Vision AI
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Gemini Vision extraction results
 *       404:
 *         description: Prescription not found
 */
router.post('/:id/extract', authenticateToken, prescriptionController.extractMedicines);

/**
 * @swagger
 * /api/prescriptions/{id}/ocr:
 *   post:
 *     summary: Run OCR on prescription (Legacy / AI Vision fallback)
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Extracted text and matched medicines
 */
router.post('/:id/ocr', authenticateToken, prescriptionController.runOcr);

/**
 * @swagger
 * /api/prescriptions/{id}/medicines:
 *   put:
 *     summary: Confirm or adjust verified medicines list for a prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prescription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [medicines]
 *             properties:
 *               medicines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [name]
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Epinephrine Auto-Injector (EpiPen)
 *                     medicine_id:
 *                       type: integer
 *                       example: 1
 *                     dosage:
 *                       type: string
 *                       example: 0.3mg Stat IM
 *                     dosage_instruction:
 *                       type: string
 *                       example: 0.3mg Stat IM
 *                     confidence_level:
 *                       type: string
 *                       example: high
 *                     is_selected:
 *                       type: boolean
 *                       example: true
 *     responses:
 *       200:
 *         description: Medicine list confirmed successfully
 */
router.put('/:id/medicines', authenticateToken, prescriptionController.confirmMedicines);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Retrieve prescription details and extracted medications by ID
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Prescription details returned
 *       404:
 *         description: Prescription not found
 */
router.get('/:id', authenticateToken, prescriptionController.getPrescription);

module.exports = router; 
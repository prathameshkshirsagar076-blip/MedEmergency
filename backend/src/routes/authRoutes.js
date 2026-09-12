const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new patient or pharmacy store
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rajesh Sharma
 *               email:
 *                 type: string
 *                 example: pharmacy@medemergency.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *               role:
 *                 type: string
 *                 enum: [patient, store, admin]
 *                 example: store
 *               phone:
 *                 type: string
 *                 example: "+91 9876543210"
 *               store_name:
 *                 type: string
 *                 example: Apollo 24/7 Pharmacy
 *               license_number:
 *                 type: string
 *                 example: MH-PUN-2026-88912
 *               address:
 *                 type: string
 *                 example: Shop 12, MG Road, Pune
 *               latitude:
 *                 type: number
 *                 example: 18.5204
 *               longitude:
 *                 type: number
 *                 example: 73.8567
 *               operating_hours:
 *                 type: string
 *                 example: 24 Hours / 7 Days
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Validation error or account already exists
 */
router.post('/signup', authController.signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user (Store/Admin/Patient) with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: patient@medemergency.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful, returns access token, sets refresh cookie
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Patient Google OAuth Sign-in (Auth-code flow)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 description: Authorization code returned by Google OAuth popup
 *                 example: 4/0AQ...google_auth_code
 *     responses:
 *       200:
 *         description: Google authentication successful, returns JWT
 *       400:
 *         description: Invalid authorization code
 */
router.post('/google', authController.googleAuth);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Silent token refresh via httpOnly refresh cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: No refresh token provided or session expired
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out user and invalidate refresh token cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user session profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateToken, authController.getMe);

/**
 * @swagger
 * /api/auth/patient/signup:
 *   post:
 *     summary: Step 1 - Initiate Patient Signup and Send Email OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: patient@medemergency.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Verification OTP emailed
 *       400:
 *         description: Email already registered or invalid input
 */
router.post('/patient/signup', authController.patientSignup);

/**
 * @swagger
 * /api/auth/patient/verify-signup-otp:
 *   post:
 *     summary: Step 2 - Verify OTP & Create Patient Account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 example: patient@medemergency.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Account created and verified, returns JWT session
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/patient/verify-signup-otp', authController.verifySignupOtp);

/**
 * @swagger
 * /api/auth/patient/resend-signup-otp:
 *   post:
 *     summary: Resend OTP for Pending Patient Signup
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: patient@medemergency.com
 *     responses:
 *       200:
 *         description: New OTP emailed
 *       404:
 *         description: No pending signup found
 */
router.post('/patient/resend-signup-otp', authController.resendSignupOtp);

/**
 * @swagger
 * /api/auth/patient/login:
 *   post:
 *     summary: Patient Login with Email & Password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: patient@medemergency.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Patient logged in
 *       401:
 *         description: Invalid credentials
 */
router.post('/patient/login', authController.patientLogin);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@medemergency.com
 *     responses:
 *       200:
 *         description: Reset email sent if user exists
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/auth/verify-reset-otp:
 *   post:
 *     summary: Verify 6-digit password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@medemergency.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Verification code confirmed
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-reset-otp', authController.verifyResetOtp);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with OTP / token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, token, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@medemergency.com
 *               token:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: NewPassword@123
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/reset-password', authController.resetPassword);

module.exports = router;

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const { User, Store, PasswordReset, PendingSignup } = require('../models');
const emailService = require('../services/emailService');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} = require('../utils/jwt');

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'postmessage'
);

// Helper for password validation: min 8 chars, at least one number
function validatePasswordStrength(password) {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number.';
  }
  return null;
}

// Helper for email format validation
function validateEmailFormat(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// 1. Google OAuth for Patients (Auth-code flow) — First-time & Returning Users
exports.googleAuth = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Google authorization code is required.',
      });
    }

    let payload;

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const { tokens } = await googleClient.getToken(code);

      // Verify identity using ID token
      if (tokens.id_token) {
        const ticket = await googleClient.verifyIdToken({
          idToken: tokens.id_token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } else if (tokens.access_token) {
        // Fallback to Google UserInfo endpoint if id_token is not present
        const userInfoRes = await googleClient.request({
          url: 'https://www.googleapis.com/oauth2/v3/userinfo',
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        payload = userInfoRes.data;
      }

      // Note: tokens.refresh_token is ONLY provided on the 1st consent authorization.
      // For returning users, tokens.refresh_token is undefined by Google design.
      // This is expected and non-blocking.
      if (tokens.refresh_token) {
        console.log(`🔑 [Google OAuth] Refresh token received on first authorization for ${payload?.email}`);
      } else {
        console.log(`ℹ️ [Google OAuth] Returning user login for ${payload?.email} (Standard OAuth behavior: no refresh token re-sent)`);
      }
    } else {
      console.warn('⚠️ Google OAuth: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not configured in .env.');
      return res.status(400).json({
        success: false,
        message: 'Google OAuth is not configured on the backend. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env',
      });
    }

    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: 'Unable to retrieve user profile from Google.',
      });
    }

    const { email, name, picture, sub: google_id } = payload;
    const normalizedEmail = email.toLowerCase();

    let user = await User.findOne({
      where: { email: normalizedEmail },
      include: [{ model: Store, as: 'store' }],
    });

    if (user) {
      let updated = false;
      if (!user.google_id && google_id) {
        user.google_id = google_id;
        updated = true;
      }
      if (picture && user.profile_picture !== picture) {
        user.profile_picture = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || 'Google User',
        email: normalizedEmail,
        password_hash: null,
        role: 'patient',
        auth_provider: 'google',
        google_id,
        profile_picture: picture || null,
      });
    }

    // Generate MedEmergency application JWT tokens (Access + Refresh Cookie)
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setRefreshCookie(res, refreshToken);

    return res.json({
      success: true,
      message: 'Google authentication successful',
      accessToken,
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        auth_provider: user.auth_provider,
        profile_picture: user.profile_picture,
        phone: user.phone,
        store: user.store || undefined,
      },
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Google authentication failed.',
    });
  }
};

// 2. Patient Signup (Email + Password) with Email OTP Verification
exports.patientSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your name.' });
    }

    if (!email || !validateEmailFormat(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const pwdError = validatePasswordStrength(password);
    if (pwdError) {
      return res.status(400).json({ success: false, message: pwdError });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check the REAL users table first
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      if (existingUser.auth_provider === 'google') {
        return res.status(400).json({
          success: false,
          message: 'This email is already registered with Google Sign-In. Please use Continue with Google.',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in instead.',
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Upsert into pending_signups (overwrite if already present)
    let pending = await PendingSignup.findOne({ where: { email: normalizedEmail } });
    if (pending) {
      pending.name = name.trim();
      pending.password_hash = passwordHash;
      pending.otp_code = otp;
      pending.expires_at = expiresAt;
      await pending.save();
    } else {
      await PendingSignup.create({
        name: name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        otp_code: otp,
        expires_at: expiresAt,
      });
    }

    // Send verification email via Nodemailer
    await emailService.sendOtpEmail(normalizedEmail, otp, 'signup');

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email. Please check your inbox.',
      email: normalizedEmail,
    });
  } catch (error) {
    console.error('Patient signup error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error initiating patient signup.' });
  }
};

// 2b. Verify Signup OTP & Create Real User Account
exports.verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const pending = await PendingSignup.findOne({ where: { email: normalizedEmail } });

    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found for this email. Please sign up again.',
      });
    }

    // Check code match
    if (pending.otp_code !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check your email and try again.',
      });
    }

    // Check expiration
    if (new Date() > new Date(pending.expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    // Re-verify email doesn't exist in users table
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      await pending.destroy();
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in instead.',
      });
    }

    // Create real user in users table
    const user = await User.create({
      name: pending.name,
      email: pending.email,
      password_hash: pending.password_hash,
      role: 'patient',
      auth_provider: 'email',
    });

    // Delete pending record
    await pending.destroy();

    // Auto-login: issue JWT access and refresh tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      message: 'Account created and verified successfully!',
      accessToken,
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        auth_provider: user.auth_provider,
        profile_picture: user.profile_picture,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Verify signup OTP error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error verifying signup code.' });
  }
};

// 2c. Resend Signup OTP
exports.resendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmailFormat(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pending = await PendingSignup.findOne({ where: { email: normalizedEmail } });

    if (!pending) {
      return res.status(404).json({
        success: false,
        message: 'No pending signup found for this email. Please sign up again.',
      });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    pending.otp_code = newOtp;
    pending.expires_at = expiresAt;
    await pending.save();

    await emailService.sendOtpEmail(normalizedEmail, newOtp, 'signup');

    return res.json({
      success: true,
      message: 'A new verification code has been sent to your email.',
    });
  } catch (error) {
    console.error('Resend signup OTP error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error resending verification code.' });
  }
};

// 3. Patient Login (Email + Password)
exports.patientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
    }

    if (user.auth_provider === 'google' || !user.password_hash) {
      return res.status(400).json({
        success: false,
        message: 'This email is registered with Google Sign-In. Please use Continue with Google instead.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setRefreshCookie(res, refreshToken);

    return res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        auth_provider: user.auth_provider,
        profile_picture: user.profile_picture,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Patient login error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error signing in.' });
  }
};

// 4. General Login (Store, Admin & Patient fallback)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() },
      include: [{ model: Store, as: 'store' }],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
    }

    if (user.auth_provider === 'google' || !user.password_hash) {
      return res.status(400).json({
        success: false,
        message: 'This email is registered with Google Sign-In. Please use Continue with Google instead.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
    }

    let isStoreApproved = true;
    if (user.role === 'store') {
      isStoreApproved = user.store ? user.store.is_approved : false;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setRefreshCookie(res, refreshToken);

    return res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      token: accessToken,
      is_approved: isStoreApproved,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        auth_provider: user.auth_provider,
        profile_picture: user.profile_picture,
        phone: user.phone,
        store: user.store || undefined,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error during login.' });
  }
};

// 5. Store & Admin Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, phone, store_name, license_number, address, latitude, longitude, operating_hours } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (!validateEmailFormat(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const pwdError = validatePasswordStrength(password);
    if (pwdError) {
      return res.status(400).json({ success: false, message: pwdError });
    }

    const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const userRole = role === 'store' ? 'store' : (role === 'admin' ? 'admin' : 'patient');

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash: password,
      role: userRole,
      auth_provider: 'email',
      phone: phone || null,
    });

    let store = null;
    if (userRole === 'store') {
      if (!store_name || !license_number || !address) {
        return res.status(400).json({
          success: false,
          message: 'Medical store registrations require store name, drug license number, and physical address.',
        });
      }

      store = await Store.create({
        user_id: user.id,
        store_name,
        license_number,
        address,
        phone: phone || '',
        latitude: latitude ? parseFloat(latitude) : 18.5204,
        longitude: longitude ? parseFloat(longitude) : 73.8567,
        operating_hours: operating_hours || '24 Hours / 7 Days',
        is_approved: false,
        is_online: true,
        is_active: true,
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      message: userRole === 'store' 
        ? 'Store registration submitted successfully! Your account is pending verification by Administrator.'
        : 'Account created successfully!',
      accessToken,
      token: accessToken,
      is_approved: userRole === 'store' ? false : true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        auth_provider: user.auth_provider,
        profile_picture: user.profile_picture,
        phone: user.phone,
        store: store || undefined,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error during signup.' });
  }
};

// 6. Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmailFormat(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (user) {
      if (user.auth_provider === 'google' || !user.password_hash) {
        return res.status(400).json({
          success: false,
          message: 'This account is registered with Google Sign-In and does not require a password reset.',
        });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

      await PasswordReset.destroy({ where: { user_id: user.id } });

      await PasswordReset.create({
        user_id: user.id,
        token: otp,
        expires_at: expiresAt,
      });

      await emailService.sendOtpEmail(user.email, otp, 'password_reset');
    }

    return res.json({
      success: true,
      message: 'If an account with that email exists, verification instructions have been sent to your email.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Error processing password reset request.' });
  }
};

// 6b. Verify Password Reset OTP
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit verification code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    const resetRecord = await PasswordReset.findOne({
      where: { user_id: user.id, token: cleanOtp },
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check your email and try again.',
      });
    }

    if (new Date() > new Date(resetRecord.expires_at)) {
      await resetRecord.destroy();
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    return res.json({
      success: true,
      message: 'Verification code confirmed.',
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    return res.status(500).json({ success: false, message: 'Error verifying reset code.' });
  }
};

// 7. Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Password reset code is required.' });
    }

    const pwdError = validatePasswordStrength(newPassword);
    if (pwdError) {
      return res.status(400).json({ success: false, message: pwdError });
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : null;
    const user = normalizedEmail ? await User.findOne({ where: { email: normalizedEmail } }) : null;

    const resetRecord = await PasswordReset.findOne({
      where: user ? { user_id: user.id, token } : { token },
      include: [{ model: User, as: 'user' }],
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset code. Please request a new one.',
      });
    }

    if (new Date() > new Date(resetRecord.expires_at)) {
      await resetRecord.destroy();
      return res.status(400).json({
        success: false,
        message: 'This password reset code has expired. Please request a new one.',
      });
    }

    const targetUser = resetRecord.user || user;
    if (!targetUser) {
      return res.status(400).json({ success: false, message: 'User account not found.' });
    }

    targetUser.password_hash = newPassword;
    await targetUser.save();

    await resetRecord.destroy();

    return res.json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Error resetting password.' });
  }
};

// 8. Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided.' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      clearRefreshCookie(res);
      return res.status(403).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Store, as: 'store' }],
    });

    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    setRefreshCookie(res, newRefreshToken);

    return res.json({
      success: true,
      accessToken: newAccessToken,
      token: newAccessToken,
      user,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ success: false, message: 'Failed to refresh token.' });
  }
};

// 9. Logout
exports.logout = async (req, res) => {
  try {
    clearRefreshCookie(res);
    return res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, message: 'Error during logout.' });
  }
};

// 10. Get Current User Session
exports.getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve current user profile.' });
  }
};

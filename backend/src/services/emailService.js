const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_APP_PASSWORD;

    if (!user || !pass) {
      console.warn('⚠️ [EmailService] EMAIL_USER or EMAIL_APP_PASSWORD is not configured in .env');
    }

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user || '',
        pass: pass || '',
      },
    });
  }
  return transporter;
}

/**
 * Send an OTP code via email
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} type - 'signup' | 'password_reset'
 */
async function sendOtpEmail(email, otp, type = 'signup') {
  const isSignup = type === 'signup';
  const subject = isSignup 
    ? 'Verify your MedEmergency account' 
    : 'MedEmergency - Password Reset Verification Code';

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 20px; font-weight: 700; color: #0071E3; letter-spacing: -0.5px;">MedEmergency</span>
      </div>
      
      <h2 style="font-size: 22px; font-weight: 600; color: #1d1d1f; margin-bottom: 12px; text-align: center;">
        ${isSignup ? 'Verify your email address' : 'Reset your password'}
      </h2>
      
      <p style="font-size: 15px; color: #6e6e73; line-height: 1.5; text-align: center; margin-bottom: 28px;">
        ${isSignup 
          ? 'Thank you for signing up for MedEmergency. Use the verification code below to complete your registration:' 
          : 'Use the verification code below to complete your password reset request:'}
      </p>
      
      <div style="background-color: #f5f5f7; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 28px;">
        <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1d1d1f; font-family: monospace;">
          ${otp}
        </span>
      </div>
      
      <p style="font-size: 13px; color: #86868b; line-height: 1.4; text-align: center; margin-bottom: 0;">
        This code is valid for <strong>10 minutes</strong>. If you did not request this code, please ignore this email.
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"MedEmergency" <${process.env.EMAIL_USER || 'no-reply@medemergency.com'}>`,
    to: email,
    subject: subject,
    html: htmlContent,
  };

  try {
    const client = getTransporter();
    const info = await client.sendMail(mailOptions);
    console.log(`📧 [EmailService] OTP email sent successfully to ${email} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [EmailService] Failed to send email to ${email}:`, error.message);
    console.log(`🔑 [Dev Fallback OTP for ${email}]: ${otp}`);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendOtpEmail,
  getTransporter,
};

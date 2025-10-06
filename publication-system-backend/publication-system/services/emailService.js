const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { storeOTP: storeOTPDisplay } = require('../otp-display');

class EmailService {
  constructor() {
    // Gmail SMTP configuration for regular password (Less Secure App Access)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'dass.verify@gmail.com',
        pass: process.env.EMAIL_PASS || 'Devagya@7'
      }
    });
    
    // For development, we'll simulate email sending
    this.isDevelopment = !process.env.EMAIL_USER || process.env.EMAIL_USER === 'test@example.com';
  }

  async sendOTP(email, otp, type = 'verification') {
    try {
      // For development, simulate email sending
      if (this.isDevelopment) {
        console.log(`📧 [DEV MODE] Email would be sent to ${email}`);
        console.log(`📧 [DEV MODE] OTP: ${otp} (${type})`);
        console.log(`📧 [DEV MODE] This code expires in 10 minutes`);
        console.log(`📧 [DEV MODE] View OTPs at: http://localhost:5000/otps`);
        
        // Store OTP for display
        storeOTPDisplay(email, otp, type);
        
        return true;
      }

      const subject = type === 'verification' 
        ? 'Email Verification - Research Paper System'
        : 'Password Reset - Research Paper System';
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Research Paper Submission System</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #800000;">${type === 'verification' ? 'Email Verification' : 'Password Reset'}</h3>
            <p>Your verification code is:</p>
            <div style="background: #e74c3c; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <p style="color: #7f8c8d; font-size: 12px;">
            This is an automated message from the Research Paper Submission System.
          </p>
        </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@researchsystem.com',
        to: email,
        subject: subject,
        html: html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      // In development, still return true to allow testing
      if (this.isDevelopment) {
        console.log(`📧 [DEV MODE] Email sending failed, but continuing for development`);
        return true;
      }
      return false;
    }
  }

  async sendWelcomeEmail(email, name) {
    try {
      // For development, simulate email sending
      if (this.isDevelopment) {
        console.log(`📧 [DEV MODE] Welcome email would be sent to ${email}`);
        console.log(`📧 [DEV MODE] Welcome ${name} to the Research Paper Submission System!`);
        return true;
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Welcome to Research Paper Submission System!</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #800000;">Hello ${name}!</h3>
            <p>Your account has been successfully created and verified.</p>
            <p>You can now:</p>
            <ul>
              <li>Submit research papers</li>
              <li>Browse the research library</li>
              <li>View upcoming conferences</li>
              <li>Manage your profile</li>
            </ul>
            <p>Thank you for joining our research community!</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@researchsystem.com',
        to: email,
        subject: 'Welcome to Research Paper Submission System',
        html: html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error('Welcome email sending failed:', error);
      // In development, still return true to allow testing
      if (this.isDevelopment) {
        console.log(`📧 [DEV MODE] Welcome email sending failed, but continuing for development`);
        return true;
      }
      return false;
    }
  }
}

class OTPService {
  constructor() {
    this.otpStorage = new Map(); // In production, use Redis or database
  }

  generateOTP() {
    return speakeasy.totp({
      secret: speakeasy.generateSecret().base32,
      encoding: 'base32',
      step: 600, // 10 minutes
      window: 1
    });
  }

  generateSecret() {
    return speakeasy.generateSecret({
      name: 'Research Paper System',
      account: 'user@researchsystem.com'
    });
  }

  storeOTP(email, otp, type = 'verification') {
    const key = `${email}_${type}`;
    this.otpStorage.set(key, {
      otp: otp,
      timestamp: Date.now(),
      attempts: 0
    });
    
    // Auto-cleanup after 10 minutes
    setTimeout(() => {
      this.otpStorage.delete(key);
    }, 600000);
  }

  verifyOTP(email, inputOTP, type = 'verification') {
    const key = `${email}_${type}`;
    const stored = this.otpStorage.get(key);
    
    if (!stored) {
      return { valid: false, message: 'OTP expired or not found' };
    }

    // Check attempts
    if (stored.attempts >= 3) {
      this.otpStorage.delete(key);
      return { valid: false, message: 'Too many failed attempts' };
    }

    // Check if expired (10 minutes)
    if (Date.now() - stored.timestamp > 600000) {
      this.otpStorage.delete(key);
      return { valid: false, message: 'OTP expired' };
    }

    // Verify OTP
    if (stored.otp === inputOTP) {
      this.otpStorage.delete(key);
      return { valid: true, message: 'OTP verified successfully' };
    } else {
      stored.attempts++;
      this.otpStorage.set(key, stored);
      return { valid: false, message: 'Invalid OTP' };
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.otpStorage.entries()) {
      if (now - value.timestamp > 600000) {
        this.otpStorage.delete(key);
      }
    }
  }
}

module.exports = { EmailService, OTPService };

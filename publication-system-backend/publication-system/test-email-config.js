require('dotenv').config();
const nodemailer = require('nodemailer');

// Manually set environment variables if not loaded
if (!process.env.EMAIL_USER) {
  process.env.EMAIL_USER = 'dass.verify@gmail.com';
  process.env.EMAIL_PASS = 'Devagya@7';
  process.env.NODE_ENV = 'production';
  process.env.PORT = '5000';
}

console.log('🔧 Testing Email Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '***SET***' : 'NOT SET'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}\n`);

// Create transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test connection
console.log('🔌 Testing SMTP Connection...');
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if EMAIL_USER and EMAIL_PASS are set in .env');
    console.log('2. Verify Gmail account has 2-Factor Authentication enabled');
    console.log('3. Use App Password, not regular password');
    console.log('4. Check if "Less secure app access" is disabled');
  } else {
    console.log('✅ SMTP Connection successful!');
    console.log('📧 Ready to send emails from:', process.env.EMAIL_USER);
  }
});

// Test email sending
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log('\n📤 Testing Email Sending...');
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'test@example.com', // This won't actually send
    subject: 'DASS System - Email Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">DASS System Email Test</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #800000;">Test OTP</h3>
          <p>Your verification code is:</p>
          <div style="background: #e74c3c; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 5px; margin: 20px 0;">
            123456
          </div>
          <p>This is a test email from the DASS Research Paper System.</p>
        </div>
      </div>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('❌ Email sending failed:', error.message);
    } else {
      console.log('✅ Email sending test successful!');
      console.log('📧 Message ID:', info.messageId);
    }
  });
} else {
  console.log('\n⚠️  Email credentials not configured. Please set up .env file.');
}

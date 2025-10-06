# 📧 Email Setup Guide for DASS System

## 🔧 Current Configuration
- **Email Address:** `dass.verify@gmail.com`
- **SMTP Server:** Gmail (smtp.gmail.com)
- **Port:** 587
- **Security:** TLS

## 📋 Step-by-Step Setup Instructions

### 1. **Enable 2-Factor Authentication**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Sign in with `dass.verify@gmail.com`
3. Navigate to **Security** → **2-Step Verification**
4. Follow the setup process to enable 2FA

### 2. **Generate App Password**
1. In Google Account Settings, go to **Security**
2. Under "2-Step Verification", click **App passwords**
3. Select **Mail** as the app
4. Generate a 16-character app password
5. **Copy this password** - you'll need it for the .env file

### 3. **Update .env File**
Replace `your-app-password-here` in the .env file with your actual app password:

```env
# Email Configuration
EMAIL_USER=dass.verify@gmail.com
EMAIL_PASS=your-16-character-app-password
PORT=5000
NODE_ENV=production
```

### 4. **Test Email Sending**
1. Start the system: `.\start-persistent.bat`
2. Try to sign up with any email address
3. Check if OTP is received in the target email
4. If not working, check the console for error messages

## 🔍 Troubleshooting

### Common Issues:
1. **"Invalid login"** - Check if app password is correct
2. **"Less secure app access"** - Use App Password, not regular password
3. **"Connection timeout"** - Check internet connection
4. **"Authentication failed"** - Verify 2FA is enabled

### Alternative: Use OTP Display Page
If email setup fails, you can still test using:
- **URL:** `http://localhost:5000/otps`
- **Purpose:** Shows all OTPs for testing

## 📱 Testing Steps

1. **Start System:**
   ```bash
   .\start-persistent.bat
   ```

2. **Test Signup:**
   - Go to `http://localhost:5173`
   - Try to sign up with any email
   - Check if OTP arrives in the target email

3. **Check OTP Display:**
   - Go to `http://localhost:5000/otps`
   - View all active OTPs

## 🎯 Expected Behavior

- **With Email Setup:** OTPs sent to actual email addresses
- **Without Email Setup:** OTPs displayed on `/otps` page
- **Development Mode:** Console logs + OTP display page

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify the .env file configuration
3. Test with the OTP display page first
4. Ensure Gmail account has 2FA enabled


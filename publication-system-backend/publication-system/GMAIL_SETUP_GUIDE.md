# 📧 Gmail Setup Guide for DASS System

## 🔧 Current Configuration
- **Email Address:** `dass.verify@gmail.com`
- **Password:** `Devagya@7`
- **Method:** Less Secure App Access (since 2FA is not enabled)

## 📋 Required Gmail Settings

### 1. **Enable Less Secure App Access**
1. **Sign in to Gmail** with `dass.verify@gmail.com`
2. **Go to:** [Google Account Settings](https://myaccount.google.com/)
3. **Navigate to:** Security → Less secure app access
4. **Turn ON** "Allow less secure apps"
5. **Confirm** the change

### 2. **Alternative: Enable 2-Factor Authentication (Recommended)**
If you prefer to use App Passwords (more secure):
1. **Go to:** Security → 2-Step Verification
2. **Enable 2FA** for the account
3. **Go to:** Security → App passwords
4. **Generate App Password** for "Mail"
5. **Update .env file** with the App Password

## 🧪 Testing Email Configuration

### Test the current setup:
```bash
cd publication-system-backend\publication-system
node test-email-config.js
```

### Expected Results:
- ✅ **Success:** "SMTP Connection successful!"
- ❌ **Failure:** "Invalid login" or "Less secure app access" error

## 🔄 System Restart

After enabling Less Secure App Access:
1. **Restart the system:**
   ```bash
   .\start-persistent.bat
   ```

2. **Test signup** with any email address
3. **Check if OTP arrives** in the target email

## 🆘 Troubleshooting

### Common Issues:
1. **"Less secure app access"** - Enable it in Gmail settings
2. **"Invalid login"** - Check username/password
3. **"Connection timeout"** - Check internet connection
4. **"Authentication failed"** - Verify Gmail settings

### Fallback Option:
If email doesn't work, use the OTP display page:
- **URL:** `http://localhost:5000/otps`
- **Purpose:** Shows all OTPs for testing

## 📱 Current System Status

- ✅ **Email configured:** `dass.verify@gmail.com`
- ⏳ **Waiting for:** Less Secure App Access to be enabled
- 🔄 **System running** with OTP display as backup

## 🎯 Next Steps

1. **Enable Less Secure App Access** in Gmail
2. **Test email configuration**
3. **Restart the system**
4. **Try signup** to test OTP delivery


// Simple in-memory OTP storage for development
const otpStorage = new Map();

function storeOTP(email, otp, type = 'verification') {
  const key = `${email}_${type}`;
  const expiry = Date.now() + (10 * 60 * 1000); // 10 minutes
  otpStorage.set(key, { otp, expiry, type });
  
  // Clean up expired OTPs
  for (const [key, data] of otpStorage.entries()) {
    if (data.expiry < Date.now()) {
      otpStorage.delete(key);
    }
  }
}

function getOTP(email, type = 'verification') {
  const key = `${email}_${type}`;
  const data = otpStorage.get(key);
  
  if (!data) {
    return null;
  }
  
  if (data.expiry < Date.now()) {
    otpStorage.delete(key);
    return null;
  }
  
  return data.otp;
}

function getAllOTPs() {
  const otps = [];
  for (const [key, data] of otpStorage.entries()) {
    if (data.expiry > Date.now()) {
      const [email, type] = key.split('_');
      otps.push({ email, otp: data.otp, type, expires: new Date(data.expiry) });
    }
  }
  return otps;
}

module.exports = {
  storeOTP,
  getOTP,
  getAllOTPs
};


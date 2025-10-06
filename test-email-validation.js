// Test script for email validation and OTP system
const axios = require('axios');

async function testEmailValidation() {
  console.log('🧪 Testing Email Validation and OTP System...\n');

  try {
    // Test 1: Invalid email format
    console.log('1. Testing invalid email format...');
    try {
      await axios.post('http://localhost:5000/users/register', {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        role: 'author'
      });
      console.log('❌ Should have failed for invalid email format');
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ Invalid email format correctly rejected:', err.response.data.message);
      } else {
        console.log('❌ Unexpected error:', err.response?.data?.message || err.message);
      }
    }

    // Test 2: Disposable email
    console.log('\n2. Testing disposable email...');
    try {
      await axios.post('http://localhost:5000/users/register', {
        name: 'Test User',
        email: 'test@10minutemail.com',
        password: 'password123',
        role: 'author'
      });
      console.log('❌ Should have failed for disposable email');
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ Disposable email correctly rejected:', err.response.data.message);
      } else {
        console.log('❌ Unexpected error:', err.response?.data?.message || err.message);
      }
    }

    // Test 3: Valid email (should require verification)
    console.log('\n3. Testing valid email registration...');
    try {
      const response = await axios.post('http://localhost:5000/users/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'author'
      });
      
      if (response.data.requiresVerification) {
        console.log('✅ Valid email registration requires verification');
        console.log('   Email:', response.data.email);
        console.log('   Message:', response.data.message);
      } else {
        console.log('❌ Should require verification for new email');
      }
    } catch (err) {
      console.log('❌ Registration failed:', err.response?.data?.message || err.message);
    }

    // Test 4: Email verification with invalid OTP
    console.log('\n4. Testing email verification with invalid OTP...');
    try {
      await axios.post('http://localhost:5000/users/verify-email', {
        email: 'test@example.com',
        otp: '123456'
      });
      console.log('❌ Should have failed for invalid OTP');
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ Invalid OTP correctly rejected:', err.response.data.message);
      } else {
        console.log('❌ Unexpected error:', err.response?.data?.message || err.message);
      }
    }

    // Test 5: Forgot password
    console.log('\n5. Testing forgot password...');
    try {
      const response = await axios.post('http://localhost:5000/users/forgot-password', {
        email: 'test@example.com'
      });
      console.log('✅ Forgot password request successful:', response.data.message);
    } catch (err) {
      console.log('❌ Forgot password failed:', err.response?.data?.message || err.message);
    }

    // Test 6: Reset password with invalid OTP
    console.log('\n6. Testing password reset with invalid OTP...');
    try {
      await axios.post('http://localhost:5000/users/reset-password', {
        email: 'test@example.com',
        otp: '123456',
        newPassword: 'newpassword123'
      });
      console.log('❌ Should have failed for invalid OTP');
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ Invalid OTP for password reset correctly rejected:', err.response.data.message);
      } else {
        console.log('❌ Unexpected error:', err.response?.data?.message || err.message);
      }
    }

    console.log('\n🎉 Email validation and OTP system test completed!');
    console.log('\n📋 What was tested:');
    console.log('   ✅ Invalid email format rejection');
    console.log('   ✅ Disposable email rejection');
    console.log('   ✅ Valid email requires verification');
    console.log('   ✅ Invalid OTP rejection');
    console.log('   ✅ Forgot password functionality');
    console.log('   ✅ Password reset validation');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Make sure the backend server is running:');
    console.log('   Run: start-persistent.bat');
  }
}

testEmailValidation();


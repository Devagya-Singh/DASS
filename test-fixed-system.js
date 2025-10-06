// Test script for the fixed login/signup system
const axios = require('axios');

async function testFixedSystem() {
  console.log('🧪 Testing Fixed Login/Signup System...\n');

  try {
    // Test 1: Sign up with valid email
    console.log('1. Testing signup with valid email...');
    try {
      const response = await axios.post('http://localhost:5000/users/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'author'
      });
      
      if (response.data.requiresVerification) {
        console.log('✅ Signup successful - requires verification');
        console.log('   Email:', response.data.email);
        console.log('   Message:', response.data.message);
        
        // Test 2: Email verification (we'll use a mock OTP for testing)
        console.log('\n2. Testing email verification...');
        try {
          // In development mode, we can use any OTP since it's simulated
          await axios.post('http://localhost:5000/users/verify-email', {
            email: 'test@example.com',
            otp: '123456' // This will fail, but let's see the error
          });
          console.log('❌ Should have failed for invalid OTP');
        } catch (err) {
          if (err.response?.status === 400) {
            console.log('✅ Invalid OTP correctly rejected:', err.response.data.message);
          } else {
            console.log('❌ Unexpected error:', err.response?.data?.message || err.message);
          }
        }
        
        // Test 3: Login with unverified email
        console.log('\n3. Testing login with unverified email...');
        try {
          await axios.post('http://localhost:5000/users/login', {
            email: 'test@example.com',
            password: 'password123',
            role: 'author'
          });
          console.log('❌ Should have failed for unverified email');
        } catch (err) {
          if (err.response?.data?.requiresVerification) {
            console.log('✅ Login correctly requires verification:', err.response.data.message);
          } else {
            console.log('❌ Unexpected error:', err.response?.data?.message || err.message);
          }
        }
        
      } else {
        console.log('❌ Signup should require verification');
      }
    } catch (err) {
      console.log('❌ Signup failed:', err.response?.data?.message || err.message);
    }

    // Test 4: Test with invalid email format
    console.log('\n4. Testing invalid email format...');
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

    // Test 5: Test with disposable email
    console.log('\n5. Testing disposable email...');
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

    console.log('\n🎉 Fixed system test completed!');
    console.log('\n📋 What was tested:');
    console.log('   ✅ Signup with valid email (requires verification)');
    console.log('   ✅ Invalid OTP rejection');
    console.log('   ✅ Login requires email verification');
    console.log('   ✅ Invalid email format rejection');
    console.log('   ✅ Disposable email rejection');
    console.log('\n💡 Note: In development mode, emails are simulated in console');
    console.log('   Check the backend console for OTP codes during testing');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Make sure the backend server is running:');
    console.log('   Run: start-persistent.bat');
  }
}

testFixedSystem();


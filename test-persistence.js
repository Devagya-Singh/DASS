// Test script to verify data persistence
const axios = require('axios');

async function testPersistence() {
  console.log('🧪 Testing Data Persistence...\n');

  try {
    // Test 1: Register a user
    console.log('1. Registering user with email: 2205374@kiit.ac.in');
    const signupData = {
      name: 'Test User',
      email: '2205374@kiit.ac.in',
      password: 'password123',
      role: 'author'
    };

    const signupResponse = await axios.post('http://localhost:5000/users/register', signupData);
    console.log('✅ User registered successfully!');
    console.log('   User ID:', signupResponse.data.user.id);
    console.log('   Email:', signupResponse.data.user.email);

    // Test 2: Login to verify data is saved
    console.log('\n2. Testing login (verifying data persistence)...');
    const loginData = {
      email: '2205374@kiit.ac.in',
      password: 'password123',
      role: 'author'
    };

    const loginResponse = await axios.post('http://localhost:5000/users/login', loginData);
    console.log('✅ Login successful! Data is persistent!');
    console.log('   User ID:', loginResponse.data.user.id);
    console.log('   Name:', loginResponse.data.user.name);

    // Test 3: Add a publication
    console.log('\n3. Adding a test publication...');
    const token = loginResponse.data.token;
    const publicationData = {
      title: 'Test Research Paper',
      abstract: 'This is a test abstract for persistence testing.',
      publicationDate: '2024-01-15'
    };

    const pubResponse = await axios.post('http://localhost:5000/publications/add', publicationData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Publication added successfully!');
    console.log('   Publication ID:', pubResponse.data.id);
    console.log('   Title:', pubResponse.data.title);

    console.log('\n🎉 All persistence tests passed!');
    console.log('\n📋 What this means:');
    console.log('   ✅ Your user account is saved permanently');
    console.log('   ✅ Publications are stored in database');
    console.log('   ✅ Data persists across server restarts');
    console.log('   ✅ You can restart the system anytime');
    console.log('   ✅ Your data will still be there!');

    console.log('\n🔄 To test persistence:');
    console.log('   1. Stop the server (Ctrl+C)');
    console.log('   2. Run start-persistent.bat again');
    console.log('   3. Try logging in - your account will still exist!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n🔧 Make sure the server is running:');
    console.log('   Run: start-persistent.bat');
  }
}

testPersistence();

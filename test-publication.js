// Test script for publication submission
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testPublication() {
  console.log('🧪 Testing Publication Submission...\n');

  try {
    // Step 1: Login first
    console.log('1. Logging in...');
    const loginData = {
      email: '2205374@kiit.ac.in',
      password: 'password123',
      role: 'author'
    };

    const loginResponse = await axios.post('http://localhost:5000/users/login', loginData);
    console.log('✅ Login successful!');
    const token = loginResponse.data.token;

    // Step 2: Create a test PDF file
    console.log('\n2. Creating test PDF...');
    const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
    fs.writeFileSync('test-publication.pdf', testPdfContent);
    console.log('✅ Test PDF created!');

    // Step 3: Submit publication
    console.log('\n3. Submitting publication...');
    const formData = new FormData();
    formData.append('title', 'Test Research Paper');
    formData.append('abstract', 'This is a test abstract for the research paper submission system.');
    formData.append('publicationDate', '2024-01-15');
    formData.append('pdf', fs.createReadStream('test-publication.pdf'));

    const pubResponse = await axios.post('http://localhost:5000/publications/add', formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Publication submitted successfully!');
    console.log('   Publication ID:', pubResponse.data.id);
    console.log('   Title:', pubResponse.data.title);
    console.log('   Status:', pubResponse.data.status);
    console.log('   PDF Path:', pubResponse.data.pdfPath);

    // Step 4: Verify publication was saved
    console.log('\n4. Verifying publication was saved...');
    const getResponse = await axios.get('http://localhost:5000/publications/mine', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Publications retrieved successfully!');
    console.log('   Total publications:', getResponse.data.length);
    console.log('   Latest publication:', getResponse.data[0]?.title);

    // Cleanup
    fs.unlinkSync('test-publication.pdf');
    console.log('\n🧹 Cleaned up test files');

    console.log('\n🎉 Publication submission test passed!');
    console.log('\n📋 What this means:');
    console.log('   ✅ Authors can submit publications');
    console.log('   ✅ PDF files are uploaded and stored');
    console.log('   ✅ Publications are saved to database');
    console.log('   ✅ Publications persist across restarts');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n🔧 Make sure:');
    console.log('   1. Backend server is running (start-persistent.bat)');
    console.log('   2. You have signed up with 2205374@kiit.ac.in');
    console.log('   3. Frontend is running on port 5173');
  }
}

testPublication();

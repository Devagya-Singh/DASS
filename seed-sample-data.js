// Script to seed sample data for the enhanced features
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function seedSampleData() {
  console.log('🌱 Seeding sample data for enhanced features...\n');

  try {
    // Step 1: Create admin user
    console.log('1. Creating admin user...');
    const adminData = {
      name: 'Admin User',
      email: 'admin@research.com',
      password: 'admin123',
      role: 'admin'
    };

    try {
      await axios.post(`${API_BASE_URL}/users/register`, adminData);
      console.log('✅ Admin user created');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️ Admin user already exists');
      } else {
        throw err;
      }
    }

    // Step 2: Login as admin
    console.log('\n2. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, {
      email: 'admin@research.com',
      password: 'admin123',
      role: 'admin'
    });
    const adminToken = loginResponse.data.token;
    console.log('✅ Admin logged in');

    // Step 3: Create sample conferences
    console.log('\n3. Creating sample conferences...');
    const conferences = [
      {
        name: 'International Conference on Artificial Intelligence 2024',
        date: '2024-12-15',
        location: 'San Francisco, USA',
        description: 'Leading AI researchers gather to discuss the latest breakthroughs in machine learning, neural networks, and AI applications.',
        conference_type: 'upcoming',
        website_url: 'https://icai2024.org',
        registration_fee: '$299'
      },
      {
        name: 'Global Climate Change Summit 2024',
        date: '2024-11-20',
        location: 'London, UK',
        description: 'Climate scientists and policymakers discuss sustainable solutions and environmental research.',
        conference_type: 'upcoming',
        website_url: 'https://climate2024.org',
        registration_fee: 'Free'
      },
      {
        name: 'Quantum Computing Symposium 2024',
        date: '2024-10-05',
        location: 'Tokyo, Japan',
        description: 'Exploring the frontiers of quantum computing and its practical applications.',
        conference_type: 'upcoming',
        website_url: 'https://quantum2024.jp',
        registration_fee: '$199'
      },
      {
        name: 'Biomedical Research Conference 2023',
        date: '2023-09-15',
        location: 'Boston, USA',
        description: 'Annual conference showcasing breakthrough research in biomedical sciences.',
        conference_type: 'past',
        website_url: 'https://biomed2023.org',
        registration_fee: '$249'
      },
      {
        name: 'Space Technology Forum 2023',
        date: '2023-08-22',
        location: 'Cape Canaveral, USA',
        description: 'Advancements in space exploration and satellite technology.',
        conference_type: 'past',
        website_url: 'https://space2023.org',
        registration_fee: '$179'
      }
    ];

    for (const conf of conferences) {
      try {
        await axios.post(`${API_BASE_URL}/conference`, conf, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`✅ Created conference: ${conf.name}`);
      } catch (err) {
        console.log(`⚠️ Conference might already exist: ${conf.name}`);
      }
    }

    // Step 4: Create sample authors and publications
    console.log('\n4. Creating sample authors and publications...');
    const authors = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        password: 'password123',
        role: 'author'
      },
      {
        name: 'Prof. Michael Chen',
        email: 'm.chen@research.org',
        password: 'password123',
        role: 'author'
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'e.rodriguez@tech.com',
        password: 'password123',
        role: 'author'
      }
    ];

    const authorTokens = [];
    for (const author of authors) {
      try {
        await axios.post(`${API_BASE_URL}/users/register`, author);
        const loginRes = await axios.post(`${API_BASE_URL}/users/login`, {
          email: author.email,
          password: author.password,
          role: 'author'
        });
        authorTokens.push(loginRes.data.token);
        console.log(`✅ Created author: ${author.name}`);
      } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.message?.includes('already exists')) {
          const loginRes = await axios.post(`${API_BASE_URL}/users/login`, {
            email: author.email,
            password: author.password,
            role: 'author'
          });
          authorTokens.push(loginRes.data.token);
          console.log(`ℹ️ Author already exists: ${author.name}`);
        } else {
          throw err;
        }
      }
    }

    // Step 5: Create sample publications
    console.log('\n5. Creating sample publications...');
    const publications = [
      {
        title: 'Deep Learning Approaches for Natural Language Processing',
        abstract: 'This paper presents novel deep learning architectures for improving natural language understanding and generation tasks. We introduce a new attention mechanism that significantly outperforms existing methods on benchmark datasets.',
        publicationDate: '2024-01-15',
        access_type: 'free',
        keywords: 'deep learning, NLP, attention mechanism, transformers',
        doi: '10.1000/182'
      },
      {
        title: 'Quantum Machine Learning: A Comprehensive Survey',
        abstract: 'We provide a comprehensive overview of quantum machine learning algorithms and their applications. This survey covers quantum neural networks, quantum support vector machines, and hybrid classical-quantum approaches.',
        publicationDate: '2024-02-20',
        access_type: 'paid',
        keywords: 'quantum computing, machine learning, quantum algorithms',
        doi: '10.1000/183'
      },
      {
        title: 'Sustainable Energy Solutions for Smart Cities',
        abstract: 'This research explores innovative approaches to integrating renewable energy sources in urban environments. We present case studies from three major cities and analyze the economic and environmental impacts.',
        publicationDate: '2024-03-10',
        access_type: 'free',
        keywords: 'sustainable energy, smart cities, renewable energy, urban planning',
        doi: '10.1000/184'
      },
      {
        title: 'Advanced Cryptographic Protocols for Blockchain Security',
        abstract: 'We propose new cryptographic protocols that enhance the security and privacy of blockchain systems. Our methods provide improved resistance against quantum attacks while maintaining efficiency.',
        publicationDate: '2024-04-05',
        access_type: 'subscription',
        keywords: 'cryptography, blockchain, security, quantum resistance',
        doi: '10.1000/185'
      },
      {
        title: 'Biomedical Applications of Artificial Intelligence in Drug Discovery',
        abstract: 'This paper demonstrates how AI can accelerate drug discovery processes. We present a new framework that reduces the time and cost of identifying potential drug candidates by 40%.',
        publicationDate: '2024-05-12',
        access_type: 'free',
        keywords: 'AI, drug discovery, biomedical, machine learning',
        doi: '10.1000/186'
      }
    ];

    for (let i = 0; i < publications.length; i++) {
      const pub = publications[i];
      const token = authorTokens[i % authorTokens.length];
      
      try {
        await axios.post(`${API_BASE_URL}/publications/add`, pub, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ Created publication: ${pub.title}`);
      } catch (err) {
        console.log(`⚠️ Error creating publication: ${pub.title} - ${err.response?.data?.message || err.message}`);
      }
    }

    // Step 6: Approve some publications
    console.log('\n6. Approving sample publications...');
    try {
      const allPubsResponse = await axios.get(`${API_BASE_URL}/publications`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      const publicationsToApprove = allPubsResponse.data.slice(0, 3);
      for (const pub of publicationsToApprove) {
        await axios.put(`${API_BASE_URL}/publications/${pub.id}/status`, 
          { status: 'approved' },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log(`✅ Approved publication: ${pub.title}`);
      }
    } catch (err) {
      console.log(`⚠️ Error approving publications: ${err.response?.data?.message || err.message}`);
    }

    console.log('\n🎉 Sample data seeding completed!');
    console.log('\n📋 What was created:');
    console.log('   ✅ 1 Admin user (admin@research.com)');
    console.log('   ✅ 3 Author users');
    console.log('   ✅ 5 Sample conferences (3 upcoming, 2 past)');
    console.log('   ✅ 5 Sample publications with different access types');
    console.log('   ✅ 3 Publications approved for library');
    console.log('\n🌐 You can now test:');
    console.log('   - Live conferences with upcoming/past tabs');
    console.log('   - Library with free/paid/subscription papers');
    console.log('   - Filter system in library');
    console.log('   - Delete account feature in profile');

  } catch (error) {
    console.error('❌ Error seeding data:', error.response?.data || error.message);
    console.log('\n🔧 Make sure the backend server is running:');
    console.log('   Run: start-persistent.bat');
  }
}

seedSampleData();


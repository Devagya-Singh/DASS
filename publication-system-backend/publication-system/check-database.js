const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database');
});

// Function to check users
function checkUsers() {
  console.log('\n📊 === EXISTING USERS ===');
  db.all("SELECT id, name, email, role, email_verified, created_at FROM users ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching users:', err.message);
      return;
    }
    
    if (rows.length === 0) {
      console.log('📝 No users found in the database');
    } else {
      console.log(`📝 Found ${rows.length} user(s):\n`);
      rows.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Email Verified: ${user.email_verified ? '✅ Yes' : '❌ No'}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('   ' + '-'.repeat(50));
      });
    }
  });
}

// Function to check publications
function checkPublications() {
  console.log('\n📚 === EXISTING PUBLICATIONS ===');
  db.all("SELECT id, title, author, status, access_type, created_at FROM publications ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching publications:', err.message);
      return;
    }
    
    if (rows.length === 0) {
      console.log('📝 No publications found in the database');
    } else {
      console.log(`📝 Found ${rows.length} publication(s):\n`);
      rows.forEach((pub, index) => {
        console.log(`${index + 1}. ID: ${pub.id}`);
        console.log(`   Title: ${pub.title}`);
        console.log(`   Author: ${pub.author}`);
        console.log(`   Status: ${pub.status}`);
        console.log(`   Access Type: ${pub.access_type || 'Not specified'}`);
        console.log(`   Created: ${pub.created_at}`);
        console.log('   ' + '-'.repeat(50));
      });
    }
  });
}

// Function to check conferences
function checkConferences() {
  console.log('\n🏛️ === EXISTING CONFERENCES ===');
  db.all("SELECT id, name, location, start_date, end_date, conference_type FROM conferences ORDER BY start_date DESC", [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching conferences:', err.message);
      return;
    }
    
    if (rows.length === 0) {
      console.log('📝 No conferences found in the database');
    } else {
      console.log(`📝 Found ${rows.length} conference(s):\n`);
      rows.forEach((conf, index) => {
        console.log(`${index + 1}. ID: ${conf.id}`);
        console.log(`   Name: ${conf.name}`);
        console.log(`   Location: ${conf.location}`);
        console.log(`   Start Date: ${conf.start_date}`);
        console.log(`   End Date: ${conf.end_date}`);
        console.log(`   Type: ${conf.conference_type || 'Not specified'}`);
        console.log('   ' + '-'.repeat(50));
      });
    }
  });
}

// Run all checks
console.log('🔍 Checking Database Contents...\n');
checkUsers();
setTimeout(() => checkPublications(), 500);
setTimeout(() => checkConferences(), 1000);
setTimeout(() => {
  console.log('\n✅ Database check complete!');
  db.close();
}, 1500);


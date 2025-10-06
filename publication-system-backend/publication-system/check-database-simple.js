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

// Function to check table structure
function checkTableStructure() {
  console.log('\n🔍 === DATABASE STRUCTURE ===');
  
  // Check users table
  db.all("PRAGMA table_info(users)", [], (err, rows) => {
    if (err) {
      console.error('❌ Error checking users table:', err.message);
    } else {
      console.log('\n📊 USERS TABLE COLUMNS:');
      rows.forEach(col => {
        console.log(`   ${col.name} (${col.type})`);
      });
    }
  });
  
  // Check publications table
  db.all("PRAGMA table_info(publications)", [], (err, rows) => {
    if (err) {
      console.error('❌ Error checking publications table:', err.message);
    } else {
      console.log('\n📚 PUBLICATIONS TABLE COLUMNS:');
      rows.forEach(col => {
        console.log(`   ${col.name} (${col.type})`);
      });
    }
  });
  
  // Check conferences table
  db.all("PRAGMA table_info(conferences)", [], (err, rows) => {
    if (err) {
      console.error('❌ Error checking conferences table:', err.message);
    } else {
      console.log('\n🏛️ CONFERENCES TABLE COLUMNS:');
      rows.forEach(col => {
        console.log(`   ${col.name} (${col.type})`);
      });
    }
  });
}

// Function to check users with basic columns
function checkUsers() {
  console.log('\n📊 === EXISTING USERS ===');
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching users:', err.message);
      return;
    }
    
    if (rows.length === 0) {
      console.log('📝 No users found in the database');
    } else {
      console.log(`📝 Found ${rows.length} user(s):\n`);
      rows.forEach((user, index) => {
        console.log(`${index + 1}. User Data:`);
        Object.keys(user).forEach(key => {
          console.log(`   ${key}: ${user[key]}`);
        });
        console.log('   ' + '-'.repeat(50));
      });
    }
  });
}

// Function to check publications with basic columns
function checkPublications() {
  console.log('\n📚 === EXISTING PUBLICATIONS ===');
  db.all("SELECT * FROM publications", [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching publications:', err.message);
      return;
    }
    
    if (rows.length === 0) {
      console.log('📝 No publications found in the database');
    } else {
      console.log(`📝 Found ${rows.length} publication(s):\n`);
      rows.forEach((pub, index) => {
        console.log(`${index + 1}. Publication Data:`);
        Object.keys(pub).forEach(key => {
          console.log(`   ${key}: ${pub[key]}`);
        });
        console.log('   ' + '-'.repeat(50));
      });
    }
  });
}

// Function to check conferences with basic columns
function checkConferences() {
  console.log('\n🏛️ === EXISTING CONFERENCES ===');
  db.all("SELECT * FROM conferences", [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching conferences:', err.message);
      return;
    }
    
    if (rows.length === 0) {
      console.log('📝 No conferences found in the database');
    } else {
      console.log(`📝 Found ${rows.length} conference(s):\n`);
      rows.forEach((conf, index) => {
        console.log(`${index + 1}. Conference Data:`);
        Object.keys(conf).forEach(key => {
          console.log(`   ${key}: ${conf[key]}`);
        });
        console.log('   ' + '-'.repeat(50));
      });
    }
  });
}

// Run all checks
console.log('🔍 Checking Database Contents...\n');
checkTableStructure();
setTimeout(() => checkUsers(), 1000);
setTimeout(() => checkPublications(), 2000);
setTimeout(() => checkConferences(), 3000);
setTimeout(() => {
  console.log('\n✅ Database check complete!');
  db.close();
}, 4000);


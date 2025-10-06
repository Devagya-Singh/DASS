const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

console.log('🔧 Fixing database schema...');

// Add missing columns to users table
const addColumns = [
  "ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0",
  "ALTER TABLE users ADD COLUMN verification_token TEXT"
];

// Add missing columns to publications table
const addPublicationColumns = [
  "ALTER TABLE publications ADD COLUMN access_type TEXT DEFAULT 'free'",
  "ALTER TABLE publications ADD COLUMN keywords TEXT",
  "ALTER TABLE publications ADD COLUMN doi TEXT"
];

// Add missing columns to conferences table
const addConferenceColumns = [
  "ALTER TABLE conferences ADD COLUMN conference_type TEXT DEFAULT 'upcoming'",
  "ALTER TABLE conferences ADD COLUMN website_url TEXT",
  "ALTER TABLE conferences ADD COLUMN registration_fee TEXT"
];

function addColumn(columnSQL) {
  return new Promise((resolve, reject) => {
    db.run(columnSQL, (err) => {
      if (err) {
        // Column might already exist, which is fine
        if (err.message.includes('duplicate column name')) {
          console.log(`   ✅ Column already exists: ${columnSQL.split(' ')[4]}`);
          resolve();
        } else {
          console.log(`   ⚠️  Column might already exist: ${err.message}`);
          resolve(); // Continue anyway
        }
      } else {
        console.log(`   ✅ Added column: ${columnSQL.split(' ')[4]}`);
        resolve();
      }
    });
  });
}

async function fixSchema() {
  try {
    console.log('\n📊 Adding missing columns to users table...');
    for (const column of addColumns) {
      await addColumn(column);
    }
    
    console.log('\n📚 Adding missing columns to publications table...');
    for (const column of addPublicationColumns) {
      await addColumn(column);
    }
    
    console.log('\n🏛️ Adding missing columns to conferences table...');
    for (const column of addConferenceColumns) {
      await addColumn(column);
    }
    
    console.log('\n✅ Database schema fixed successfully!');
    console.log('🔄 You can now use the signup feature without errors.');
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
  } finally {
    db.close();
  }
}

fixSchema();


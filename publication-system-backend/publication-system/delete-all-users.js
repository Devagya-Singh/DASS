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

console.log('🗑️  === DELETING ALL USERS ===');
console.log('⚠️  WARNING: This will delete ALL users and their publications!');

// Delete all publications first
db.run("DELETE FROM publications", function(err) {
  if (err) {
    console.error('❌ Error deleting publications:', err.message);
    db.close();
    return;
  }
  
  console.log(`📚 Deleted ${this.changes} publication(s)`);
  
  // Delete all users
  db.run("DELETE FROM users", function(err) {
    if (err) {
      console.error('❌ Error deleting users:', err.message);
      db.close();
      return;
    }
    
    console.log(`👥 Deleted ${this.changes} user(s)`);
    console.log('✅ All users and publications deleted successfully!');
    
    db.close();
  });
});


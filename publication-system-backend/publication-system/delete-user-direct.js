const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Get user ID from command line arguments
const userId = process.argv[2];

if (!userId) {
  console.log('❌ Usage: node delete-user-direct.js <user_id>');
  console.log('📝 Example: node delete-user-direct.js 2');
  process.exit(1);
}

// Connect to the database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Function to delete user
function deleteUser(userId) {
  // First, get user details
  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
    if (err) {
      console.error('❌ Error fetching user:', err.message);
      db.close();
      return;
    }
    
    if (!user) {
      console.log(`❌ User with ID ${userId} not found`);
      db.close();
      return;
    }
    
    console.log(`\n🗑️  Deleting user: ${user.name} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.created_at}`);
    
    // Delete user's publications first
    db.run("DELETE FROM publications WHERE author_id = ?", [userId], function(err) {
      if (err) {
        console.error('❌ Error deleting publications:', err.message);
        db.close();
        return;
      }
      
      console.log(`   📚 Deleted ${this.changes} publication(s) by this user`);
      
      // Delete the user
      db.run("DELETE FROM users WHERE id = ?", [userId], function(err) {
        if (err) {
          console.error('❌ Error deleting user:', err.message);
          db.close();
          return;
        }
        
        console.log(`✅ User "${user.name}" deleted successfully!`);
        console.log(`   - User ID: ${userId}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Role: ${user.role}`);
        
        db.close();
      });
    });
  });
}

// Delete the user
deleteUser(userId);


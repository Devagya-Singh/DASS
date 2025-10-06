const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const readline = require('readline');

// Connect to the database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database');
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to display all users
function displayUsers() {
  return new Promise((resolve, reject) => {
    console.log('\n📊 === CURRENT USERS ===');
    db.all("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC", [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (rows.length === 0) {
        console.log('📝 No users found in the database');
        resolve([]);
      } else {
        console.log(`📝 Found ${rows.length} user(s):\n`);
        rows.forEach((user, index) => {
          console.log(`${index + 1}. ID: ${user.id}`);
          console.log(`   Name: ${user.name}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Role: ${user.role}`);
          console.log(`   Created: ${user.created_at}`);
          console.log('   ' + '-'.repeat(50));
        });
        resolve(rows);
      }
    });
  });
}

// Function to delete a user by ID
function deleteUser(userId) {
  return new Promise((resolve, reject) => {
    // First, check if user exists
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!user) {
        reject(new Error(`User with ID ${userId} not found`));
        return;
      }
      
      // Delete user's publications first (foreign key constraint)
      db.run("DELETE FROM publications WHERE author_id = ?", [userId], (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Delete the user
        db.run("DELETE FROM users WHERE id = ?", [userId], function(err) {
          if (err) {
            reject(err);
            return;
          }
          
          console.log(`✅ User "${user.name}" (${user.email}) deleted successfully`);
          console.log(`   - User ID: ${userId}`);
          console.log(`   - Role: ${user.role}`);
          console.log(`   - Associated publications also deleted`);
          resolve();
        });
      });
    });
  });
}

// Function to ask for confirmation
function askConfirmation(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

// Function to get user input
function getUserInput(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Main function
async function main() {
  try {
    console.log('🗑️  === USER DELETION TOOL ===');
    console.log('⚠️  WARNING: This will permanently delete users and their publications!');
    
    // Display current users
    const users = await displayUsers();
    
    if (users.length === 0) {
      console.log('\n✅ No users to delete. Exiting...');
      rl.close();
      db.close();
      return;
    }
    
    // Get user ID to delete
    const userIdInput = await getUserInput('\n🔢 Enter the ID of the user you want to delete (or "cancel" to exit): ');
    
    if (userIdInput.toLowerCase() === 'cancel') {
      console.log('❌ Operation cancelled.');
      rl.close();
      db.close();
      return;
    }
    
    const userId = parseInt(userIdInput);
    
    if (isNaN(userId)) {
      console.log('❌ Invalid user ID. Please enter a number.');
      rl.close();
      db.close();
      return;
    }
    
    // Find the user
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) {
      console.log(`❌ User with ID ${userId} not found.`);
      rl.close();
      db.close();
      return;
    }
    
    // Show user details and ask for confirmation
    console.log('\n⚠️  === CONFIRMATION REQUIRED ===');
    console.log(`You are about to delete:`);
    console.log(`   Name: ${userToDelete.name}`);
    console.log(`   Email: ${userToDelete.email}`);
    console.log(`   Role: ${userToDelete.role}`);
    console.log(`   Created: ${userToDelete.created_at}`);
    console.log(`\n⚠️  This will also delete ALL publications by this user!`);
    
    const confirm = await askConfirmation('\n❓ Are you sure you want to delete this user? (yes/no): ');
    
    if (confirm === 'yes' || confirm === 'y') {
      await deleteUser(userId);
      console.log('\n✅ User deletion completed successfully!');
    } else {
      console.log('❌ User deletion cancelled.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    db.close();
  }
}

// Run the main function
main();


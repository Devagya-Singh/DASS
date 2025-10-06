require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
const { EmailService, OTPService } = require("./services/emailService");
const EmailValidationService = require("./services/emailValidation");
const { getAllOTPs } = require("./otp-display");

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize services
const emailService = new EmailService();
const otpService = new OTPService();
const emailValidation = new EmailValidationService();

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Multer setup for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  }
});

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    email_verified BOOLEAN DEFAULT 0,
    verification_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Publications table
  db.run(`CREATE TABLE IF NOT EXISTS publications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    abstract TEXT NOT NULL,
    publication_date TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    author_id INTEGER NOT NULL,
    pdf_path TEXT,
    access_type TEXT DEFAULT 'free',
    keywords TEXT,
    doi TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users (id)
  )`);

  // Conferences table
  db.run(`CREATE TABLE IF NOT EXISTS conferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    conference_type TEXT DEFAULT 'upcoming',
    website_url TEXT,
    registration_fee TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id)
  )`);

  // Conference submissions table
  db.run(`CREATE TABLE IF NOT EXISTS conference_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conference_id INTEGER NOT NULL,
    paper_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conference_id) REFERENCES conferences (id),
    FOREIGN KEY (paper_id) REFERENCES publications (id),
    FOREIGN KEY (author_id) REFERENCES users (id)
  )`);

  // Conference chairs table
  db.run(`CREATE TABLE IF NOT EXISTS conference_chairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conference_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conference_id, user_id),
    FOREIGN KEY (conference_id) REFERENCES conferences (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Ensure existing admin can be quickly assigned as chair via helper view (no-op if exists)

  console.log('✅ Database tables initialized');
}

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS (allow configurable frontend origin)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));

// Serve static files from the "uploads" folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== SYSTEM ADMIN AUTH ====================
const SYSADMIN_EMAIL = 'devagyarupsingh@gmail.com';
const SYSADMIN_PASSWORD = 'Devagya@6457';
let sysadminToken = null; // simplistic in-memory token

app.post('/sysadmin/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (email !== SYSADMIN_EMAIL || password !== SYSADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid system admin credentials' });
    }
    sysadminToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
    res.status(200).json({ message: 'System admin login successful', sysadminToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const requireSysadmin = (req, res, next) => {
  const token = req.headers['x-sysadmin-token'];
  if (!token || token !== sysadminToken) {
    return res.status(403).json({ message: 'System admin authorization required' });
  }
  next();
};

// Simple authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }
  
  const token = authHeader.split(" ")[1];
  // For simplicity, we'll use user ID as token (in production, use JWT)
  const userId = parseInt(token);
  
  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
    if (err || !user) {
      return res.status(403).json({ message: "Invalid token." });
    }
    req.user = { id: user.id, role: user.role };
    next();
  });
};

// Routes
// Register
app.post("/users/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required" });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }
    
    // Validate email
    const emailValidationResult = await emailValidation.validateEmailComprehensive(email);
    if (!emailValidationResult.valid) {
      return res.status(400).json({ message: emailValidationResult.message });
    }
    
    // Check if user already exists
    db.get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      
      if (existingUser) {
        return res.status(409).json({ message: "User already exists with this email" });
      }
      
      // Generate OTP for email verification
      const otp = otpService.generateOTP();
      const verificationToken = Math.random().toString(36).substring(2, 15);
      
      // Send OTP email
      const emailSent = await emailService.sendOTP(email, otp, 'verification');
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send verification email" });
      }
      
      // Store OTP
      otpService.storeOTP(email, otp, 'verification');
      
      // Hash password
      bcrypt.hash(password, 12, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ message: "Error hashing password", error: err.message });
        }
        
        // Insert new user (unverified)
        db.run(
          "INSERT INTO users (name, email, password, role, email_verified, verification_token) VALUES (?, ?, ?, ?, ?, ?)",
          [name.trim(), email.toLowerCase().trim(), hashedPassword, role, 0, verificationToken],
          function(err) {
            if (err) {
              return res.status(500).json({ message: "Error creating user", error: err.message });
            }
            
            console.log(`✅ New user registered (unverified): ${email} (${role})`);
            
            res.status(201).json({
              message: "User registered successfully. Please check your email for verification code.",
              requiresVerification: true,
              email: email
            });
          }
        );
      });
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
});

// Email verification
app.post("/users/verify-email", async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    
    // Verify OTP
    const otpResult = otpService.verifyOTP(email, otp, 'verification');
    if (!otpResult.valid) {
      return res.status(400).json({ message: otpResult.message });
    }
    
    // Update user as verified
    db.run(
      "UPDATE users SET email_verified = 1 WHERE email = ?",
      [email.toLowerCase()],
      function(err) {
        if (err) {
          return res.status(500).json({ message: "Database error", error: err.message });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Send welcome email
        emailService.sendWelcomeEmail(email, "User");
        
        console.log(`✅ Email verified: ${email}`);
        res.status(200).json({ message: "Email verified successfully" });
      }
    );
  } catch (err) {
    console.error("Email verification error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Resend verification email
app.post("/users/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Check if user exists and is unverified
    db.get("SELECT * FROM users WHERE email = ? AND email_verified = 0", [email.toLowerCase()], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found or already verified" });
      }
      
      // Generate new OTP
      const otp = otpService.generateOTP();
      
      // Send OTP email
      const emailSent = await emailService.sendOTP(email, otp, 'verification');
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send verification email" });
      }
      
      // Store OTP
      otpService.storeOTP(email, otp, 'verification');
      
      console.log(`✅ Verification email resent: ${email}`);
      res.status(200).json({ message: "Verification email sent successfully" });
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Forgot password
app.post("/users/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Check if user exists
    db.get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate OTP for password reset
      const otp = otpService.generateOTP();
      
      // Send OTP email
      const emailSent = await emailService.sendOTP(email, otp, 'reset');
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send reset email" });
      }
      
      // Store OTP
      otpService.storeOTP(email, otp, 'reset');
      
      console.log(`✅ Password reset email sent: ${email}`);
      res.status(200).json({ message: "Password reset email sent successfully" });
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Reset password
app.post("/users/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }
    
    // Verify OTP
    const otpResult = otpService.verifyOTP(email, otp, 'reset');
    if (!otpResult.valid) {
      return res.status(400).json({ message: otpResult.message });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    db.run(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email.toLowerCase()],
      function(err) {
        if (err) {
          return res.status(500).json({ message: "Database error", error: err.message });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        
        console.log(`✅ Password reset: ${email}`);
        res.status(200).json({ message: "Password reset successfully" });
      }
    );
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login
app.post("/users/login", (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }
    
    db.get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()], (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check if email is verified
      if (!user.email_verified) {
        return res.status(401).json({ 
          message: "Email not verified. Please check your email for verification code.",
          requiresVerification: true,
          email: user.email
        });
      }
      
      // Verify password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ message: "Error verifying password", error: err.message });
        }
        
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
        
        if (user.role !== role) {
          return res.status(403).json({ message: `User is registered as ${user.role}, not ${role}` });
        }
        
        console.log(`✅ User logged in: ${user.email} (${user.role})`);
        
        res.status(200).json({
          message: "Success",
          token: user.id.toString(), // Using user ID as token
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        });
      });
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

// Get user profile
app.get("/users/me", authenticateToken, (req, res) => {
  try {
    db.get("SELECT id, name, email, role FROM users WHERE id = ?", [req.user.id], (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json(user);
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Publications routes
app.post("/publications/add", authenticateToken, upload.single("pdf"), (req, res) => {
  try {
    const { title, abstract, publicationDate } = req.body;
    
    if (!title || !abstract || !publicationDate) {
      return res.status(400).json({ message: "Title, abstract, and publication date are required" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }
    
    db.run(
      "INSERT INTO publications (title, abstract, publication_date, author_id, pdf_path) VALUES (?, ?, ?, ?, ?)",
      [title, abstract, publicationDate, req.user.id, req.file.filename],
      function(err) {
        if (err) {
          return res.status(500).json({ message: "Error adding publication", error: err.message });
        }
        
        const newPublication = {
          id: this.lastID,
          title,
          abstract,
          publicationDate,
          status: "pending",
          author: req.user.id,
          pdfPath: req.file.filename,
          createdAt: new Date().toISOString()
        };
        
        console.log(`✅ New publication added: ${title} by user ${req.user.id}`);
        res.status(201).json(newPublication);
      }
    );
  } catch (err) {
    console.error("Error adding publication:", err);
    res.status(500).json({ message: "Error adding publication", error: err.message });
  }
});

app.get("/publications/mine", authenticateToken, (req, res) => {
  try {
    db.all("SELECT * FROM publications WHERE author_id = ? ORDER BY created_at DESC", [req.user.id], (err, publications) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching publications", error: err.message });
      }
      
      res.status(200).json(publications);
    });
  } catch (err) {
    console.error("Error fetching publications:", err);
    res.status(500).json({ message: "Error fetching publications", error: err.message });
  }
});

// List raw upload files (System Admin)
app.get('/admin/uploads', requireSysadmin, (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      return res.status(200).json({ files: [] });
    }
    const files = fs.readdirSync(uploadsDir)
      .filter(f => f.toLowerCase().endsWith('.pdf'))
      .map(f => ({ name: f, path: `/uploads/${f}` }));
    res.status(200).json({ files });
  } catch (err) {
    res.status(500).json({ message: 'Error listing uploads', error: err.message });
  }
});

// Delete a raw upload file (System Admin)
app.delete('/admin/uploads/:fileName', requireSysadmin, (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'uploads', fileName);
    fs.unlink(filePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') return res.status(404).json({ message: 'File not found' });
        return res.status(500).json({ message: 'Error deleting file', error: err.message });
      }
      res.status(200).json({ message: 'File deleted' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update publication access/metadata (System Admin)
app.put('/admin/publications/:id/meta', requireSysadmin, (req, res) => {
  try {
    const { id } = req.params;
    const { access_type, keywords, doi } = req.body;
    db.run(
      "UPDATE publications SET access_type = COALESCE(?, access_type), keywords = COALESCE(?, keywords), doi = COALESCE(?, doi) WHERE id = ?",
      [access_type, keywords, doi, id],
      function(err) {
        if (err) return res.status(500).json({ message: 'DB error', error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Publication not found' });
        res.status(200).json({ message: 'Publication updated' });
      }
    );
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Conference routes
app.post("/conference", authenticateToken, (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create conferences" });
    }
    
    const { name, date, location, description } = req.body;
    
    if (!name || !date || !location || !description) {
      return res.status(400).json({ message: "Name, date, location, and description are required" });
    }
    
    db.run(
      "INSERT INTO conferences (name, date, location, description, created_by) VALUES (?, ?, ?, ?, ?)",
      [name, date, location, description, req.user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ message: "Error creating conference", error: err.message });
        }
        
        const newConference = {
          id: this.lastID,
          name,
          date,
          location,
          description,
          createdBy: req.user.id,
          submissions: [],
          createdAt: new Date().toISOString()
        };
        
        res.status(201).json(newConference);
      }
    );
  } catch (err) {
    console.error("Error creating conference:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/conference", authenticateToken, (req, res) => {
  try {
    const { type } = req.query;
    // Use only the canonical date column to avoid schema drift issues
    let query = `SELECT 
      id, name, location, description, website_url, registration_fee, conference_type,
      date
      FROM conferences`;
    
    if (type === 'upcoming') {
      // Categorize purely by date so records without conference_type are included
      query += " WHERE date >= date('now')";
    } else if (type === 'past') {
      query += " WHERE date < date('now')";
    }
    
    query += " ORDER BY date ASC";
    
    db.all(query, (err, conferences) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching conferences", error: err.message });
      }
      
      res.status(200).json(conferences);
    });
  } catch (err) {
    console.error("Error fetching conferences:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Author submits approved paper to conference (persistent server)
app.post('/conference/submit', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'author') return res.status(403).json({ message: 'Only authors can submit papers' });
    const { paperId, conferenceId } = req.body;
    if (!paperId || !conferenceId) return res.status(400).json({ message: 'paperId and conferenceId required' });

    // Ensure paper is approved and owned by author
    db.get("SELECT id FROM publications WHERE id = ? AND author_id = ? AND LOWER(status) = 'approved'", [paperId, req.user.id], (err, paper) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err.message });
      if (!paper) return res.status(403).json({ message: 'Only your approved papers can be submitted' });

      // Ensure conference exists
      db.get("SELECT id FROM conferences WHERE id = ?", [conferenceId], (err, conf) => {
        if (err) return res.status(500).json({ message: 'DB error', error: err.message });
        if (!conf) return res.status(404).json({ message: 'Conference not found' });

        // Prevent duplicate
        db.get("SELECT id FROM conference_submissions WHERE conference_id = ? AND paper_id = ?", [conferenceId, paperId], (err, existing) => {
          if (err) return res.status(500).json({ message: 'DB error', error: err.message });
          if (existing) return res.status(409).json({ message: 'Already submitted to this conference' });

          db.run(
            "INSERT INTO conference_submissions (conference_id, paper_id, author_id, status) VALUES (?, ?, ?, 'pending')",
            [conferenceId, paperId, req.user.id],
            function(err) {
              if (err) return res.status(500).json({ message: 'DB error', error: err.message });
              res.status(201).json({ message: 'Submission created', id: this.lastID });
            }
          );
        });
      });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// System Admin assigns a chair to a conference
app.post('/admin/conferences/:id/chair', requireSysadmin, (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body; // must be an existing user (admin or author)
    if (!user_id) return res.status(400).json({ message: 'user_id required' });
    db.run(
      "INSERT OR IGNORE INTO conference_chairs (conference_id, user_id) VALUES (?, ?)",
      [id, user_id],
      function(err) {
        if (err) return res.status(500).json({ message: 'DB error', error: err.message });
        res.status(200).json({ message: 'Chair assigned' });
      }
    );
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin (regular admin) can self-assign as chair for an upcoming conference
app.post('/conference/:id/chair/self', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only admin can become chair' });
    const { id } = req.params;
    // Ensure conference exists and is upcoming
    db.get("SELECT id, conference_type FROM conferences WHERE id = ?", [id], (err, conf) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err.message });
      if (!conf) return res.status(404).json({ message: 'Conference not found' });
      if ((conf.conference_type || '').toLowerCase() !== 'upcoming') {
        return res.status(400).json({ message: 'Only upcoming conferences can have chairs assigned' });
      }
      db.run(
        "INSERT OR IGNORE INTO conference_chairs (conference_id, user_id) VALUES (?, ?)",
        [id, req.user.id],
        function(err2) {
          if (err2) return res.status(500).json({ message: 'DB error', error: err2.message });
          res.status(200).json({ message: 'You are now chair for this conference' });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper to get user from Bearer token (optional)
function getUserFromAuthHeader(req, cb) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return cb(null, null);
  const userId = parseInt(authHeader.split(' ')[1]);
  if (!userId) return cb(null, null);
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => cb(err, user));
}

// Chair or System Admin updates submission status
app.put('/conferences/:confId/submissions/:submissionId/status', (req, res) => {
  try {
    const { confId, submissionId } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    // Check if requester is sysadmin via header
    const isSysAdmin = !!req.headers['x-sysadmin-token'] && req.headers['x-sysadmin-token'] === sysadminToken;
    if (isSysAdmin) {
      return db.run(
        "UPDATE conference_submissions SET status = ? WHERE id = ? AND conference_id = ?",
        [status, submissionId, confId],
        function(err) {
          if (err) return res.status(500).json({ message: 'DB error', error: err.message });
          if (this.changes === 0) return res.status(404).json({ message: 'Submission not found' });
          res.status(200).json({ message: 'Submission status updated' });
        }
      );
    }

    // Otherwise must be a chair of the conference
    getUserFromAuthHeader(req, (err, user) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err.message });
      if (!user) return res.status(401).json({ message: 'Unauthorized' });
      db.get("SELECT 1 FROM conference_chairs WHERE conference_id = ? AND user_id = ?", [confId, user.id], (err2, chair) => {
        if (err2) return res.status(500).json({ message: 'DB error', error: err2.message });
        if (!chair) return res.status(403).json({ message: 'Only chairs can approve/reject submissions' });

        db.run(
          "UPDATE conference_submissions SET status = ? WHERE id = ? AND conference_id = ?",
          [status, submissionId, confId],
          function(err3) {
            if (err3) return res.status(500).json({ message: 'DB error', error: err3.message });
            if (this.changes === 0) return res.status(404).json({ message: 'Submission not found' });
            res.status(200).json({ message: 'Submission status updated' });
          }
        );
      });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// List submissions for a conference (chair or sysadmin)
app.get('/conferences/:confId/submissions', (req, res) => {
  try {
    const { confId } = req.params;
    const isSysAdmin = !!req.headers['x-sysadmin-token'] && req.headers['x-sysadmin-token'] === sysadminToken;
    if (!isSysAdmin) {
      return getUserFromAuthHeader(req, (err, user) => {
        if (err) return res.status(500).json({ message: 'DB error', error: err.message });
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        db.get("SELECT 1 FROM conference_chairs WHERE conference_id = ? AND user_id = ?", [confId, user.id], (err2, chair) => {
          if (err2) return res.status(500).json({ message: 'DB error', error: err2.message });
          if (!chair) return res.status(403).json({ message: 'Only chairs can view submissions' });
          fetchSubs();
        });
      });
    }
    fetchSubs();

    function fetchSubs() {
      db.all(
        `SELECT cs.*, p.title as paper_title, u.name as author_name
         FROM conference_submissions cs
         LEFT JOIN publications p ON p.id = cs.paper_id
         LEFT JOIN users u ON u.id = cs.author_id
         WHERE cs.conference_id = ?
         ORDER BY cs.submitted_at DESC`,
        [confId],
        (err, rows) => {
          if (err) return res.status(500).json({ message: 'DB error', error: err.message });
          res.status(200).json({ submissions: rows });
        }
      );
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all publications for library (public access)
app.get("/publications/library", (req, res) => {
  try {
    const { status, access_type, search, author } = req.query;

    let query = `
      SELECT p.*, u.name as author_name, u.email as author_email 
      FROM publications p 
      LEFT JOIN users u ON p.author_id = u.id 
      WHERE LOWER(p.status) = 'approved'
    `;
    const params = [];
    if (access_type) {
      query += " AND p.access_type = ?";
      params.push(access_type);
    }
    if (search) {
      query += " AND (p.title LIKE ? OR p.abstract LIKE ? OR p.keywords LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    if (author) {
      query += " AND u.name LIKE ?";
      params.push(`%${author}%`);
    }
    query += " ORDER BY p.created_at DESC";

    db.all(query, params, (err, publications) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching publications", error: err.message });
      }

      // Map DB rows to frontend schema
      const approved = publications.map((p) => ({
        id: p.id,
        title: p.title,
        abstract: p.abstract || "",
        access_type: p.access_type || 'free',
        author_name: p.author_name || '',
        author_email: p.author_email || '',
        publication_date: p.publication_date || p.created_at,
        doi: p.doi,
        keywords: p.keywords || '',
        pdf_path: p.pdf_path,
      }));

      // Also include any raw PDFs from uploads directory
      const uploadsDir = path.join(__dirname, 'uploads');
      let fileEntries = [];
      if (fs.existsSync(uploadsDir)) {
        try {
          const files = fs.readdirSync(uploadsDir).filter(f => f.toLowerCase().endsWith('.pdf'));
          fileEntries = files.map((fileName) => {
            const stat = fs.statSync(path.join(uploadsDir, fileName));
            return {
              id: `file-${fileName}`,
              title: fileName.replace(/\.pdf$/i, ''),
              abstract: '',
              access_type: 'free',
              author_name: '',
              publication_date: stat.mtime.toISOString(),
              doi: null,
              keywords: '',
              pdf_path: fileName,
            };
          });
        } catch (e) {
          console.log('Warning reading uploads dir:', e.message);
        }
      }

      // Merge, de-duplicate by pdf_path (DB-approved metadata should win over raw files)
      const byPdf = new Map();
      [...approved, ...fileEntries].forEach((item) => {
        if (!item.pdf_path) return;
        // Later entries overwrite earlier ones; since approved is first, keep approved
        if (!byPdf.has(item.pdf_path)) byPdf.set(item.pdf_path, item);
      });
      const merged = Array.from(byPdf.values());
      return res.status(200).json(merged);
    });
  } catch (err) {
    console.error("Error fetching library publications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update publication access type
app.put("/publications/:id/access", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { access_type, keywords, doi } = req.body;
    
    // Check if user owns the publication
    db.get("SELECT author_id FROM publications WHERE id = ?", [id], (err, publication) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      
      if (!publication) {
        return res.status(404).json({ message: "Publication not found" });
      }
      
      if (publication.author_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this publication" });
      }
      
      db.run(
        "UPDATE publications SET access_type = ?, keywords = ?, doi = ? WHERE id = ?",
        [access_type, keywords, doi, id],
        function(err) {
          if (err) {
            return res.status(500).json({ message: "Error updating publication", error: err.message });
          }
          
          res.status(200).json({ message: "Publication updated successfully" });
        }
      );
    });
  } catch (err) {
    console.error("Error updating publication:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user account
app.delete("/users/me", authenticateToken, (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: "Password is required to delete account" });
    }
    
    // Verify password
    db.get("SELECT password FROM users WHERE id = ?", [req.user.id], (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ message: "Error verifying password", error: err.message });
        }
        
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid password" });
        }
        
        // Delete user and related data
        db.run("DELETE FROM publications WHERE author_id = ?", [req.user.id], (err) => {
          if (err) {
            return res.status(500).json({ message: "Error deleting publications", error: err.message });
          }
          
          db.run("DELETE FROM users WHERE id = ?", [req.user.id], (err) => {
            if (err) {
              return res.status(500).json({ message: "Error deleting account", error: err.message });
            }
            
            console.log(`✅ User account deleted: ${req.user.id}`);
            res.status(200).json({ message: "Account deleted successfully" });
          });
        });
      });
    });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== SYSTEM ADMIN ROUTES ====================

// Get all users (System Admin only)
app.get("/admin/users", requireSysadmin, (req, res) => {
  try {
    db.all("SELECT id, name, email, role, email_verified, created_at FROM users ORDER BY created_at DESC", [], (err, users) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      res.status(200).json({ users });
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all publications (System Admin only)
app.get("/admin/publications", requireSysadmin, (req, res) => {
  try {
    db.all(`
      SELECT p.*, u.name as author_name, u.email as author_email 
      FROM publications p 
      LEFT JOIN users u ON p.author_id = u.id 
      ORDER BY p.created_at DESC
    `, [], (err, publications) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      res.status(200).json({ publications });
    });
  } catch (err) {
    console.error("Error fetching publications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all conferences (System Admin only)
app.get("/admin/conferences", requireSysadmin, (req, res) => {
  try {
    db.all("SELECT * FROM conferences ORDER BY created_at DESC", [], (err, conferences) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      res.status(200).json({ conferences });
    });
  } catch (err) {
    console.error("Error fetching conferences:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user (System Admin only)
app.put("/admin/users/:id", requireSysadmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, email_verified } = req.body;
    
    db.run(
      "UPDATE users SET name = ?, email = ?, role = ?, email_verified = ? WHERE id = ?",
      [name, email, role, email_verified ? 1 : 0, id],
      function(err) {
        if (err) {
          return res.status(500).json({ message: "Database error", error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User updated successfully" });
      }
    );
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user (System Admin only)
app.delete("/admin/users/:id", requireSysadmin, (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete user's publications first
    db.run("DELETE FROM publications WHERE author_id = ?", [id], (err) => {
      if (err) {
        return res.status(500).json({ message: "Error deleting publications", error: err.message });
      }
      
      // Delete the user
      db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
        if (err) {
          return res.status(500).json({ message: "Database error", error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
      });
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update publication status (System Admin only)
app.put("/admin/publications/:id/status", requireSysadmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be approved or rejected" });
    }

    // Read current status and path first
    db.get("SELECT id, status, pdf_path, title FROM publications WHERE id = ?", [id], (err, pub) => {
      if (err) return res.status(500).json({ message: "Database error", error: err.message });
      if (!pub) return res.status(404).json({ message: "Publication not found" });

      // Only allow transition from pending -> approved/rejected
      if ((pub.status || '').toLowerCase() !== 'pending') {
        return res.status(400).json({ message: "Decision already made and cannot be changed" });
      }

      // If approving, ensure PDF is in uploads folder
      const proceedUpdate = () => {
        db.run(
          "UPDATE publications SET status = ? WHERE id = ?",
          [status, id],
          function(err2) {
            if (err2) return res.status(500).json({ message: "Database error", error: err2.message });
            res.status(200).json({ message: "Publication status updated successfully" });
          }
        );
      };

      if (status === 'approved') {
        try {
          const uploadsDir = path.join(__dirname, 'uploads');
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

          const currentPath = pub.pdf_path || '';
          const origBase = path.basename(currentPath);
          const slug = String(pub.title || 'paper')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
          const safeName = `${slug || 'paper'}-${pub.id}.pdf`;
          const targetPath = path.join(uploadsDir, safeName);

          // If file already present in uploads, nothing to do
          if (fs.existsSync(targetPath)) {
            // Ensure pdf_path is the canonical filename served from /uploads
            return db.run("UPDATE publications SET pdf_path = ? WHERE id = ?", [safeName, id], (uErr) => {
              if (uErr) console.log('Warning: could not update pdf_path:', uErr.message);
              proceedUpdate();
            });
          }

          // If currentPath is absolute and exists, copy
          if (currentPath && path.isAbsolute(currentPath) && fs.existsSync(currentPath)) {
            fs.copyFile(currentPath, targetPath, (copyErr) => {
              if (copyErr) {
                console.log('Warning: could not copy PDF into uploads:', copyErr.message);
                return proceedUpdate();
              }
              // Update pdf_path to new filename (served from /uploads)
              db.run("UPDATE publications SET pdf_path = ? WHERE id = ?", [safeName, id], (uErr) => {
                if (uErr) console.log('Warning: could not update pdf_path:', uErr.message);
                proceedUpdate();
              });
            });
          } else {
            // If currentPath points to existing file in uploads under a different name, rename to canonical
            const existingInUploads = origBase ? path.join(uploadsDir, origBase) : null;
            if (existingInUploads && fs.existsSync(existingInUploads)) {
              try {
                fs.renameSync(existingInUploads, targetPath);
                db.run("UPDATE publications SET pdf_path = ? WHERE id = ?", [safeName, id], (uErr) => {
                  if (uErr) console.log('Warning: could not update pdf_path:', uErr.message);
                  proceedUpdate();
                });
              } catch (rnErr) {
                console.log('Warning: could not rename PDF in uploads:', rnErr.message);
                proceedUpdate();
              }
            } else {
              // No source found; proceed (library may still list if uploaded later)
              proceedUpdate();
            }
          }
        } catch (fileErr) {
          console.log('Warning during approval file handling:', fileErr.message);
          proceedUpdate();
        }
      } else {
        proceedUpdate();
      }
    });
  } catch (err) {
    console.error("Error updating publication status:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete publication (System Admin only)
app.delete("/admin/publications/:id", requireSysadmin, (req, res) => {
  try {
    const { id } = req.params;
    
    // Get publication details to delete PDF file
    db.get("SELECT pdf_path FROM publications WHERE id = ?", [id], (err, publication) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      if (!publication) {
        return res.status(404).json({ message: "Publication not found" });
      }
      
      // Delete PDF file if it exists
      if (publication.pdf_path) {
        const pdfPath = path.join(__dirname, "uploads", publication.pdf_path);
        fs.unlink(pdfPath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.log("Warning: Could not delete PDF file:", err.message);
          }
        });
      }
      
      // Delete publication from database
      db.run("DELETE FROM publications WHERE id = ?", [id], function(err) {
        if (err) {
          return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.status(200).json({ message: "Publication deleted successfully" });
      });
    });
  } catch (err) {
    console.error("Error deleting publication:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add conference (System Admin only)
app.post("/admin/conferences", requireSysadmin, (req, res) => {
  try {
    const { name, location, start_date, end_date, date, description, conference_type, website_url, registration_fee } = req.body;
    
    // Accept either a single canonical date or legacy start/end
    const canonicalDate = date || start_date || end_date;
    if (!name || !location || !canonicalDate) {
      return res.status(400).json({ message: "Name, location, and date are required" });
    }
    
    db.run(
      "INSERT INTO conferences (name, location, date, description, conference_type, website_url, registration_fee, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
      [name, location, canonicalDate, description || '', conference_type || 'upcoming', website_url || '', registration_fee || ''],
      function(err) {
        if (err) {
          return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.status(201).json({ 
          message: "Conference added successfully", 
          id: this.lastID 
        });
      }
    );
  } catch (err) {
    console.error("Error adding conference:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update conference (System Admin only)
app.put("/admin/conferences/:id", requireSysadmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, start_date, end_date, description, conference_type, website_url, registration_fee } = req.body;
    
    db.run(
      "UPDATE conferences SET name = ?, location = ?, start_date = ?, end_date = ?, description = ?, conference_type = ?, website_url = ?, registration_fee = ? WHERE id = ?",
      [name, location, start_date, end_date, description, conference_type, website_url, registration_fee, id],
      function(err) {
        if (err) {
          return res.status(500).json({ message: "Database error", error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: "Conference not found" });
        }
        res.status(200).json({ message: "Conference updated successfully" });
      }
    );
  } catch (err) {
    console.error("Error updating conference:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete conference (System Admin only)
app.delete("/admin/conferences/:id", requireSysadmin, (req, res) => {
  try {
    const { id } = req.params;
    
    db.run("DELETE FROM conferences WHERE id = ?", [id], function(err) {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "Conference not found" });
      }
      res.status(200).json({ message: "Conference deleted successfully" });
    });
  } catch (err) {
    console.error("Error deleting conference:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get system statistics (System Admin only)
app.get("/admin/statistics", requireSysadmin, (req, res) => {
  try {
    const stats = {};
    
    // Get user count by role
    db.all("SELECT role, COUNT(*) as count FROM users GROUP BY role", [], (err, userStats) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      stats.users = userStats;
      
      // Get publication count by status
      db.all("SELECT status, COUNT(*) as count FROM publications GROUP BY status", [], (err, pubStats) => {
        if (err) {
          return res.status(500).json({ message: "Database error", error: err.message });
        }
        stats.publications = pubStats;
        
        // Get conference count by type
        db.all("SELECT conference_type, COUNT(*) as count FROM conferences GROUP BY conference_type", [], (err, confStats) => {
          if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
          }
          stats.conferences = confStats;
          
          // Get total counts
          db.get("SELECT COUNT(*) as total FROM users", [], (err, totalUsers) => {
            if (err) {
              return res.status(500).json({ message: "Database error", error: err.message });
            }
            stats.totalUsers = totalUsers.total;
            
            db.get("SELECT COUNT(*) as total FROM publications", [], (err, totalPubs) => {
              if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
              }
              stats.totalPublications = totalPubs.total;
              
              db.get("SELECT COUNT(*) as total FROM conferences", [], (err, totalConfs) => {
                if (err) {
                  return res.status(500).json({ message: "Database error", error: err.message });
                }
                stats.totalConferences = totalConfs.total;
                
                res.status(200).json({ statistics: stats });
              });
            });
          });
        });
      });
    });
  } catch (err) {
    console.error("Error fetching statistics:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset database (System Admin only) - DANGEROUS!
app.post("/admin/reset-database", requireSysadmin, (req, res) => {
  try {
    const { confirm } = req.body;
    
    if (confirm !== "RESET_ALL_DATA") {
      return res.status(400).json({ message: "Confirmation required. Send 'RESET_ALL_DATA' to confirm." });
    }
    
    // Delete all data
    db.run("DELETE FROM publications", (err) => {
      if (err) {
        return res.status(500).json({ message: "Error clearing publications", error: err.message });
      }
      
      db.run("DELETE FROM conferences", (err) => {
        if (err) {
          return res.status(500).json({ message: "Error clearing conferences", error: err.message });
        }
        
        db.run("DELETE FROM users", (err) => {
          if (err) {
            return res.status(500).json({ message: "Error clearing users", error: err.message });
          }
          
          // Clean up uploads directory
          const uploadsDir = path.join(__dirname, "uploads");
          if (fs.existsSync(uploadsDir)) {
            fs.readdir(uploadsDir, (err, files) => {
              if (!err) {
                files.forEach(file => {
                  fs.unlink(path.join(uploadsDir, file), (err) => {
                    if (err) console.log("Warning: Could not delete file:", file);
                  });
                });
              }
            });
          }
          
          res.status(200).json({ message: "Database reset successfully. All data has been deleted." });
        });
      });
    });
  } catch (err) {
    console.error("Error resetting database:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// OTP Display Route (for testing)
app.get("/otps", (req, res) => {
  const otps = getAllOTPs();
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>OTP Display - Research Paper System</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .otp-item { background: #e3f2fd; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #2196f3; }
        .otp-code { font-size: 24px; font-weight: bold; color: #1976d2; margin: 10px 0; }
        .email { color: #666; font-size: 14px; }
        .expires { color: #f57c00; font-size: 12px; }
        .no-otps { text-align: center; color: #666; padding: 40px; }
        .refresh { background: #4caf50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 20px 0; }
        .refresh:hover { background: #45a049; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 OTP Display (Development Mode)</h1>
        <p>This page shows all active OTPs for testing purposes.</p>
        <button class="refresh" onclick="window.location.reload()">🔄 Refresh</button>
        
        ${otps.length === 0 ? 
          '<div class="no-otps">No active OTPs found. Try signing up or requesting password reset.</div>' :
          otps.map(otp => `
            <div class="otp-item">
              <div class="email"><strong>Email:</strong> ${otp.email}</div>
              <div class="otp-code">OTP: ${otp.otp}</div>
              <div class="expires"><strong>Type:</strong> ${otp.type} | <strong>Expires:</strong> ${otp.expires.toLocaleString()}</div>
            </div>
          `).join('')
        }
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          <strong>Note:</strong> This is for development testing only. In production, OTPs are sent via email.
        </p>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// Default Route
app.get("/", (req, res) => {
  res.send("Welcome to the Publication Management System API (Persistent Database)");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (Persistent Database)`);
  console.log(`💾 Data will be saved to: database.sqlite`);
  console.log(`🔄 Data persists across restarts!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});

module.exports = app;

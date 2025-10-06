# Research Paper Submission System - Setup Guide

## Prerequisites

Before running the system, ensure you have the following installed:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - Choose one option:
   - **Option A: Local MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
   - **Option B: MongoDB Atlas** (Cloud) - [Sign up here](https://www.mongodb.com/atlas)

## Quick Setup

### 1. Install Dependencies

**Backend:**
```bash
cd publication-system-backend/publication-system
npm install
```

**Frontend:**
```bash
cd frontend-DASS
npm install
```

### 2. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service:
   - Windows: Run `mongod` in command prompt
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

#### Option B: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update the `.env` file with your Atlas connection string

### 3. Environment Configuration

The `.env` file is already created in `publication-system-backend/publication-system/.env`:

```env
MONGO_URI=mongodb://localhost:27017/publication-system
JWT_SECRET=your_super_secret_jwt_key_here_12345
PORT=5000
NODE_ENV=development
```

**For MongoDB Atlas, update MONGO_URI to:**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/publication-system?retryWrites=true&w=majority
```

### 4. Create Test Users

Run the seed script to create test users:

```bash
cd publication-system-backend/publication-system
node seedUsers.js
```

This will create:
- **Admin:** admin@dass.com / admin123
- **Author:** author@dass.com / author123
- **Author:** john@example.com / password123
- **Author:** jane@example.com / password123

### 5. Start the System

#### Method 1: Use the batch file (Windows)
```bash
start-system.bat
```

#### Method 2: Manual start

**Terminal 1 - Backend:**
```bash
cd publication-system-backend/publication-system
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend-DASS
npm run dev
```

### 6. Access the System

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## Testing the Authentication System

### 1. Test Registration
1. Go to http://localhost:5173/login
2. Click "Don't have an account? Sign Up"
3. Fill in the form:
   - Name: Your Name
   - Email: your@email.com
   - Password: password123 (8+ characters)
   - Role: Author or Admin
4. Click "Sign Up"

### 2. Test Login
1. Use the test credentials or your registered account
2. Select the correct role (Author/Admin)
3. Click "Login"

### 3. Test Features
- **Authors:** Can submit papers, view dashboard, submit to conferences
- **Admins:** Can approve/reject papers, create conferences, view all data

## Troubleshooting

### Common Issues

1. **"Cannot connect to MongoDB"**
   - Ensure MongoDB is running locally, or
   - Check your Atlas connection string
   - Verify network connectivity

2. **"Port already in use"**
   - Change PORT in .env file
   - Kill existing processes using the port

3. **"CORS errors"**
   - Ensure frontend runs on localhost:5173
   - Check backend CORS configuration

4. **"JWT errors"**
   - Verify JWT_SECRET in .env
   - Clear localStorage and try again

### Debug Mode

Set `NODE_ENV=development` in .env to see detailed error messages.

## API Endpoints

### Authentication
- `POST /users/register` - Register new user
- `POST /users/login` - User login
- `GET /users/me` - Get current user profile

### Publications
- `POST /publications/add` - Submit new paper
- `GET /publications/mine` - Get user's papers
- `PUT /publications/:id/status` - Update paper status (admin only)

### Conferences
- `POST /conference` - Create conference (admin only)
- `GET /conference` - Get all conferences
- `POST /conference/submit` - Submit paper to conference

## System Features

### For Authors:
- ✅ User registration and authentication
- ✅ Submit research papers with PDF uploads
- ✅ Track paper status (pending, approved, rejected)
- ✅ Submit approved papers to conferences
- ✅ Personal dashboard with all publications
- ✅ Profile management

### For Admins:
- ✅ Approve or reject submitted papers
- ✅ Create and manage conferences
- ✅ View all submissions and user data
- ✅ Admin dashboard for system management

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Input validation and sanitization
- ✅ Role-based access control
- ✅ CORS protection
- ✅ Error handling without sensitive data exposure

## Next Steps

1. **Production Deployment:**
   - Use a production MongoDB instance
   - Set strong JWT secrets
   - Configure proper CORS origins
   - Use environment variables for sensitive data

2. **Additional Features:**
   - Email notifications
   - File type validation
   - User profile pictures
   - Advanced search and filtering
   - Paper review system

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all prerequisites are installed
3. Ensure MongoDB is running and accessible
4. Check network connectivity
5. Review the troubleshooting section above

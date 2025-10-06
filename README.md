# Research Paper Submission System (DASS)

A comprehensive web application that connects authors to conferences for research paper submissions.

## Features

### For Authors:
- User registration and authentication
- Submit research papers with PDF uploads
- Track paper submission status (pending, approved, rejected)
- Submit approved papers to conferences
- View personal dashboard with all publications
- Profile management

### For Admins:
- Approve or reject submitted papers
- Create and manage conferences
- View all submissions and user data
- Admin dashboard for system management

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## Installation & Setup

### 1. Backend Setup

```bash
cd publication-system-backend/publication-system
npm install
```

Create a `.env` file in the `publication-system-backend/publication-system` directory:
```
MONGO_URI=mongodb://localhost:27017/publication-system
JWT_SECRET=your_super_secret_jwt_key_here_12345
PORT=5000
NODE_ENV=development
```

### 2. Frontend Setup

```bash
cd frontend-DASS
npm install
```

### 3. Start the System

#### Option 1: Use the batch file (Windows)
```bash
start-system.bat
```

#### Option 2: Manual start

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

## Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Default Users

You can register new users through the frontend, or create them directly in MongoDB:

### Admin User
- Email: admin@dass.com
- Password: admin123
- Role: admin

### Author User
- Email: author@dass.com
- Password: author123
- Role: author

## API Endpoints

### Authentication
- `POST /users/register` - Register new user
- `POST /users/login` - User login
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile

### Publications
- `POST /publications/add` - Submit new paper
- `GET /publications/mine` - Get user's papers
- `PUT /publications/:id/status` - Update paper status (admin only)

### Conferences
- `POST /conference` - Create conference (admin only)
- `GET /conference` - Get all conferences
- `POST /conference/submit` - Submit paper to conference
- `GET /conference/submissions` - View all submissions (admin only)
- `GET /conference/my-submissions` - View own submissions

## File Structure

```
DASS/
├── frontend-DASS/                 # React frontend
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── pages/               # Page components
│   │   └── assets/              # Static assets
│   └── package.json
├── publication-system-backend/    # Backend API
│   └── publication-system/
│       ├── models/              # MongoDB models
│       ├── routes/              # API routes
│       ├── middleware/          # Authentication middleware
│       ├── uploads/             # PDF file storage
│       └── server.js            # Main server file
└── README.md
```

## Technologies Used

### Frontend:
- React 19
- React Router DOM
- Axios for API calls
- FontAwesome icons
- Material-UI components

### Backend:
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- CORS for cross-origin requests

## Development Notes

- The system uses JWT tokens for authentication
- PDF files are stored in the `uploads` directory
- All API calls require proper authentication headers
- CORS is configured for localhost:5173 (frontend dev server)

## Troubleshooting

1. **MongoDB Connection Issues**: Ensure MongoDB is running locally or update the MONGO_URI in .env
2. **CORS Errors**: Check that the frontend is running on localhost:5173
3. **File Upload Issues**: Ensure the uploads directory exists and has proper permissions
4. **Authentication Issues**: Check JWT_SECRET in .env file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

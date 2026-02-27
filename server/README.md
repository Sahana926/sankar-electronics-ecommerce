# Backend API - Sankar Electrical and Hardwares Store

Express.js backend with MongoDB for user authentication, contact form, and store management.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/store
JWT_SECRET=your-secret-key-change-in-production
```

3. Make sure MongoDB is running:
   - If using MongoDB Compass, connect to `mongodb://localhost:27017`
   - The database `store` will be created automatically
   - Or update `MONGODB_URI` in `.env` to your MongoDB connection string

4. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

## MongoDB Database

- **Database Name:** `store`
- **Collections:**
  - `users` - User accounts (signup/login)
  - `contacts` - Contact form submissions
  - `logins` - Login history and activity tracking
    - Tracks all login attempts (success/failed)
    - Stores IP address, user agent, timestamp
    - Links to user account
    - Tracks failure reasons

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
  - Body: `{ fullName, email, phone, password }`
  - Returns: User object (without password)
  
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ token, user }` (JWT token for authentication)
  - **Automatically logs login attempt to `login` collection**
  
- `GET /api/auth/me` - Get current user (Protected - requires token)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Current user object
  
- `POST /api/auth/verify` - Verify JWT token (Protected - requires token)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Token validity and user info
  
- `POST /api/auth/logout` - Logout user (Protected - requires token)
  - Headers: `Authorization: Bearer <token>`
  - Note: Token removal is handled client-side
  
- `GET /api/auth/login-history` - Get login history for current user (Protected)
  - Headers: `Authorization: Bearer <token>`
  - Query params: `?page=1&limit=10`
  - Returns: User's login history with pagination
  
- `GET /api/auth/all-login-history` - Get all login history (Protected - Admin)
  - Headers: `Authorization: Bearer <token>`
  - Query params: `?page=1&limit=50&email=user@example.com&status=success`
  - Returns: All login history with pagination and filters

### Contact
- `POST /api/contact` - Submit contact form
  - Body: `{ name, email, phone, message }`
  - Returns: Created contact object
  
- `GET /api/contact` - Get all contact messages (admin)
  - Returns: Array of all contact messages

### Health Check
- `GET /api/health` - Server health status
  - Returns: Server status and database connection info

## MongoDB Connection

The backend connects to MongoDB database named **`store`** at:
- Default: `mongodb://localhost:27017/store`
- Can be configured via `MONGODB_URI` in `.env` file

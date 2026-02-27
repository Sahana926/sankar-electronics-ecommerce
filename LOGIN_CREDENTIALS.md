# Sankar Electrical & Hardwares - User Authentication

The application is now fully connected to the MongoDB backend with real authentication.

## How to Get Started

### Step 1: Create Your Account
1. Navigate to the **Sign Up** page
2. Fill in the following information:
   - Full Name (minimum 2 characters)
   - Email Address (valid email format)
   - Phone Number (10 digits)
   - Password (must contain: letter, number, special character, minimum 8 characters)
   - Confirm Password (must match)
3. Click **Sign Up**
4. You will be redirected to the **Login** page

### Step 2: Login
1. Navigate to the **Login** page (or click the login link)
2. Enter your registered email address
3. Enter your password
4. Click **Login**
5. You will be redirected to the shop page with authenticated access

## Features

- ✅ Real backend authentication with MongoDB
- ✅ Secure password hashing (bcryptjs)
- ✅ JWT token-based authentication
- ✅ User registration with validation
- ✅ Protected routes for authenticated users
- ✅ Profile management with backend sync
- ✅ Cart, Wishlist, and Orders functionality
- ✅ Login history tracking

## Backend Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### User Profile
- `GET /api/users/me` - Get user profile (protected)
- `PUT /api/users/update-profile` - Update user profile (protected)
- `DELETE /api/users/delete-account` - Delete user account (protected)

### Profiles Collection (New)
- `GET /api/profiles/:userId` - Get profile by userId
- `GET /api/profiles/me` - Get current user's profile (protected)
- `POST /api/profiles` - Create new profile (protected)
- `PUT /api/profiles/:profileId` - Update profile (protected)
- `DELETE /api/profiles/:profileId` - Delete profile (protected)
- `GET /api/profiles/search/:query` - Search profiles (protected)

## Validation Rules

### Password Requirements
- Minimum 8 characters
- Must contain at least one letter (a-z, A-Z)
- Must contain at least one number (0-9)
- Must contain at least one special character (!@#$%^&*(),.?":{}|<>)

### Phone Number
- Must be exactly 10 digits
- Spaces and dashes are automatically removed

### Email
- Must be a valid email format
- Must be unique (no duplicate accounts)

## Status

✅ Real authentication system connected to MongoDB
✅ No test users - all users must signup
✅ Frontend properly validates and communicates with backend
✅ Secure password handling with bcryptjs
✅ JWT token-based session management


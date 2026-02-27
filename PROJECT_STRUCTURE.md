# Project Structure - Sankar Electrical and Hardwares

## Folder Structure

```
consultancy/
├── src/
│   ├── components/
│   │   ├── Header.jsx              # Navigation header with auth-aware menu
│   │   └── ProtectedRoute.jsx      # Route protection component
│   ├── context/
│   │   └── AuthContext.jsx          # Authentication context provider
│   ├── pages/
│   │   ├── Home.jsx                # Homepage (public)
│   │   ├── Login.jsx               # Login page (public)
│   │   ├── Signup.jsx              # Signup page (public)
│   │   ├── Products.jsx           # Products page (public)
│   │   ├── Contact.jsx             # Contact page (public)
│   │   └── Shop.jsx                # Shop page (protected - requires login)
│   ├── App.jsx                     # Main app with routing setup
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── server/                         # Backend API (Express + MongoDB)
│   ├── models/
│   │   ├── User.js                 # User model
│   │   ├── Contact.js               # Contact model
│   │   └── Login.js                 # Login history model
│   ├── routes/
│   │   ├── auth.js                  # Authentication routes
│   │   └── contact.js               # Contact routes
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication middleware
│   └── server.js                    # Express server
├── index.html                       # HTML template
├── package.json                     # Frontend dependencies
└── vite.config.js                  # Vite configuration
```

## Component Details

### 1. **AuthContext.jsx** (`src/context/AuthContext.jsx`)
- Manages authentication state globally
- Provides `login()`, `logout()`, `isAuthenticated`, and `user` to all components
- Uses localStorage to persist login state

### 2. **ProtectedRoute.jsx** (`src/components/ProtectedRoute.jsx`)
- Wraps routes that require authentication
- Redirects to login if user is not authenticated
- Preserves intended destination for redirect after login

### 3. **Home.jsx** (`src/pages/Home.jsx`)
- Public homepage
- **Shop Now button**: Redirects to login if not authenticated, to shop if authenticated

### 4. **Products.jsx** (`src/pages/Products.jsx`)
- Public page showing product catalog
- **Visit Shop button**: Checks authentication, redirects to login if not logged in

### 5. **Login.jsx** (`src/pages/Login.jsx`)
- Email and password validation
- Connects to backend API (with fallback dummy login)
- Redirects to shop or intended page after successful login

### 6. **Signup.jsx** (`src/pages/Signup.jsx`)
- Comprehensive validation:
  - Email format validation
  - Phone number validation (10 digits)
  - Password validation (letter, number, special char, min 8 chars)
  - Password confirmation match
- Redirects to login after successful signup

### 7. **Shop.jsx** (`src/pages/Shop.jsx`)
- Protected route (requires login)
- Shopping page with product items
- Add to cart functionality

### 8. **Header.jsx** (`src/components/Header.jsx`)
- Shows Login/Signup when logged out
- Shows Shop link, user name, and Logout when logged in
- Active route highlighting

## Routing Setup

### Public Routes (No Login Required)
- `/` - Homepage
- `/login` - Login page
- `/signup` - Signup page
- `/products` - Products catalog
- `/contact` - Contact form

### Protected Routes (Login Required)
- `/shop` - Shopping page

## Validation Rules

### Email Validation
- Format: `user@example.com`
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Phone Number Validation
- Must be exactly 10 digits
- Spaces and dashes are automatically removed
- Regex: `/^[0-9]{10}$/`

### Password Validation (Signup)
- Minimum 8 characters
- At least one letter (a-z, A-Z)
- At least one number (0-9)
- At least one special character (!@#$%^&*(),.?":{}|<>)

## Button Behaviors

1. **Homepage "Shop Now" button**
   - Not logged in → Redirects to `/login`
   - Logged in → Redirects to `/shop`

2. **Products page "Visit Shop" button**
   - Not logged in → Redirects to `/login` (with return path)
   - Logged in → Redirects to `/shop`

3. **Products link in header**
   - Always accessible (public route)

4. **Shop link in header**
   - Only visible when logged in
   - Protected route (redirects to login if accessed directly)

## Authentication Flow

1. User clicks "Shop Now" or "Visit Shop"
2. If not logged in → Redirected to `/login`
3. After login → Redirected to intended page (`/shop`)
4. Login state stored in localStorage
5. Header updates to show user info and logout option

## Dummy Login (For Testing)

When backend is not available, set `useDummyLogin = true` in `Login.jsx`:
- Accepts any email/password
- Creates dummy token and user
- Allows testing protected routes without backend

## Comments in Code

All components include:
- File header comments explaining purpose
- Inline comments for complex logic
- Function comments for validation functions
- Route protection comments


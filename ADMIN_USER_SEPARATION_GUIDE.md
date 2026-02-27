# Admin & User Separation Architecture

## Overview
This document describes how the application completely separates admin and user functionality with role-based access control.

---

## Directory Structure

```
src/
├── routes/
│   ├── adminRoutes.jsx      # All admin routes definitions
│   └── userRoutes.jsx       # All user routes definitions
├── pages/
│   ├── admin/               # Admin pages (future migration)
│   ├── user/                # User pages (future migration)
│   ├── AdminLogin.jsx       # Admin authentication
│   ├── AdminDashboard.jsx
│   ├── AdminProducts.jsx
│   ├── reports/
│   ├── Login.jsx            # User authentication
│   ├── Home.jsx
│   ├── Shop.jsx
│   └── ... (user pages)
├── components/
│   ├── admin/               # Admin components
│   ├── user/                # User components
│   ├── AdminProtectedRoute.jsx
│   └── ProtectedRoute.jsx
├── context/
│   └── AuthContext.jsx      # Manages both admin and user auth
└── utils/
    └── tokenManager.js      # Token management with role separation
```

---

## Authentication Flow

### User Authentication
```
1. User navigates to /login
2. User enters email & password
3. Backend validates credentials (role must be 'user' or no admin role)
4. Backend returns JWT token
5. Token stored in localStorage with key: "user_token"
6. User data stored with key: "user_user"
7. User redirected to /shop or protected route
```

### Admin Authentication
```
1. Admin navigates to /admin/login
2. Admin enters email & password
3. Backend validates credentials (role must be 'admin')
4. Backend returns JWT token
5. Token stored in localStorage with key: "admin_token"
6. Admin data stored with key: "admin_user"
7. Admin redirected to /admin dashboard
```

---

## Token Management

### Storage Keys (Completely Separate)
```javascript
// User Storage Keys
localStorage.setItem('user_token', userJWT)
localStorage.setItem('user_user', JSON.stringify(userData))

// Admin Storage Keys
localStorage.setItem('admin_token', adminJWT)
localStorage.setItem('admin_user', JSON.stringify(adminData))
```

### Token Retrieval
```javascript
import { getToken, getCurrentUser } from './utils/tokenManager'

// Get user token
const userToken = getToken('user')          // Returns auth token or null
const userData = getCurrentUser('user')     // Returns user data or null

// Get admin token
const adminToken = getToken('admin')        // Returns auth token or null
const adminData = getCurrentUser('admin')   // Returns admin data or null
```

---

## Route Protection

### AdminProtectedRoute (Protects /admin/*)
```jsx
function AdminProtectedRoute({ children }) {
  const adminToken = getToken('admin')
  const adminUser = getCurrentUser('admin')
  
  // Must have admin token
  if (!adminToken) return <Navigate to="/admin/login" />
  
  // Must have admin role
  if (adminUser?.role !== 'admin') return <Navigate to="/unauthorized" />
  
  return children
}
```

### ProtectedRoute (Protects user routes)
```jsx
function ProtectedRoute({ children }) {
  const userToken = getToken('user')
  const currentUser = getCurrentUser('user')
  
  // Cannot be admin
  if (currentUser?.role === 'admin') return <Navigate to="/admin" />
  
  // Must have user token
  if (!userToken) return <Navigate to="/login" />
  
  return children
}
```

---

## Access Control Matrix

| User Type | Can Access | Redirects To | Result |
|-----------|------------|--------------|--------|
| Anonymous | `/` `/login` `/signup` | - | ✅ Allowed |
| Regular User | `/shop` `/product/:id` `/checkout` | - | ✅ Allowed |
| Regular User | `/admin` `/admin/reports` | `/login` | ❌ Redirected to login |
| Admin | `/admin` `/admin/products` | - | ✅ Allowed |
| Admin | `/shop` `/checkout` | `/admin` | ❌ Redirected to admin |
| Admin | `/login` | `/admin` | ❌ Already logged in as admin |

---

## Backend Middleware Protection

### Authentication Middleware
```javascript
export const authenticateToken = async (req, res, next) => {
  // Verify JWT token from Authorization header
  // Attach user data to req.user
  // Called by all protected routes
}
```

### Admin-Only Middleware
```javascript
export const requireAdmin = (req, res, next) => {
  // Check req.user.role === 'admin'
  // Return 403 if not admin
  // Protects: /api/admin/* routes
}
```

### Protected Routes Pattern
```javascript
// Admin-only endpoints
router.get('/api/admin/products', authenticateToken, requireAdmin, ...)
router.get('/api/admin/orders', authenticateToken, requireAdmin, ...)
router.get('/api/admin/users', authenticateToken, requireAdmin, ...)

// User-accessible endpoints
router.get('/api/products', authenticateToken, ...)
router.post('/api/cart/add', authenticateToken, ...)
router.get('/api/orders', authenticateToken, ...)
```

---

## Login Validation

### User Login (`/api/auth/login`)
```javascript
// Accepts: email, password
// Validates:
// - Email exists in database
// - Password matches
// - role !== 'admin' (rejects admin users)
// Returns: JWT token for user routes
```

### Admin Login (`/api/auth/admin-login`)
```javascript
// Accepts: email, password
// Validates:
// - Email exists in database
// - Password matches
// - role === 'admin' (only admins can login)
// Returns: JWT token with admin privileges
```

---

## Key Security Features

### 1. **Separate Token Storage**
- User and admin tokens are stored separately
- Cannot accidentally use admin token for user routes
- Cannot accidentally use user token for admin routes

### 2. **Role-Based Access Control (RBAC)**
- Every protected route checks user role
- Frontend components validate before rendering
- Backend middleware validates on every API call

### 3. **Route-Level Protection**
- Admin routes (`/admin/*`) only accessible with admin login
- User routes (`/shop/*`, `/cart/*`, etc.) only accessible with user login
- Automatic redirects prevent unauthorized access

### 4. **Complete Separation**
- Admin frontend at `/admin/...`
- User frontend at `/...`
- No shared authentication UI
- Separate login pages
- Different headers and navigation

### 5. **Logout Handling**
- Clearing user token leaves admin session intact
- Clearing admin token leaves user session intact
- Can be logged in as both simultaneously (different browser tabs)

---

## Common Operations

### User Login
```javascript
// User clicks login
// Navigates to /login
// AuthContext handles "user" auth
// Token saved as "user_token"
// Redirected to /shop
```

### Admin Login
```javascript
// Admin clicks login link
// Navigates to /admin/login
// AuthContext handles "admin" auth
// Token saved as "admin_token"
// Redirected to /admin
```

### Logout (User)
```javascript
// Clear user session only
localStorage.removeItem('user_token')
localStorage.removeItem('user_user')
// Navigate to /login
// Admin token remains intact
```

### Logout (Admin)
```javascript
// Clear admin session only
localStorage.removeItem('admin_token')
localStorage.removeItem('admin_user')
// Navigate to /admin/login
// User token remains intact
```

### Check Current Auth
```javascript
import { getToken, getCurrentUser } from './utils/tokenManager'

// Check if user is logged in
const isUserLoggedIn = !!getToken('user')

// Check if admin is logged in
const isAdminLoggedIn = !!getToken('admin')

// Get current user data
const userData = getCurrentUser('user')     // null if not logged in
const adminData = getCurrentUser('admin')   // null if not logged in

// Check roles
const isAdmin = adminData?.role === 'admin'
const isRegularUser = userData?.role !== 'admin'
```

---

## File Organization Reference

### Routes (`src/routes/`)
- `userRoutes.jsx` - All user-side routes (/', /login, /shop, etc.)
- `adminRoutes.jsx` - All admin-side routes (/admin, /admin/products, etc.)

### Components (`src/components/`)
- `ProtectedRoute.jsx` - Guards user routes, prevents admin access
- `AdminProtectedRoute.jsx` - Guards admin routes, prevents user access
- `user/` - User-specific components
- `admin/` - Admin-specific components

### Pages (`src/pages/`)
- `Login.jsx` - User login page
- `AdminLogin.jsx` - Admin login page
- `Home.jsx` - Public/user homepage
- `AdminDashboard.jsx` - Admin dashboard
- `admin/` - Admin-only pages (future)
- `user/` - User-only pages (future)

---

## Adding New Routes

### Add New User Route
```javascript
// 1. Create page component in src/pages/
// 2. Add to src/routes/userRoutes.jsx
{
  path: '/new-page',
  element: (
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  ),
}
// 3. Route automatically available in user dashboard
```

### Add New Admin Route
```javascript
// 1. Create page component in src/pages/
// 2. Add to src/routes/adminRoutes.jsx
{
  path: '/admin/new-feature',
  element: (
    <AdminProtectedRoute>
      <NewFeature />
    </AdminProtectedRoute>
  ),
}
// 3. Route automatically available in admin dashboard
```

### Add Protected API Endpoint
```javascript
// In server/routes/yourRoute.js
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

// User-accessible endpoint
router.get('/api/products', authenticateToken, async (req, res) => {
  // Available to authenticated users only
})

// Admin-only endpoint  
router.get('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  // Available to admins only
  // Automatic 403 for non-admins
})
```

---

## Troubleshooting

### Issue: User can access /admin routes
**Solution:** Ensure ProtectedRoute checks for admin role and redirects

### Issue: Admin can access /shop routes
**Solution:** Ensure AdminProtectedRoute is properly applied

### Issue: Token persists after logout
**Solution:** Call logout function that clears appropriate storage keys

### Issue: Wrong token being used
**Solution:** Verify token manager is using correct storage keys (user_token vs admin_token)

### Issue: Role not updating after database change
**Solution:** Logout and login again to refresh token

---

## Best Practices

1. **Always use separate storage keys** - Never mix admin and user tokens
2. **Validate role on both frontend and backend** - Defense in depth
3. **Redirect to appropriate login page** - /login for users, /admin/login for admins
4. **Handle logout carefully** - Clear only relevant tokens
5. **Use route arrays** - Keep routes in centralized configuration
6. **Test both directions** - Ensure users can't access admin AND admins can't access user routes

---

## Summary

This architecture ensures:
- ✅ Admins cannot accidentally access user dashboard
- ✅ Users cannot access admin features
- ✅ Separate login pages and authentication flows
- ✅ Separate token storage and management
- ✅ Complete frontend and backend protection
- ✅ Clear, maintainable code structure

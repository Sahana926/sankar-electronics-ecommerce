# Backend API Separation - Admin vs User Routes

## Overview
The backend clearly separates admin and user endpoints with proper middleware protection.

---

## Route Organization

### Backend Routes (`server/routes/`)
```
├── auth.js                  # Login endpoints (user & admin share, but validate)
├── products.js              # User-facing product endpoints
├── adminProducts.js         # Admin-only product management
├── orders.js                # User order endpoints
├── adminOrders.js           # Admin order management
├── adminDashboard.js        # Admin dashboard & reports
├── cart.js                  # User cart management
├── wishlist.js              # User wishlist
├── payments.js              # Payment processing
├── profiles.js              # User profile management
├── users.js                 # User endpoints
└── ... (other user routes)
```

---

## Middleware Protection

### Middleware Chain
```
Request → CORS Check → Body Parser → Route Handler → [Auth Middleware] → [Admin Check] → Logic
```

### Authentication Middleware
```javascript
// Located: server/middleware/auth.js
export const authenticateToken = async (req, res, next) => {
  // 1. Extract token from Authorization header
  // 2. Verify JWT signature
  // 3. Load user from database
  // 4. Attach req.user with full user object
  // 5. Call next()
  // Returns 401 if token invalid/expired
}
```

### Admin-Only Middleware
```javascript
export const requireAdmin = (req, res, next) => {
  // Check: req.user.role === 'admin'
  // Returns 403 Forbidden if not admin
  // Prevents non-admins from accessing route
}
```

---

## API Endpoints by Category

### PUBLIC ENDPOINTS (No Auth Required)
```
POST   /api/auth/login              # Both users and admins use this
POST   /api/auth/signup             # Regular users only
GET    /api/products                # Public product list
GET    /api/contact                 # Contact form submission
```

### USER ENDPOINTS (Auth Required, Regular Users Only)
```
# Cart Management
POST   /api/cart/add                # authenticateToken
PUT    /api/cart/update             # authenticateToken
DELETE /api/cart/remove             # authenticateToken

# Wishlist
POST   /api/wishlist/add            # authenticateToken
GET    /api/wishlist                # authenticateToken
DELETE /api/wishlist/remove         # authenticateToken

# Orders
GET    /api/orders                  # authenticateToken
GET    /api/orders/:id              # authenticateToken
POST   /api/orders                  # authenticateToken

# Payments
POST   /api/payments/verify         # authenticateToken
GET    /api/payments/config         # authenticateToken

# Profile
GET    /api/profiles                # authenticateToken
PUT    /api/profiles                # authenticateToken
```

### ADMIN ENDPOINTS (Auth Required + Admin Role Required)
```
# Product Management
GET    /api/admin/products          # authenticateToken, requireAdmin
POST   /api/admin/products          # authenticateToken, requireAdmin
PUT    /api/admin/products/:id      # authenticateToken, requireAdmin
DELETE /api/admin/products/:id      # authenticateToken, requireAdmin

# Order Management
GET    /api/admin/orders            # authenticateToken, requireAdmin
GET    /api/admin/orders/:id        # authenticateToken, requireAdmin
PATCH  /api/admin/orders/:id/status # authenticateToken, requireAdmin

# Dashboard & Reports
GET    /api/admin/metrics           # authenticateToken, requireAdmin
GET    /api/admin/users             # authenticateToken, requireAdmin
GET    /api/admin/reports/low-stock # authenticateToken, requireAdmin
GET    /api/admin/reports/out-of-stock # authenticateToken, requireAdmin
```

---

## Server Registration

### server.js Setup
```javascript
// Load middleware
app.use(cors({ origin: allowedOrigins }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Register Public Routes
app.use('/api/auth', authRoutes)              # No protection needed
app.use('/api/contact', contactRoutes)        # No protection needed
app.use('/api/products', productsRoutes)      # Public product list

// Register User Routes
app.use('/api/cart', cartRoutes)              # Protected by ProtectedRoute on frontend
app.use('/api/orders', orderRoutes)           # Protected by ProtectedRoute on frontend
app.use('/api/profiles', profileRoutes)       # Protected by ProtectedRoute on frontend
app.use('/api/wishlist', wishlistRoutes)      # Protected by ProtectedRoute on frontend

// Register Admin Routes
app.use('/api/admin/products', adminProductsRoutes)    # requireAdmin middleware inside
app.use('/api/admin/orders', adminOrdersRoutes)        # requireAdmin middleware inside
app.use('/api/admin', adminDashboardRoutes)            # requireAdmin middleware inside

// Health check
app.get('/api/health', (req, res) => { ... })
```

---

## Example: Protected Admin Endpoint

### File: `server/routes/adminProducts.js`
```javascript
import express from 'express'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import Product from '../models/Product.js'

const router = express.Router()

// ALL routes in this file require admin
// Middleware is applied to each route

// Get all products (admin view)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Admin:', req.user.email, '- Fetching all products for admin dashboard')
    
    const products = await Product.find()
    res.json({ data: products })
  } catch (error) {
    console.error('Admin product fetch error:', error)
    res.status(500).json({ message: 'Failed to fetch products' })
  }
})

// Create product (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Admin:', req.user.email, '- Creating new product')
    
    const product = new Product(req.body)
    await product.save()
    res.json({ message: 'Product created', product })
  } catch (error) {
    console.error('Admin product creation error:', error)
    res.status(500).json({ message: 'Failed to create product' })
  }
})

// Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Admin:', req.user.email, '- Updating product:', req.params.id)
    
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ message: 'Product updated', product })
  } catch (error) {
    console.error('Admin product update error:', error)
    res.status(500).json({ message: 'Failed to update product' })
  }
})

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Admin:', req.user.email, '- Deleting product:', req.params.id)
    
    await Product.findByIdAndDelete(req.params.id)
    res.json({ message: 'Product deleted' })
  } catch (error) {
    console.error('Admin product delete error:', error)
    res.status(500).json({ message: 'Failed to delete product' })
  }
})

export default router
```

Middleware Execution:
```
Request to /api/admin/products/123
  ↓
authenticateToken
  - Extract token from header
  - Verify JWT
  - Load user from DB
  - Set req.user
  ↓
Is user authenticated? NO → Return 401
  ↓
requireAdmin
  - Check req.user.role === 'admin'
  ↓
Is admin? NO → Return 403
  ↓
Delete product
  - Execute route handler
  ↓
Return success response
```

---

## JWT Token Structure

### User Token (Created on /api/auth/login)
```javascript
// Payload
{
  userId: "507f1f77bcf86cd799439011",
  email: "user@example.com",
  role: "user",
  iat: 1712345678,
  exp: 1712432078
}

// Stored as: Authorization: Bearer eyJhbGc...
// Saved in: localStorage["user_token"]
```

### Admin Token (Must have role: admin in database)
```javascript
// Payload
{
  userId: "507f1f77bcf86cd799439012",
  email: "admin@example.com",
  role: "admin",
  iat: 1712345678,
  exp: 1712432078
}

// Stored as: Authorization: Bearer eyJhbGc...
// Saved in: localStorage["admin_token"]
```

---

## Role Validation at Login

### User Login
```javascript
// POST /api/auth/login
const user = await User.findOne({ email })

// Validate password
const validPassword = await bcrypt.compare(password, user.password)

// IMPORTANT: Check they are not admin
if (user.role === 'admin') {
  return res.status(403).json({ 
    message: 'Admin must use admin login' 
  })
}

// Create user token
const token = jwt.sign(
  { userId: user._id, email: user.email, role: 'user' },
  JWT_SECRET,
  { expiresIn: '24h' }
)

res.json({ token, user })
```

### Admin Login (Future: Separate Endpoint)
```javascript
// POST /api/auth/admin-login
const user = await User.findOne({ email })

// Validate password
const validPassword = await bcrypt.compare(password, user.password)

// IMPORTANT: Check they ARE admin
if (user.role !== 'admin') {
  return res.status(403).json({ 
    message: 'Admin access required' 
  })
}

// Create admin token
const token = jwt.sign(
  { userId: user._id, email: user.email, role: 'admin' },
  JWT_SECRET,
  { expiresIn: '24h' }
)

res.json({ token, user })
```

---

## Error Responses

### 401 Unauthorized
```
GET /api/admin/products (without token)
Response: {
  "message": "Access token required"
}
```

### 403 Forbidden
```
GET /api/admin/products (with user token, not admin)
Response: {
  "message": "Admin access required"
}
```

### 404 Not Found
```
GET /api/admin/products/invalid-id
Response: {
  "message": "Product not found"
}
```

---

## Testing Endpoints

### Test User Endpoint (Works)
```bash
curl -H "Authorization: Bearer USER_TOKEN" \
  http://localhost:5001/api/orders
# Returns: { data: [...] }
```

### Test Admin Endpoint with User Token (Fails)
```bash
curl -H "Authorization: Bearer USER_TOKEN" \
  http://localhost:5001/api/admin/products
# Returns: 403 { message: "Admin access required" }
```

### Test Admin Endpoint with Admin Token (Works)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5001/api/admin/products
# Returns: { data: [...] }
```

---

## Best Practices

1. **Always use middleware chain** - authenticateToken → requireAdmin
2. **log access** - Track who accessed what and when
3. **Consistent error responses** - Always return proper HTTP status codes
4. **Validate requests** - Check input data integrity
5. **Atomic operations** - Use transactions for critical updates
6. **Audit sensitive actions** - Log all admin modifications

---

## Adding New Admin Endpoint

### Step 1: Create Route Handler
```javascript
// server/routes/adminNewFeature.js
import express from 'express'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Admin-only logic
    res.json({ data: '...' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
```

### Step 2: Register in server.js
```javascript
import adminNewFeatureRoutes from './routes/adminNewFeature.js'

app.use('/api/admin/new-feature', adminNewFeatureRoutes)
```

### Step 3: The middleware automatically protects:
- ✅ Verifies JWT token
- ✅ Checks admin role
- ✅ Returns 401/403 if unauthorized
- ✅ Allows access if valid admin

---

This backend structure ensures complete role-based separation at the API level.

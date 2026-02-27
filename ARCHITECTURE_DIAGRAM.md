# 🏗️ SYSTEM ARCHITECTURE

## Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LOGIN FLOW                         │
└─────────────────────────────────────────────────────────────────┘

User Browser
    │
    ├─> /login (Normal User)
    │      │
    │      ├─> POST /api/auth/login
    │      │      │
    │      │      ├─> Check credentials
    │      │      ├─> Generate JWT (userId, email, role='user')
    │      │      └─> Return token + user data
    │      │
    │      ├─> Save token to localStorage
    │      └─> Redirect to /shop
    │
    └─> /admin/login (Admin User)
           │
           ├─> POST /api/auth/login
           │      │
           │      ├─> Check credentials
           │      ├─> Verify role='admin'
           │      ├─> Generate JWT (userId, email, role='admin')
           │      └─> Return token + user data
           │
           ├─> Frontend validates user.role === 'admin'
           ├─> Save token to localStorage
           └─> Redirect to /admin


┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN PROTECTION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

User Attempts Access
    │
    ├─> Frontend: /admin/*
    │      │
    │      ├─> AdminProtectedRoute checks:
    │      │      ├─> isAuthenticated? → No → /admin/login
    │      │      ├─> user.role='admin'? → No → /unauthorized
    │      │      └─> Yes → Allow access
    │      │
    │      └─> Component renders
    │
    └─> Backend: /api/admin/*
           │
           ├─> authenticateToken middleware:
           │      ├─> Token present? → No → 401 Unauthorized
           │      ├─> Token valid? → No → 401 Invalid Token
           │      ├─> User exists? → No → 401 User Not Found
           │      └─> Yes → Continue
           │
           ├─> requireAdmin middleware:
           │      ├─> user.role='admin'? → No → 403 Forbidden
           │      └─> Yes → Continue
           │
           └─> Execute route handler


┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCT MANAGEMENT FLOW                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐           ┌──────────────────┐
│   ADMIN SIDE     │           │    USER SIDE     │
│  (Write Access)  │           │  (Read Access)   │
└──────────────────┘           └──────────────────┘
        │                              │
        │                              │
        ├─> /admin/products            ├─> /shop
        │      │                       │      │
        │      ├─> Add Product         │      └─> GET /api/products
        │      │   POST /api/admin/    │            │
        │      │   products             │            ├─> Filter:
        │      │   [JWT + Admin]       │            │   status='active'
        │      │        │               │            │   softDeleted=false
        │      │        ├─> Validate   │            │
        │      │        ├─> Save to DB │            └─> Return products
        │      │        └─> ✅ Saved    │
        │      │                       │
        │      ├─> Edit Product        │
        │      │   PUT /api/admin/     │
        │      │   products/:id        │
        │      │   [JWT + Admin]       │
        │      │        │               │
        │      │        ├─> Update DB  │
        │      │        └─> ✅ Updated  │
        │      │                       │
        │      ├─> Delete Product      │
        │      │   DELETE /api/admin/  │
        │      │   products/:id        │
        │      │   [JWT + Admin]       │
        │      │        │               │
        │      │        ├─> Soft Delete│
        │      │        │   (set flag) │
        │      │        └─> ✅ Deleted  │
        │      │                       │
        │      └─> Update Stock        │
        │          PATCH /api/admin/   │
        │          products/:id/stock  │
        │          [JWT + Admin]       │
        │               │               │
        │               ├─> Update qty │
        │               └─> ✅ Updated  │
        │                               │
        └───────────────────────────────┴──────────────┐
                                                       │
                        ┌──────────────────────────────┘
                        │
                ┌───────▼────────┐
                │  MongoDB Atlas │
                │   'products'   │
                │   Collection   │
                └────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE STRUCTURE                         │
└─────────────────────────────────────────────────────────────────┘

MongoDB Atlas: sankar_electrical
│
├─> users
│   └─> {
│       _id: ObjectId,
│       fullName: String,
│       email: String (unique),
│       phone: String,
│       password: String (hashed),
│       role: 'user' | 'admin',  ← KEY FIELD
│       address: Object,
│       createdAt: Date,
│       updatedAt: Date
│      }
│
├─> products
│   └─> {
│       _id: ObjectId,
│       name: String,
│       description: String,
│       category: String,
│       price: Number,
│       discountPrice: Number,
│       stockQty: Number,  ← Managed by admin
│       sku: String,
│       images: [String],
│       status: 'active' | 'inactive',
│       softDeleted: Boolean,  ← Soft delete flag
│       createdAt: Date,
│       updatedAt: Date
│      }
│
├─> orders
├─> carts
├─> wishlists
├─> contacts
└─> logins


┌─────────────────────────────────────────────────────────────────┐
│                       SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Frontend Route Guard
┌────────────────────────────────┐
│  AdminProtectedRoute.jsx       │
│  ├─ Check isAuthenticated      │
│  ├─ Check user.role === 'admin'│
│  └─ Redirect if unauthorized   │
└────────────────────────────────┘
           │
           ▼
Layer 2: JWT Token Authentication
┌────────────────────────────────┐
│  authenticateToken middleware  │
│  ├─ Verify Bearer token        │
│  ├─ Decode userId, role        │
│  ├─ Find user in database      │
│  └─ Attach user to request     │
└────────────────────────────────┘
           │
           ▼
Layer 3: Role-Based Authorization
┌────────────────────────────────┐
│  requireAdmin middleware       │
│  ├─ Check req.user.role        │
│  ├─ Must be 'admin'            │
│  └─ 403 Forbidden if not       │
└────────────────────────────────┘
           │
           ▼
      Route Handler
      (Execute logic)


┌─────────────────────────────────────────────────────────────────┐
│                    API ENDPOINT STRUCTURE                       │
└─────────────────────────────────────────────────────────────────┘

PUBLIC ENDPOINTS (No Authentication)
│
├─ POST /api/auth/signup          Create user account
├─ POST /api/auth/login           Login (user/admin)
├─ GET  /api/products             Get active products
├─ GET  /api/products/:id         Get single product
└─ POST /api/contact              Submit contact form


USER ENDPOINTS (JWT Required)
│
├─ GET  /api/auth/me              Get current user
├─ GET  /api/cart                 Get cart
├─ POST /api/cart                 Add to cart
├─ GET  /api/wishlist             Get wishlist
├─ POST /api/wishlist             Add to wishlist
└─ GET  /api/orders               Get user orders


ADMIN ENDPOINTS (JWT + role='admin' Required)
│
├─ Product Management
│  ├─ GET    /api/admin/products
│  ├─ POST   /api/admin/products
│  ├─ GET    /api/admin/products/:id
│  ├─ PUT    /api/admin/products/:id
│  ├─ DELETE /api/admin/products/:id
│  ├─ PATCH  /api/admin/products/:id/restore
│  └─ PATCH  /api/admin/products/:id/stock
│
├─ Order Management
│  ├─ GET    /api/admin/orders
│  └─ PATCH  /api/admin/orders/:id
│
├─ Dashboard
│  └─ GET    /api/admin/metrics
│
└─ Contact Messages
   └─ GET    /api/contact


┌─────────────────────────────────────────────────────────────────┐
│                     DATA SYNC MECHANISM                         │
└─────────────────────────────────────────────────────────────────┘

Admin Makes Change
       │
       ├─> Frontend: Admin clicks "Save"
       │      │
       │      └─> POST/PUT /api/admin/products
       │             │
       │             └─> Backend: Validates & Saves
       │                    │
       │                    └─> MongoDB: Updated
       │
       ▼
MongoDB Database Updated
       │
       ▼
User Refreshes Page
       │
       ├─> Frontend: useEffect() triggers
       │      │
       │      └─> GET /api/products
       │             │
       │             └─> Backend: Queries MongoDB
       │                    │
       │                    └─> Returns latest data
       │
       ▼
User Sees Updated Products ✅


┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT HIERARCHY                          │
└─────────────────────────────────────────────────────────────────┘

App.jsx
│
├─ AuthProvider (Context)
│  └─ Manages: user, token, isAuthenticated
│
├─ CountsProvider (Context)
│  └─ Manages: cartCount, wishlistCount
│
├─ Header (Navigation)
│
├─ PUBLIC ROUTES
│  ├─ Home
│  ├─ Login
│  ├─ Signup
│  ├─ Products
│  ├─ Contact
│  └─ AdminLogin
│
├─ PROTECTED ROUTES (ProtectedRoute)
│  ├─ Shop → Fetches from /api/products
│  ├─ Cart
│  ├─ Wishlist
│  ├─ Orders
│  ├─ Profile
│  └─ Category Pages
│
└─ ADMIN ROUTES (AdminProtectedRoute)
   ├─ AdminDashboard → /api/admin/metrics
   ├─ AdminProducts → /api/admin/products
   ├─ AdminProductEdit → /api/admin/products/:id
   ├─ AdminOrders → /api/admin/orders
   └─ ContactMessages → /api/contact


┌─────────────────────────────────────────────────────────────────┐
│                   EXECUTION FLOW SUMMARY                        │
└─────────────────────────────────────────────────────────────────┘

1. User opens application
2. Sees public pages (Home, Products, Contact)
3. To shop, must login
4. Normal users access /shop, /cart, /wishlist
5. Admin users access /admin, /admin/products
6. Products on user side come from backend
7. Admin changes products → saves to MongoDB
8. Users see changes on refresh
9. All admin routes protected with JWT + role check
10. Unauthorized access blocked at frontend & backend

✅ All requirements implemented
✅ All security layers in place
✅ All data synced via MongoDB

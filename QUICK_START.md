# 🎯 QUICK START GUIDE

## Setup (First Time Only)

### 1. Create Admin User
```bash
cd d:\consultancy
setup-admin.bat
```
**Admin Credentials Created:**
- Email: `admin@sankar.com`
- Password: `Admin@123`

---

## Running the Application

### Start Backend Server (Terminal 1)
```bash
cd d:\consultancy
start-server.bat
```
Server runs at: `http://127.0.0.1:5001`

### Start Frontend (Terminal 2)
```bash
cd d:\consultancy
start-client.bat
```
Frontend runs at: `http://127.0.0.1:5173`

---

## Access Points

### 👤 User Login
**URL:** `http://127.0.0.1:5173/login`
- Create account via signup first
- Normal users cannot access admin panel

### 👨‍💼 Admin Login
**URL:** `http://127.0.0.1:5173/admin/login`
- Email: `admin@sankar.com`
- Password: `Admin@123`

### 📦 Admin Dashboard
**URL:** `http://127.0.0.1:5173/admin`
- View metrics
- Manage products
- View orders
- View contact messages

---

## Admin Features

### Product Management
**URL:** `http://127.0.0.1:5173/admin/products`

**Actions:**
- ➕ Add Product - Click "Add Product" button
- ✏️ Edit Product - Click "Edit" on any product
- 🗑️ Delete Product - Click "Delete" (soft delete)
- ♻️ Restore Product - Click "Restore" on deleted items
- 📊 Update Stock - Edit product and change stockQty

### All Changes Saved to MongoDB Atlas
✅ Products immediately sync to user side
✅ Users see changes on page refresh

---

## User Features

### Shopping
**URL:** `http://127.0.0.1:5173/shop`
- All products from MongoDB backend
- Real-time sync with admin changes
- Only shows active, non-deleted products

---

## Testing Checklist

### ✅ Test Admin Protection
1. Login as normal user
2. Try to access `/admin`
3. **Expected:** Redirected to `/unauthorized`

### ✅ Test Product Management
1. Login as admin
2. Go to `/admin/products`
3. Add new product
4. **Expected:** Product saved to MongoDB

### ✅ Test User Sync
1. Admin adds product
2. User refreshes `/shop`
3. **Expected:** New product appears

### ✅ Test Security
1. Open browser console (F12)
2. Try: `fetch('http://127.0.0.1:5001/api/admin/products')`
3. **Expected:** 401 Unauthorized (no token)

---

## Troubleshooting

### Problem: Cannot create admin user
**Solution:** Check MongoDB connection in `server/.env`
```env
MONGODB_URI=mongodb+srv://...consultancy.iaan7tu.mongodb.net/sankar_electrical
```

### Problem: Admin login shows "Admin access required"
**Solution:** Make sure you ran `setup-admin.bat` to create admin user

### Problem: Products not showing on user side
**Solution:** 
1. Check if products exist: Login as admin → `/admin/products`
2. Ensure products have `status: 'active'` and `softDeleted: false`

### Problem: "Cannot connect to server" error
**Solution:** 
1. Make sure backend is running: `start-server.bat`
2. Check server is on port 5001: `http://127.0.0.1:5001/api/health`

---

## File Structure

```
d:\consultancy\
├── server\
│   ├── server.js              ← Backend entry point
│   ├── seed-admin.js          ← Create admin user
│   ├── models\
│   │   ├── User.js           ← User schema (with role)
│   │   └── Product.js        ← Product schema
│   ├── routes\
│   │   ├── adminProducts.js  ← Admin product routes
│   │   ├── products.js       ← Public product routes
│   │   └── auth.js          ← Authentication
│   └── middleware\
│       └── auth.js           ← JWT + role verification
│
├── src\
│   ├── pages\
│   │   ├── AdminLogin.jsx    ← Admin login page
│   │   ├── AdminProducts.jsx ← Product management
│   │   ├── Shop.jsx          ← User product listing
│   │   └── Unauthorized.jsx  ← Error page
│   └── components\
│       └── AdminProtectedRoute.jsx ← Route guard
│
├── setup-admin.bat           ← Setup script
├── start-server.bat          ← Start backend
└── start-client.bat          ← Start frontend
```

---

## API Endpoints

### Public (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (user/admin) |
| POST | `/api/auth/signup` | Create user account |
| GET | `/api/products` | Get active products |

### Admin Only (Requires JWT + role='admin')
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/products` | List all products |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Soft delete product |
| PATCH | `/api/admin/products/:id/stock` | Update stock |

---

## 🎉 Ready to Use!

All 4 requirements are implemented:
1. ✅ Admin login protection
2. ✅ Product management (backend)
3. ✅ User sync (live updates)
4. ✅ Security (JWT + roles)

**Start the application and test!**

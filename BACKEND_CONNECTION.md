# Backend Connection & Data Persistence

## ✅ Backend Routes Connected

All backend routes are now properly connected:

### Cart API (`/api/cart`)
- `GET /api/cart` - Get user's cart (retains items for returning users)
- `GET /api/cart/count` - Get cart item count
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart

### Wishlist API (`/api/wishlist`)
- `GET /api/wishlist` - Get user's wishlist (retains items for returning users)
- `GET /api/wishlist/count` - Get wishlist item count
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist/:itemId` - Remove item from wishlist

### Orders API (`/api/orders`)
- `GET /api/orders` - Get user's order history (all orders retained)
- `GET /api/orders/count` - Get order count
- `POST /api/orders` - Create new order from cart

## 🔄 Data Persistence

### How It Works

1. **MongoDB Storage**: All cart, wishlist, and order data is stored in MongoDB
2. **User Association**: Each cart/wishlist/order is linked to the user's ID
3. **Automatic Retrieval**: When a user logs in, their data is automatically fetched
4. **Data Retention**: Old users see their previous cart, wishlist, and orders

### Data Flow

1. **User Logs In**:
   - Token stored in localStorage
   - User data stored in AuthContext
   - All pages automatically fetch user's data

2. **Cart/Wishlist/Orders Pages**:
   - Check if user is authenticated
   - Fetch data from backend using user's token
   - Display existing data (empty if new user, populated if returning user)

3. **User Dropdown**:
   - Automatically fetches counts when user logs in
   - Refreshes every 30 seconds to stay updated
   - Shows badges with item counts

## 🔐 Authentication

All routes are protected with JWT authentication:
- Token sent in `Authorization: Bearer <token>` header
- User ID extracted from token
- Data filtered by user ID

## 📊 MongoDB Collections

### `carts` Collection
- One cart per user (unique user field)
- Items array stores all cart items
- Persists across logins

### `wishlists` Collection
- One wishlist per user (unique user field)
- Items array stores all wishlist items
- Persists across logins

### `orders` Collection
- Multiple orders per user
- Each order has unique order number
- Complete order history retained

## 🚀 Testing Data Persistence

1. **Create Account & Add Items**:
   - Sign up for a new account
   - Add items to cart
   - Add items to wishlist
   - Create an order

2. **Logout & Login Again**:
   - Logout from the account
   - Login with the same credentials
   - **Result**: All cart items, wishlist items, and orders should still be there!

3. **Verify in MongoDB**:
   - Open MongoDB Compass
   - Connect to `mongodb://localhost:27017`
   - Check `store` database
   - View `carts`, `wishlists`, and `orders` collections
   - See data linked to user ID

## 🔄 Auto-Refresh Features

1. **User Dropdown**: Refreshes counts every 30 seconds
2. **Cart Page**: Refreshes when user logs in
3. **Wishlist Page**: Refreshes when user logs in
4. **Orders Page**: Refreshes when user logs in
5. **After Actions**: Pages refresh after add/remove operations

## 📝 Notes

- Data is permanently stored in MongoDB
- Users can logout and login multiple times - data persists
- Each user has their own separate cart, wishlist, and orders
- Data is never lost unless explicitly deleted
- Indexes added for faster queries


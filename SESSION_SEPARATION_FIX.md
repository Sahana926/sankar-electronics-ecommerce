# Session Separation Fix - Admin vs User Login

## Problem Identified ❌
- Admin and User authentication were sharing the SAME localStorage keys (`token` and `user`)
- When admin logged in, the token was stored as `token`
- When a user logged in, it OVERWROTE the same `token` key
- This caused both sides to be logged in with the same credentials
- When updating orders or admin tasks, if a non-admin user token was cached, it showed "admin access required"

## Solution Implemented ✅

### 1. **Separate Storage Keys**
   - **Admin Login** → stores in `admin_token` and `admin_user`
   - **User Login** → stores in `user_token` and `user_user`
   - They no longer interfere with each other

### 2. **Updated AuthContext.jsx**
   - Added `userType` parameter (admin or user)
   - Created `getStorageKeys()` function to return separate keys
   - Each provider instance uses separate localStorage keys
   - Admin and user sessions are completely isolated

### 3. **Updated App.jsx**
   - Detects if route is admin (`/admin/*`) or user
   - Passes `userType` to AuthProvider
   - Ensures each route type has its own authentication context

### 4. **Created Token Manager Utility** (`utils/tokenManager.js`)
   - `getToken()` - Gets current token (admin or user)
   - `getCurrentUser()` - Gets current user data
   - `isAdminLoggedIn()` - Checks if admin is logged in
   - `isUserLoggedIn()` - Checks if user is logged in
   - `clearAllAuth()` - Clears all authentication data

## How It Works Now

### Admin Login Flow:
1. Admin visits `/admin/login`
2. App detects admin route, creates `AuthProvider` with `userType="admin"`
3. Admin logs in → token saved to `admin_token` key
4. User localStorage: `{ admin_token, admin_user, ... }`
5. Admin can only access `/admin/*` routes

### User Login Flow:
1. User visits `/login`
2. App detects user route, creates `AuthProvider` with `userType="user"`
3. User logs in → token saved to `user_token` key
4. User localStorage: `{ user_token, user_user, ... }`
5. User can only access protected routes like `/shop`, `/orders`, etc.

### Result:
- **No more automatic cross-login**
- **Admin and User sessions are completely isolated**
- **Each side maintains its own token**
- **"Admin access required" only appears if non-admin tries admin operation**

## Files Modified:
1. `src/context/AuthContext.jsx` - Separated storage keys
2. `src/App.jsx` - Conditional AuthProvider with userType
3. `src/utils/tokenManager.js` - NEW utility for token management

## Testing:
1. ✅ Log out of both sides (clear all localStorage)
2. ✅ Log in as admin → admin_token is set, user_token is empty
3. ✅ Log in with user credentials on user side → user_token is set, admin_token remains
4. ✅ Try to access admin features with user session → "admin access required"
5. ✅ Log out user, log out admin → both tokens cleared
6. ✅ Log in admin again → works perfectly

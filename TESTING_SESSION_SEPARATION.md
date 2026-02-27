# Testing Session Separation - Step by Step Guide

## Clear Everything First
1. Open DevTools (F12)
2. Go to Console
3. Run: `localStorage.clear()`
4. Close all browser tabs with localhost
5. Refresh the page

## Test 1: Admin Login Only
1. Go to `http://localhost:5173/admin/login`
2. Log in with: `admin@sankar.com` / `Admin@123`
3. Open DevTools → Application → Local Storage
4. Check that you see:
   - ✅ `admin_token` (not empty)
   - ✅ `admin_user` (contains admin data)
   - ❌ `user_token` (should NOT exist)
   - ❌ `user_user` (should NOT exist)
5. Test admin operations (update order, view messages) → should work ✅

## Test 2: User Login Only
1. Open a NEW INCOGNITO window (to avoid mixing sessions)
2. Go to `http://localhost:5173/login`
3. Log in with a user account (or create one)
4. Open DevTools → Application → Local Storage
5. Check that you see:
   - ❌ `admin_token` (should NOT exist)
   - ❌ `admin_user` (should NOT exist)
   - ✅ `user_token` (not empty)
   - ✅ `user_user` (contains user data)
6. Try to access `/admin/orders` → should redirect to unauthorized ✅

## Test 3: Try Admin Route with User Session
1. Logged in as user (from Test 2)
2. Try to manually go to `http://localhost:5173/admin`
3. Should be redirected to `/unauthorized` ✅
4. Should NOT show admin dashboard

## Test 4: Verify No Cross-Login
1. In normal window: Log in as admin
2. In same window: Log out
3. Go to `/login` (user side)
4. Log in as user
5. Check localStorage:
   - ✅ Only `user_token` and `user_user` should exist
   - ❌ No `admin_token` or `admin_user`
6. Go back to `/admin/login`
7. Should NOT be logged in as admin
8. Should see empty admin login form

## Expected Behavior After Fix

| Scenario | Before Fix | After Fix |
|----------|-----------|----------|
| Admin logs in, user is auto-logged in | ❌ YES (both share token) | ✅ NO (separate tokens) |
| User logs in, admin is auto-logged in | ❌ YES (both share token) | ✅ NO (separate tokens) |
| Admin tries to update orders | ❌ Sometimes "admin access required" | ✅ Always works |
| User tries to access `/admin` | ❌ May work with admin token | ✅ Always redirected |
| Logout on user side affects admin | ❌ YES (shared keys) | ✅ NO (separate keys) |
| Logout on admin side affects user | ❌ YES (shared keys) | ✅ NO (separate keys) |

## Troubleshooting

**If you still see "admin access required" when updating orders:**
1. Clear localStorage: `localStorage.clear()`
2. Log out
3. Close browser completely
4. Open fresh browser window
5. Go to `/admin/login`
6. Log in with admin credentials
7. Try again

**If admin login form still has old data:**
1. Check AdminLogin.jsx has ADMIN_CREDENTIALS prefilled
2. Clear localStorage
3. Refresh page

**If tokens are still mixed:**
1. Check your browser's local storage (F12 → Storage → Local Storage)
2. Look for: admin_token, admin_user, user_token, user_user
3. These should be separate from old `token` and `user` keys

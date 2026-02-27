# Application Features - State Persistence & Authentication

## ✅ State Persistence on Page Refresh

The application uses **localStorage** to persist user authentication state across page refreshes.

### How it works:
1. **AuthContext** stores user data in localStorage on login:
   - `token` - JWT authentication token
   - `user` - User profile information (id, fullName, email, phone)

2. **On page refresh**, the AuthContext automatically restores:
   - Checks localStorage for existing token and user data
   - Re-initializes the authentication state
   - User remains logged in without needing to login again

### Code Implementation:
```javascript
// AuthContext checks for stored data on mount
useEffect(() => {
  const token = localStorage.getItem('token')
  const userData = localStorage.getItem('user')
  
  if (token && userData) {
    // Restore user data on page refresh
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setIsAuthenticated(true)
  }
}, [])
```

## ✅ Redirect to Shop After Successful Login

After login, users are automatically redirected to the Shop page.

### Login Flow:
1. User fills in email and password
2. Frontend sends credentials to backend `/api/auth/login`
3. Backend validates and returns JWT token
4. Frontend calls `login()` function to store token and user data
5. **User is redirected to `/shop`** (protected route)

### Code Implementation:
```javascript
if (response.ok) {
  // Login successful - store token and user data
  login(data.token, data.user)
  
  // Redirect to shop page
  const from = location.state?.from?.pathname || '/shop'
  navigate(from, { replace: true })
}
```

## ✅ Protected Routes

The `/shop` route is protected and requires authentication:
- Non-authenticated users trying to access `/shop` are redirected to `/login`
- After login, users are redirected back to the `/shop` page
- Other protected routes: `/cart`, `/wishlist`, `/orders`, `/profile`

### Protected Routes:
| Route | Requires Login | Description |
|-------|---|---|
| `/` | No | Home page |
| `/login` | No | Login page |
| `/signup` | No | Sign up page |
| `/products` | No | Products catalog |
| `/contact` | No | Contact form |
| `/shop` | ✅ Yes | Shopping page |
| `/cart` | ✅ Yes | Shopping cart |
| `/wishlist` | ✅ Yes | Wishlist |
| `/orders` | ✅ Yes | Order history |
| `/profile` | ✅ Yes | User profile |

## Testing the Features

### Test 1: State Persistence
1. Login with a user account
2. Refresh the page (F5 or Ctrl+R)
3. User should remain logged in
4. Can access protected routes like `/shop`

### Test 2: Redirect After Login
1. Go to login page
2. Enter valid credentials
3. Should be redirected to `/shop` immediately after successful login

### Test 3: Protected Routes
1. Logout (if logged in)
2. Try to access `/shop` directly
3. Should be redirected to `/login` page

## Data Stored in localStorage

```javascript
localStorage {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: "507f1f77bcf86cd799439011",
    fullName: "John Doe",
    email: "john@example.com",
    phone: "9876543210"
  }
}
```

## Summary

✅ **State Persistence**: User authentication state persists across page refreshes using localStorage  
✅ **Auto-Redirect**: Users are automatically redirected to `/shop` after successful login  
✅ **Protected Routes**: Routes requiring authentication are properly protected  
✅ **Smart Redirection**: If user tries to access a protected route, they're redirected to login, then back to original destination after login

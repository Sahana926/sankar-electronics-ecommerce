import { createContext, useContext, useState, useEffect } from 'react'

// Create Auth Context
const AuthContext = createContext()

// Separate storage keys for admin and user
const getStorageKeys = (userType = 'user') => {
  if (userType === 'admin') {
    return {
      tokenKey: 'admin_token',
      userKey: 'admin_user',
    }
  }
  return {
    tokenKey: 'user_token',
    userKey: 'user_user',
  }
}

// Helper function to get initial auth state from localStorage
const getInitialAuthState = (userType = 'user') => {
  try {
    const { tokenKey, userKey } = getStorageKeys(userType)
    const token = localStorage.getItem(tokenKey)
    const userData = localStorage.getItem(userKey)
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData)
      return {
        isAuthenticated: true,
        user: parsedUser,
        loading: false,
      }
    }
  } catch (error) {
    console.error('Error restoring auth state:', error)
    const { tokenKey, userKey } = getStorageKeys(userType)
    localStorage.removeItem(tokenKey)
    localStorage.removeItem(userKey)
  }
  
  return {
    isAuthenticated: false,
    user: null,
    loading: false, // Set to false since we've already checked localStorage
  }
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth Provider Component
export const AuthProvider = ({ children, userType = 'user' }) => {
  // Initialize state from localStorage immediately (synchronously)
  const initialState = getInitialAuthState(userType)
  const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated)
  const [user, setUser] = useState(initialState.user)
  const [loading, setLoading] = useState(initialState.loading)
  const { tokenKey, userKey } = getStorageKeys(userType)

  // Re-sync state when userType changes or on mount
  useEffect(() => {
    const { tokenKey, userKey } = getStorageKeys(userType)
    const token = localStorage.getItem(tokenKey)
    const userData = localStorage.getItem(userKey)
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setIsAuthenticated(true)
        setUser(parsedUser)
        setLoading(false)
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem(tokenKey)
        localStorage.removeItem(userKey)
        setIsAuthenticated(false)
        setUser(null)
        setLoading(false)
      }
    } else {
      setIsAuthenticated(false)
      setUser(null)
      setLoading(false)
    }
  }, [userType])

  // Login function - stores token and user data in separate keys
  const login = (token, userData) => {
    localStorage.setItem(tokenKey, token)
    localStorage.setItem(userKey, JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
  }

  // Update user function - updates user data without logging out
  const updateUser = (userData) => {
    localStorage.setItem(userKey, JSON.stringify(userData))
    setUser(userData)
  }

  // Logout function - removes token and user data using specific keys
  const logout = () => {
    localStorage.removeItem(tokenKey)
    localStorage.removeItem(userKey)
    setIsAuthenticated(false)
    setUser(null)
  }

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    updateUser,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


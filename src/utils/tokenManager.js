/**
 * Token Manager Utility
 * Manages separate token storage for admin and user authentication
 */

export const getStorageKeys = (userType = 'user') => {
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

/**
 * Get the current token from localStorage based on context
 * For admin routes/context, prioritize admin_token
 * For user routes/context, only use user_token
 * @param {string} context - 'admin' or 'user' to specify which token to get
 * @returns {string|null} The token if found, null otherwise
 */
export const getToken = (context = null) => {
  // If context is explicitly admin, only return admin token
  if (context === 'admin') {
    return localStorage.getItem('admin_token')
  }
  
  // If context is explicitly user, only return user token
  if (context === 'user') {
    return localStorage.getItem('user_token')
  }
  
  // If no context specified, try admin first (for backward compatibility)
  const adminToken = localStorage.getItem('admin_token')
  if (adminToken) {
    return adminToken
  }
  
  // Then try user token
  const userToken = localStorage.getItem('user_token')
  if (userToken) {
    return userToken
  }
  
  return null
}

/**
 * Get the current user from localStorage based on context
 * @param {string} context - 'admin' or 'user' to specify which user to get
 * @returns {object|null} The user object if found, null otherwise
 */
export const getCurrentUser = (context = null) => {
  // If context is explicitly admin, only return admin user
  if (context === 'admin') {
    const adminUser = localStorage.getItem('admin_user')
    if (adminUser) {
      try {
        return JSON.parse(adminUser)
      } catch (e) {
        console.error('Error parsing admin user:', e)
      }
    }
    return null
  }
  
  // If context is explicitly user, only return user
  if (context === 'user') {
    const user = localStorage.getItem('user_user')
    if (user) {
      try {
        return JSON.parse(user)
      } catch (e) {
        console.error('Error parsing user:', e)
      }
    }
    return null
  }
  
  // If no context specified, try admin first (for backward compatibility)
  const adminUser = localStorage.getItem('admin_user')
  if (adminUser) {
    try {
      return JSON.parse(adminUser)
    } catch (e) {
      console.error('Error parsing admin user:', e)
    }
  }
  
  // Then try regular user
  const user = localStorage.getItem('user_user')
  if (user) {
    try {
      return JSON.parse(user)
    } catch (e) {
      console.error('Error parsing user:', e)
    }
  }
  
  return null
}

/**
 * Determine if current session is admin
 * @returns {boolean} True if admin is logged in
 */
export const isAdminLoggedIn = () => {
  return localStorage.getItem('admin_token') !== null
}

/**
 * Determine if current session is regular user
 * @returns {boolean} True if user is logged in
 */
export const isUserLoggedIn = () => {
  return localStorage.getItem('user_token') !== null
}

/**
 * Clear all authentication data (both admin and user)
 */
export const clearAllAuth = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  localStorage.removeItem('user_token')
  localStorage.removeItem('user_user')
}

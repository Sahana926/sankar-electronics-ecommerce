import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getToken, getCurrentUser } from '../utils/tokenManager'

/**
 * ProtectedRoute Component - User Route Protection
 * 
 * Requirements:
 * - Must have valid user JWT token
 * - Cannot be an admin user (admins must use /admin/login)
 * - Redirects non-authenticated to /login
 * - Redirects admin users to /admin (complete separation)
 * 
 * This ensures complete separation between admin and user routes
 */
function ProtectedRoute({ children }) {
  const { loading } = useAuth()
  const location = useLocation()

  // While loading, show loading state to prevent flashing redirects
  if (loading) {
    return <div className="page-loading">Loading...</div>
  }

  // Check for user token
  const userToken = getToken('user')
  const currentUser = getCurrentUser('user')
  
  const isUserAuthenticated = !!userToken
  const isAdminUser = currentUser && currentUser.role === 'admin'

  // If admin is somehow on user route, redirect them to admin dashboard
  if (isAdminUser) {
    console.warn('⚠️ Admin access denied: Admins must use /admin routes')
    return <Navigate to="/admin" replace />
  }

  // If not authenticated, redirect to login with return path
  if (!isUserAuthenticated) {
    console.warn('⚠️ User access denied: Not authenticated')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If authenticated as regular user, render the protected component
  console.log('✅ User access granted')
  return children
}

export default ProtectedRoute



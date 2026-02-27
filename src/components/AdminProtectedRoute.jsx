import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getToken, getCurrentUser } from '../utils/tokenManager'

/**
 * AdminProtectedRoute - Protects admin-only routes
 * 
 * Requirements:
 * - Must have valid admin JWT token
 * - User data must exist and have role === 'admin'
 * - Redirects non-admins to /unauthorized
 * - Redirects non-authenticated to /admin/login
 * 
 * This completely separates admin from user access
 */
function AdminProtectedRoute({ children }) {
  const { loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="page-loading">Loading...</div>

  // Get admin-specific token and user data
  const adminToken = getToken('admin')
  const adminUser = getCurrentUser('admin')
  
  const isAdminAuthenticated = !!adminToken
  const isAdminRole = adminUser && adminUser.role === 'admin'

  // Not authenticated - redirect to admin login
  if (!isAdminAuthenticated) {
    console.warn('⚠️ Admin access denied: No admin token found')
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // Authenticated but not admin role - redirect to unauthorized
  if (!isAdminRole) {
    console.warn('⚠️ Admin access denied: User is not an admin')
    return <Navigate to="/unauthorized" replace />
  }

  // Authenticated and is admin - allow access
  console.log('✅ Admin access granted')
  return children
}

export default AdminProtectedRoute

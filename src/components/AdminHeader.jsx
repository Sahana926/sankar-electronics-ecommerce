import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../utils/tokenManager'
import './AdminHeader.css'

function AdminHeader() {
  const user = getCurrentUser('admin')
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    // Clear admin session only
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    navigate('/admin/login')
  }

  const handleBack = () => {
    navigate(-1)
  }

  const isActive = (path) => {
    if (path === '/admin') {
      // Dashboard is active only when exactly /admin
      return location.pathname === '/admin'
    }
    // Other pages are active when pathname starts with the path
    return location.pathname.startsWith(path)
  }

  return (
    <div className="admin-header">
      <div className="admin-header-content">
        <div className="admin-header-top">
          <div className="admin-header-brand">
            <h2 className="admin-header-title">Sankar Electrical and Hardwares</h2>
            <p className="admin-header-welcome">Admin Panel · Welcome, {user?.fullName || 'Admin'}</p>
          </div>
          <div className="admin-header-actions">
            <button className="admin-back-btn" onClick={handleBack} title="Go Back">
              ← Back
            </button>
            <button className="admin-logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
        <nav className="admin-nav">
          <Link 
            to="/admin" 
            className={`admin-nav-link ${isActive('/admin') ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </Link>
          <Link 
            to="/admin/inventory" 
            className={`admin-nav-link ${isActive('/admin/inventory') || isActive('/admin/products') ? 'active' : ''}`}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-text">Inventory</span>
          </Link>
          <Link 
            to="/admin/orders" 
            className={`admin-nav-link ${isActive('/admin/orders') ? 'active' : ''}`}
          >
            <span className="nav-icon">🛒</span>
            <span className="nav-text">Orders</span>
          </Link>
          <Link 
            to="/admin/messages" 
            className={`admin-nav-link ${isActive('/admin/messages') ? 'active' : ''}`}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-text">Messages</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}

export default AdminHeader


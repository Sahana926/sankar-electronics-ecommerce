import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCounts } from '../context/CountsContext'
import { getCurrentUser } from '../utils/tokenManager'

/**
 * UserDropdown Component
 * 
 * Dropdown menu that appears when clicking on user name.
 * Shows Cart, Wishlist, and Orders with item counts.
 * Counts are automatically refreshed on page load and persist across refreshes.
 */
function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const user = getCurrentUser('user')
  const { ordersCount } = useCounts()

  const handleLogout = () => {
    // Clear user session only
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_user')
    navigate('/login')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMenuItemClick = (path) => {
    navigate(path)
    setIsOpen(false)
  }

  if (!user) return null

  return (
    <div className="user-dropdown-container" ref={dropdownRef}>
      <button
        className="user-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="user-name">{user.fullName || user.email}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="user-dropdown-menu">
          {user?.role === 'admin' && (
            <>
              <div className="dropdown-item" onClick={() => handleMenuItemClick('/admin')}>
                <span className="dropdown-icon">⚙️</span>
                <span className="dropdown-text">Admin</span>
              </div>
              <div className="dropdown-divider"></div>
            </>
          )}
          <div className="dropdown-item" onClick={() => handleMenuItemClick('/profile')}>
            <span className="dropdown-icon">👤</span>
            <span className="dropdown-text">Profile</span>
          </div>
          <div className="dropdown-item" onClick={() => handleMenuItemClick('/orders')}>
            <span className="dropdown-icon">📦</span>
            <span className="dropdown-text">Orders</span>
            {ordersCount > 0 && <span className="dropdown-badge">{ordersCount}</span>}
          </div>
          <div className="dropdown-divider"></div>
          <div className="dropdown-item" onClick={handleLogout}>
            <span className="dropdown-icon">🔌</span>
            <span className="dropdown-text">Logout</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDropdown


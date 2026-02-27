import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCounts } from '../context/CountsContext'
import { getToken, getCurrentUser } from '../utils/tokenManager'
import UserDropdown from './UserDropdown'

/**
 * Header Component
 * 
 * Navigation header with conditional rendering based on authentication status.
 * Shows Login/Signup when logged out, UserDropdown when logged in.
 * Displays wishlist count badge when user is authenticated.
 */
function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { wishlistCount, cartCount } = useCounts()
  const [searchQuery, setSearchQuery] = useState('')
  
  // Only check for user-specific authentication
  const userToken = getToken('user')
  const user = getCurrentUser('user')
  const isAuthenticated = userToken && user
  
  // Check if current path is active
  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>Sankar Electrical and Hardwares</h1>
          </div>
          
          {/* Search Bar */}
          {isAuthenticated && (
            <div className="header-search">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="header-search-input"
                />
                <button type="submit" className="header-search-btn">
                  🔍
                </button>
              </form>
            </div>
          )}
          
          <nav className="nav-menu">
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/shop" className={`nav-link ${isActive('/shop')}`}>
                  Shop
                </Link>
                <Link to="/wishlist" className={`nav-link ${isActive('/wishlist')} wishlist-link`}>
                  <span className="wishlist-icon">❤️</span>
                  {wishlistCount > 0 && (
                    <span className="header-badge wishlist-badge">{wishlistCount}</span>
                  )}
                </Link>
                <Link to="/cart" className={`nav-link ${isActive('/cart')} cart-link`}>
                  <span className="cart-icon">🛒</span>
                  {cartCount > 0 && (
                    <span className="header-badge cart-badge">{cartCount}</span>
                  )}
                </Link>
                <Link to="/contact" className={`nav-link ${isActive('/contact')}`}>
                  Contact
                </Link>
                <UserDropdown />
              </>
            ) : (
              <>
                <Link to="/contact" className={`nav-link ${isActive('/contact')}`}>
                  Contact
                </Link>
                <Link to="/login" className={`nav-link ${isActive('/login')}`}>
                  Login
                </Link>
                <Link to="/signup" className={`nav-link ${isActive('/signup')}`}>
                  Signup
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header


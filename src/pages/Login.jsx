import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { validateEmail, normalizeEmail } from '../utils/emailValidator'

/**
 * Login Component
 * 
 * Handles user login with comprehensive email and password validation.
 * - Comprehensive email format validation
 * - Email normalization (lowercase, trimmed)
 * - Password validation
 * - Redirects to shop page after successful login, or to the page user was trying to access.
 */
function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      })
    }
  }

  // Real-time email validation feedback
  const handleEmailChange = (e) => {
    const { value } = e.target
    setFormData({
      ...formData,
      email: value,
    })

    // Clear email errors when user starts typing
    if (errors.email) {
      setErrors({
        ...errors,
        email: '',
      })
    }

    // Show validation feedback if email has value
    if (value && value.length > 3) {
      const result = validateEmail(value)
      if (!result.isValid && result.errors.length > 0) {
        setErrors({
          ...errors,
          email: result.errors[0],
        })
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    // Email validation - comprehensive
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else {
      const emailValidationResult = validateEmail(formData.email)
      if (!emailValidationResult.isValid) {
        // Use first error from validator
        newErrors.email = emailValidationResult.errors[0] || 'Please enter a valid email address'
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    
    // Real API call to backend
    try {
      // Normalize email (lowercase, trimmed)
      const normalizedEmail = normalizeEmail(formData.email)

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail, // Send normalized email
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Check if user is admin - admin cannot login on user side
        if (data.user?.role === 'admin') {
          setErrors({ submit: 'Admin accounts cannot login here. Please use the Admin Login page.' })
          setLoading(false)
          return
        }

        // Check if user is regular user
        if (data.user?.role !== 'user') {
          setErrors({ submit: 'Invalid user role. Please contact support.' })
          setLoading(false)
          return
        }

        // Login successful - store token and user data
        login(data.token, data.user)
        
        // Redirect to intended page or shop
        // All components will automatically refresh data via useEffect hooks
        const from = location.state?.from?.pathname || '/shop'
        navigate(from, { replace: true })
      } else {
        // Handle backend errors with specific messages
        if (data.message) {
          const message = data.message.toLowerCase().trim()
          
          // Check password FIRST (more specific)
          if (message.includes('password')) {
            newErrors.password = 'Invalid password'
          } else if (message.includes('email')) {
            newErrors.email = 'Invalid email ID'
          } else {
            newErrors.submit = data.message
          }
        } else {
          newErrors.submit = 'Login failed. Please check your credentials.'
        }
        setErrors(newErrors)
        setLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ submit: 'Failed to connect to server. Please try again.' })
      setLoading(false)
    }
  }

  return (
    <main className="main-content">
      <div className="container">
        <div className="page-container">
          <h2 className="page-title">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleEmailChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email (e.g., john.doe@example.com)"
              />
              {errors.email && (
                <span className="error-message">
                  ❌ {errors.email}
                </span>
              )}
              {formData.email && !errors.email && (
                <span style={{ fontSize: '0.85rem', color: '#27ae60', marginTop: '0.25rem', display: 'block' }}>
                  ✓ Email format looks good
                </span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter your password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
              Don't have an account?{' '}
              <Link
                to="/signup"
                style={{
                  color: '#2c3e50',
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                Sign up here
              </Link>
            </p>
            <p style={{ textAlign: 'center', marginTop: '0.75rem', color: '#666', fontSize: '0.9rem' }}>
              Are you an admin?{' '}
              <Link
                to="/admin/login"
                style={{
                  color: '#2874f0',
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                Use Admin Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}

export default Login


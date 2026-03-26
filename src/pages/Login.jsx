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
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://sankar-electronics-backend.onrender.com'

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
    <main className="main-content auth-shell auth-shell-login">
      <div className="container">
        <section className="auth-layout-card" aria-label="User login">
          <aside className="auth-side-panel">
            <p className="auth-kicker">Welcome back</p>
            <h2>Power your next project</h2>
            <p>Sign in to access cart, wishlist, order tracking, and personalized recommendations.</p>
            <ul className="auth-benefit-list">
              <li>Real-time stock updates</li>
              <li>Fast repeat orders</li>
              <li>Secure payment experience</li>
            </ul>
          </aside>

          <div className="page-container auth-form-panel">
            <h2 className="page-title auth-page-title">Login</h2>
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
                    X {errors.email}
                  </span>
                )}
                {formData.email && !errors.email && (
                  <span className="field-success">
                    Email format looks good
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
              {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
              <button type="submit" className="btn auth-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <p className="auth-link-line">
                Don't have an account?{' '}
                <Link to="/signup" className="auth-link-primary">
                  Sign up here
                </Link>
              </p>
              <p className="auth-link-line auth-link-line-secondary">
                Are you an admin?{' '}
                <Link to="/admin/login" className="auth-link-accent">
                  Use Admin Login
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Login


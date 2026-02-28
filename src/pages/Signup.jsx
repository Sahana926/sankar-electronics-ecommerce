import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { validateEmail, getEmailErrorMessage, normalizeEmail } from '../utils/emailValidator'

/**
 * Signup Component
 * 
 * Handles user registration with comprehensive validation:
 * - Email validation (format, length, characters, disposable domains)
 * - Phone validation (10-digit number)
 * - Password validation (letter, number, special char, min 8 chars)
 * - Password confirmation match
 * - Backend duplicate email check
 */
function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [emailCheckLoading, setEmailCheckLoading] = useState(false)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://sankar-electronics-backend.onrender.com'

  // Password validation function
  // Must contain: at least one letter, one number, and one special character
  const validatePassword = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    return hasLetter && hasNumber && hasSpecialChar && password.length >= 8
  }

  // Phone number validation function
  // Must be exactly 10 digits (spaces and dashes are removed)
  const validatePhone = (phone) => {
    // Remove spaces and dashes, then check if it's 10 digits
    const cleanedPhone = phone.replace(/[\s-]/g, '')
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(cleanedPhone)
  }

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

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

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

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters and contain at least one letter, one number, and one special character'
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Stop if validation errors exist
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    
    // Real API call to backend
    try {
      // Normalize email (lowercase, trimmed)
      const normalizedEmail = normalizeEmail(formData.email)

      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: normalizedEmail, // Send normalized email
          phone: formData.phone.replace(/[\s-]/g, ''), // Clean phone number
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Signup successful - redirect to login page
        alert('Account created successfully! Please login.')
        navigate('/login')
      } else {
        // Handle backend errors
        if (data.message && data.message.includes('email')) {
          newErrors.email = data.message
        } else {
          newErrors.submit = data.message || 'Signup failed. Please try again.'
        }
        setErrors(newErrors)
        setLoading(false)
      }
    } catch (error) {
      console.error('Signup error:', error)
      setErrors({ submit: 'Failed to connect to server. Please try again.' })
      setLoading(false)
    }
  }

  return (
    <main className="main-content">
      <div className="container">
        <div className="page-container">
          <h2 className="page-title">Create Account</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={errors.fullName ? 'error' : ''}
                placeholder="Enter your full name"
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>
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
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder="Enter your 10-digit phone number"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
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
                placeholder="Create a password (min 8 chars, letter, number, special char)"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
            {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#2c3e50',
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}

export default Signup


import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { normalizeEmail, validateEmail } from '../utils/emailValidator'
import { toast } from 'react-toastify'
import { ADMIN_CREDENTIALS } from '../config/adminConfig'

function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({ 
    email: ADMIN_CREDENTIALS.email, 
    password: ADMIN_CREDENTIALS.password 
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = {}

    // Email validation
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email).isValid) {
      nextErrors.email = 'Invalid email ID'
    }

    // Password validation
    if (!formData.password) {
      nextErrors.password = 'Password is required'
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setLoading(true)
    try {
      const normalizedEmail = normalizeEmail(formData.email)
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: formData.password }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        // Specific error messages based on response
        if (data.message) {
          const message = data.message.toLowerCase().trim()
          
          // Check password FIRST (more specific)
          if (message.includes('password')) {
            nextErrors.password = 'Invalid password'
          } else if (message.includes('email')) {
            nextErrors.email = 'Invalid email ID'
          } else {
            nextErrors.submit = data.message
          }
        } else {
          nextErrors.submit = 'Login failed'
        }
        setErrors(nextErrors)
        setLoading(false)
        return
      }

      if (data.user?.role !== 'admin') {
        setErrors({ submit: 'Admin access required' })
        setLoading(false)
        return
      }
      
      // Store admin credentials directly - only after successful login
      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_user', JSON.stringify(data.user))
      
      toast.success('Admin login successful')
      const from = location.state?.from?.pathname || '/admin'
      navigate(from, { replace: true })
    } catch (err) {
      console.error('Admin login error', err)
      setErrors({ submit: 'Server error, try again' })
      setLoading(false)
    }
  }

  return (
    <main className="main-content">
      <div className="container">
        {/* Admin Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>🛡️ Admin Panel</h1>
          <p style={{ margin: '0', fontSize: '1rem', opacity: 0.9 }}>Authorized Access Only</p>
        </div>

        <div className="page-container" style={{ maxWidth: '420px' }}>
          <h2 className="page-title">Admin Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange}
                placeholder="Enter admin email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange}
                placeholder="Enter admin password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
            <p style={{ marginTop: '0.75rem', color: '#666' }}>
              Not an admin? <Link to="/login">User login</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}

export default AdminLogin

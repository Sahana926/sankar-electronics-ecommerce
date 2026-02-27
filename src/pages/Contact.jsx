import { useState } from 'react'

function Contact() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone.replace(/[\s-]/g, ''))
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      console.log('📧 Sending contact form to:', `${API_BASE}/api/contact`)
      console.log('📧 Form data:', formData)
      
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('📧 Response status:', response.status)
      console.log('📧 Response ok:', response.ok)
      
      const data = await response.json()
      console.log('📧 Response JSON:', JSON.stringify(data, null, 2))

      if (response.ok) {
        console.log('✅ Contact saved successfully!')
        setSuccess(true)
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
        })
        setTimeout(() => setSuccess(false), 5000)
      } else {
        console.error('❌ Contact submission failed - Status:', response.status)
        console.error('❌ Error details:', data)
        setErrors({ submit: data.message || 'Failed to send message. Please try again.' })
      }
    } catch (error) {
      console.error('❌ Contact network error:', error)
      console.error('❌ Error stack:', error.stack)
      setErrors({ submit: 'Network error. Please try again later. Check console for details.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="main-content">
      <div className="container">
        <div className="page-container">
          <h2 className="page-title">Contact Us</h2>
          <p
            style={{
              textAlign: 'center',
              color: '#666',
              marginBottom: '2rem',
            }}
          >
            Get in touch with us for any inquiries or support
          </p>

          <form onSubmit={handleSubmit}>
            {success && (
              <div className="success-message">
                Thank you for your message! We will get back to you soon.
              </div>
            )}
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter your name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
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
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? 'error' : ''}
                placeholder="Enter your message (minimum 10 characters)"
              ></textarea>
              {errors.message && <span className="error-message">{errors.message}</span>}
            </div>
            {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          <div className="contact-info">
            <div className="contact-item">
              <h3>📍 Address</h3>
              <p>
                MS Nagar, Tiruppur<br />
                Tamil Nadu, PIN 641607
              </p>
            </div>
            <div className="contact-item">
              <h3>📞 Phone</h3>
              <p>
                +91 8778699805<br />
                +91 8778699805
              </p>
            </div>
            <div className="contact-item">
              <h3>✉️ Email</h3>
              <p>
                info@sankarelectrical.com<br />
                support@sankarelectrical.com
              </p>
            </div>
            <div className="contact-item">
              <h3>🕒 Business Hours</h3>
              <p>
                Monday - Saturday: 9:00 AM - 7:00 PM<br />
                Sunday: 10:00 AM - 4:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Contact


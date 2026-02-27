import { useState, useEffect } from 'react'
import AdminHeader from '../components/AdminHeader'
import { getToken } from '../utils/tokenManager'
import './ContactMessages.css'

function ContactMessages() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const token = getToken('admin')
        const response = await fetch(`${API_BASE}/api/contact`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('📧 Contact messages:', data)
        setMessages(data)
        setError(null)
      } catch (err) {
        console.error('❌ Error fetching messages:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [API_BASE])

  return (
    <>
      <AdminHeader />
      <main className="main-content">
        <div className="container">
          <div className="messages-header">
            <h1 className="messages-title">📧 Contact Messages</h1>
          </div>

          {loading && (
            <div className="loading-container">
              <p className="loading-text">Loading messages...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              ⚠️ Error: {error}
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="empty-container">
              <p className="empty-text">No contact messages yet</p>
            </div>
          )}

          {!loading && messages.length > 0 && (
            <div>
              <p className="messages-count">
                Total messages: <strong>{messages.length}</strong>
              </p>
              
              <div className="messages-grid">
                {messages.map((message, index) => (
                  <div key={message._id || index} className="message-card">
                    <div className="message-header">
                      <h3 className="message-name">{message.name}</h3>
                      <div className="message-meta">
                        <p className="meta-item">
                          <span className="meta-label">Email:</span>{' '}
                          <a href={`mailto:${message.email}`}>{message.email}</a>
                        </p>
                        <p className="meta-item">
                          <span className="meta-label">Phone:</span>{' '}
                          <a href={`tel:${message.phone}`}>{message.phone}</a>
                        </p>
                        <p className="meta-item message-date">
                          <span className="meta-label">Received:</span>{' '}
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="message-content">
                      {message.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default ContactMessages

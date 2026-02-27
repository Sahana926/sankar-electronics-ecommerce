import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getToken } from '../utils/tokenManager'

/**
 * Orders Component
 * 
 * Orders page displaying all past and current orders.
 * Connected to backend API for order management.
 */
function Orders() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState({}) // { [orderId]: boolean }
  const [showCancelled, setShowCancelled] = useState(() => {
    try {
      const saved = localStorage.getItem('orders_showCancelled')
      return saved ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(null)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Fetch orders when component mounts or user logs in
    fetchOrders()

    // Auto-refresh orders every 5 seconds to show updates from admin
    const refreshInterval = setInterval(() => {
      fetchOrders()
    }, 5000)

    setAutoRefreshInterval(refreshInterval)

    // Cleanup interval on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [isAuthenticated, navigate, showCancelled])

  // Refresh orders when user changes (login/logout)
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
    } else {
      setOrders([])
    }
  }, [isAuthenticated])

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return
    }
    
    try {
      const token = getToken('user')
      setIsCancelling(prev => ({ ...prev, [orderId]: true }))
      const response = await fetch(`${API_BASE}/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast.success('Order cancelled successfully')
        // Optimistic mark as cancelled (UI will hide unless toggled on)
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o))
        // Then refresh to ensure consistency
        fetchOrders()
      } else {
        let error
        try { error = await response.json() } catch { error = {} }
        toast.error(error.message || 'Failed to cancel order')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Failed to cancel order. Please try again.')
    } finally {
      setIsCancelling(prev => ({ ...prev, [orderId]: false }))
    }
  }

  const fetchOrders = async () => {
    try {
      const token = getToken('user')
      // Always include cancelled so we can show an accurate badge count
      const response = await fetch(`${API_BASE}/api/orders?includeCancelled=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Server already filters based on includeCancelled; keep as-is
        setOrders(data.orders || [])
      } else {
        setOrders([])
      }
    } catch (error) {
      console.log('Backend not available, using empty orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusStyles = (status) => {
    const map = {
      delivered: { color: '#1F7A47', bg: 'rgba(39, 174, 96, 0.12)', border: '#27ae60' },
      shipped: { color: '#1B6CA8', bg: 'rgba(52, 152, 219, 0.12)', border: '#3498db' },
      processing: { color: '#9A6906', bg: 'rgba(243, 156, 18, 0.14)', border: '#f39c12' },
      cancelled: { color: '#9E2B2B', bg: 'rgba(231, 76, 60, 0.14)', border: '#e74c3c' },
      default: { color: '#5C6B73', bg: 'rgba(149, 165, 166, 0.14)', border: '#95a5a6' }
    }
    return map[status] || map.default
  }

  const toTitle = (s) => s ? (s.charAt(0).toUpperCase() + s.slice(1)) : ''

  if (loading) {
    return (
      <main className="main-content">
        <div className="container">
          <div className="page-container">
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading orders...</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content">
      <div className="container">
        <div className="page-container">
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <h2 style={{ margin: 0 }}>My Orders</h2>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.9rem' }}>
              <input
                type="checkbox"
                checked={showCancelled}
                onChange={(e) => {
                  const val = e.target.checked
                  setShowCancelled(val)
                  try { localStorage.setItem('orders_showCancelled', JSON.stringify(val)) } catch {}
                }}
              />
              Show cancelled
              <span
                aria-label="cancelled count"
                title="Cancelled orders"
                style={{
                  marginLeft: '.5rem',
                  background: '#e74c3c',
                  color: 'white',
                  borderRadius: '999px',
                  padding: '0 .5rem',
                  fontSize: '.75rem',
                  lineHeight: '1.5',
                  display: 'inline-flex',
                  alignItems: 'center',
                  minWidth: '1.25rem',
                  justifyContent: 'center'
                }}
              >
                {orders.filter(o => o.status === 'cancelled').length}
              </span>
            </label>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No orders yet</h3>
              <p>Your order history will appear here</p>
              <button onClick={() => navigate('/shop')} className="shop-now-btn">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders
                .filter(order => showCancelled || order.status !== 'cancelled')
                .map((order) => {
                  const s = getStatusStyles(order.status)
                  return (
                  <div
                    key={order._id}
                    className="order-card"
                    style={{ borderLeft: `4px solid ${s.border}` }}
                  >
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Order #{order.orderNumber}</h3>
                      <p className="order-date">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className="order-status-chip"
                      style={{
                        color: s.color,
                        background: s.bg,
                        padding: '.25rem .6rem',
                        borderRadius: '999px',
                        fontWeight: 600,
                        letterSpacing: 0.3,
                        border: `1px solid ${s.border}22`,
                        textTransform: 'none'
                      }}
                    >
                      {toTitle(order.status)}
                    </span>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="order-item-icon">{item.icon || '📦'}</div>
                        <div className="order-item-details">
                          <h4>{item.name}</h4>
                          <p>Quantity: {item.quantity}</p>
                        </div>
                        <div className="order-item-price">₹{item.price * item.quantity}</div>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <span>Total:</span>
                      <span>₹{order.total}</span>
                    </div>
                    <div className="order-actions">
                      <button className="order-action-btn track-btn">Track Order</button>
                      {order.status === 'processing' && (
                        <button 
                          onClick={() => cancelOrder(order._id)}
                          className="order-action-btn cancel-btn"
                          disabled={!!isCancelling[order._id]}
                        >
                          {isCancelling[order._id] ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
              }
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Orders


import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getToken } from '../utils/tokenManager'
import { downloadInvoicePdf } from '../utils/invoicePdf'

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
  const [isRequestingReturn, setIsRequestingReturn] = useState({}) // { [orderId]: boolean }
  const [showCancelled, setShowCancelled] = useState(() => {
    try {
      const saved = localStorage.getItem('orders_showCancelled')
      return saved ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(null)
  const [latestOrderId, setLatestOrderId] = useState('')
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'
  const RETURN_WINDOW_HOURS = 48
  const RETURN_WINDOW_MS = RETURN_WINDOW_HOURS * 60 * 60 * 1000

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

  useEffect(() => {
    const storedLatest = localStorage.getItem('latestOrderId')
    setLatestOrderId(storedLatest || '')
  }, [])

  const latestOrder = latestOrderId
    ? orders.find((order) => order._id === latestOrderId)
    : null

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

  const requestReturn = async (order) => {
    const damageReason = window.prompt('Please describe the damage (minimum 10 characters):')
    if (damageReason === null) return

    const reason = damageReason.trim()
    if (reason.length < 10) {
      toast.error('Please provide a valid damage description (minimum 10 characters).')
      return
    }

    try {
      const token = getToken('user')
      setIsRequestingReturn((prev) => ({ ...prev, [order._id]: true }))

      const payload = JSON.stringify({ damageReason: reason })
      const endpoint = `${API_BASE}/api/orders/${order._id}/return-request`

      let response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: payload,
      })

      let data = {}
      try {
        data = await response.json()
      } catch {
        data = {}
      }

      // Fallback for older backends or proxies that do not allow PATCH
      if (!response.ok && response.status === 404) {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: payload,
        })
        try {
          data = await response.json()
        } catch {
          data = {}
        }
      }

      if (!response.ok) {
        toast.error(data.message || 'Failed to submit return request')
        return
      }

      toast.success('Return request submitted. Our team will review it soon.')
      setOrders((prev) => prev.map((o) => (o._id === order._id ? data.order : o)))
    } catch (error) {
      console.error('Error requesting return:', error)
      toast.error('Failed to submit return request. Please try again.')
    } finally {
      setIsRequestingReturn((prev) => ({ ...prev, [order._id]: false }))
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

  const handleTrackOrder = (order) => {
    navigate(`/track-order?orderId=${order._id}`)
  }

  const handleDownloadInvoice = (order) => {
    downloadInvoicePdf(order, { email: order.userEmail })
  }

  const getStatusStyles = (status) => {
    const map = {
      delivered: { color: '#1F7A47', bg: 'rgba(39, 174, 96, 0.12)', border: '#27ae60' },
      refund_completed: { color: '#155e75', bg: 'rgba(6, 182, 212, 0.14)', border: '#06b6d4' },
      shipped: { color: '#1B6CA8', bg: 'rgba(52, 152, 219, 0.12)', border: '#3498db' },
      processing: { color: '#9A6906', bg: 'rgba(243, 156, 18, 0.14)', border: '#f39c12' },
      cancelled: { color: '#9E2B2B', bg: 'rgba(231, 76, 60, 0.14)', border: '#e74c3c' },
      default: { color: '#5C6B73', bg: 'rgba(149, 165, 166, 0.14)', border: '#95a5a6' }
    }
    return map[status] || map.default
  }

  const toTitle = (s) => s ? (s.charAt(0).toUpperCase() + s.slice(1)) : ''
  const isReturnWindowOpen = (order) => {
    const deliveredAt = order?.deliveredAt || order?.updatedAt
    if (!deliveredAt) return false
    const deliveredTime = new Date(deliveredAt).getTime()
    if (!Number.isFinite(deliveredTime)) return false
    return (Date.now() - deliveredTime) <= RETURN_WINDOW_MS
  }

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
              {latestOrder && (
                <div
                  style={{
                    border: '1px solid #d1fae5',
                    background: '#ecfdf5',
                    color: '#065f46',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    gap: '.75rem',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <strong>Order Placed:</strong> {latestOrder.orderNumber}
                    <div style={{ fontSize: '.9rem' }}>
                      Your invoice is ready. You can download it now.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                    <button className="order-action-btn track-btn" onClick={() => handleDownloadInvoice(latestOrder)}>
                      Download Invoice
                    </button>
                    <button className="order-action-btn" onClick={() => handleTrackOrder(latestOrder)}>
                      Track This Order
                    </button>
                    <button
                      className="order-action-btn cancel-btn"
                      onClick={() => {
                        localStorage.removeItem('latestOrderId')
                        setLatestOrderId('')
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
              {orders
                .filter(order => showCancelled || order.status !== 'cancelled')
                .map((order) => {
                  const isRefundCompleted = order.paymentStatus === 'refunded' || order.refund?.status === 'processed'
                  const statusKey = isRefundCompleted ? 'refund_completed' : order.status
                  const statusLabel = isRefundCompleted ? 'Refund Completed' : toTitle(order.status)
                  const s = getStatusStyles(statusKey)
                  const returnStatus = order.returnRequest?.status || 'none'
                  const returnWindowOpen = isReturnWindowOpen(order)
                  const canRequestReturn = order.status === 'delivered' && returnWindowOpen && !['requested', 'approved', 'completed'].includes(returnStatus)
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
                      {statusLabel}
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
                      <button className="order-action-btn track-btn" onClick={() => handleTrackOrder(order)}>Track Order</button>
                      <button className="order-action-btn" onClick={() => handleDownloadInvoice(order)}>Download Invoice</button>
                      {order.status === 'processing' && (
                        <button 
                          onClick={() => cancelOrder(order._id)}
                          className="order-action-btn cancel-btn"
                          disabled={!!isCancelling[order._id]}
                        >
                          {isCancelling[order._id] ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                      {canRequestReturn && (
                        <button
                          onClick={() => requestReturn(order)}
                          className="order-action-btn return-btn"
                          disabled={!!isRequestingReturn[order._id]}
                        >
                          {isRequestingReturn[order._id] ? 'Submitting...' : 'Return (Damaged)'}
                        </button>
                      )}
                      {returnStatus === 'requested' && (
                        <span className="order-return-chip">Return requested</span>
                      )}
                      {order.status === 'delivered' && !returnWindowOpen && returnStatus === 'none' && (
                        <span className="order-return-chip">Return window closed</span>
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


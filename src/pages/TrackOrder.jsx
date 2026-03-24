import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SITE_INFO } from '../config/siteInfo'
import { getToken } from '../utils/tokenManager'

function TrackOrder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'
  const requestedOrderId = searchParams.get('orderId')

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const token = getToken('user')
        if (!token) {
          navigate('/login')
          return
        }

        const allOrdersRes = await fetch(`${API_BASE}/api/orders?includeCancelled=true`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!allOrdersRes.ok) {
          throw new Error('Unable to fetch orders')
        }

        const allOrdersData = await allOrdersRes.json()
        const allOrders = allOrdersData.orders || []
        setOrders(allOrders)

        if (requestedOrderId) {
          const singleRes = await fetch(`${API_BASE}/api/orders/${requestedOrderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (!singleRes.ok) {
            throw new Error('Order details not found')
          }

          const singleData = await singleRes.json()
          setOrder(singleData.order)
        } else if (allOrders.length > 0) {
          setOrder(allOrders[0])
        }
      } catch (err) {
        setError(err.message || 'Failed to load tracking details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrderData()
  }, [API_BASE, navigate, requestedOrderId])

  const timeline = useMemo(() => {
    const steps = [
      { key: 'processing', label: 'Order Received', desc: 'Your order has been received and is being prepared.' },
      { key: 'confirmed', label: 'Order Confirmed', desc: 'Payment and item availability have been confirmed.' },
      { key: 'shipped', label: 'Shipped', desc: 'Your order is on the way to your address.' },
      { key: 'delivered', label: 'Delivered', desc: 'Order has been delivered successfully.' },
    ]

    const statusOrder = ['processing', 'confirmed', 'shipped', 'delivered']
    const current = String(order?.status || 'processing').toLowerCase()
    const currentIndex = statusOrder.indexOf(current)

    if (current === 'cancelled') {
      return [
        ...steps.map((s, idx) => ({ ...s, state: idx <= 1 ? 'done' : 'upcoming' })),
        { key: 'cancelled', label: 'Cancelled', desc: 'This order was cancelled.', state: 'done' },
      ]
    }

    return steps.map((step, idx) => ({
      ...step,
      state: currentIndex >= idx ? 'done' : 'upcoming',
    }))
  }, [order])

  const formatAddress = (address = {}) => {
    const parts = [
      address.street,
      address.locality,
      address.city,
      address.state,
      address.postalCode || address.zipCode || address.pincode,
    ].filter(Boolean)

    return parts.length > 0 ? parts.join(', ') : 'Address not available'
  }

  if (loading) {
    return (
      <main className="main-content">
        <div className="page-container">
          <h2 className="page-title">Track Your Order</h2>
          <p>Loading tracking details...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content">
      <div className="page-container">
        <h2 className="page-title">Track Your Order</h2>
        {!order && (
          <p>No order found to track yet. Place an order and come back here.</p>
        )}

        {error && (
          <p style={{ color: '#b91c1c' }}>{error}</p>
        )}

        {order && (
          <div style={{ marginBottom: '1.25rem', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>Order #{order.orderNumber}</h3>
            <p style={{ margin: '.4rem 0' }}><strong>Status:</strong> {String(order.status || '').toUpperCase()}</p>
            <p style={{ margin: '.4rem 0' }}><strong>Placed On:</strong> {new Date(order.createdAt).toLocaleString('en-IN')}</p>
            <p style={{ margin: '.4rem 0' }}><strong>Payment:</strong> {String(order.paymentMethod || '').toUpperCase()} / {String(order.paymentStatus || '').toUpperCase()}</p>
            <p style={{ margin: '.4rem 0' }}><strong>Delivery Address:</strong> {formatAddress(order.shippingAddress)}</p>
            <p style={{ margin: '.4rem 0' }}><strong>Total Amount:</strong> INR {Number(order.total || 0).toLocaleString('en-IN')}</p>

            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ marginBottom: '.75rem' }}>Tracking Timeline</h4>
              <div style={{ display: 'grid', gap: '.5rem' }}>
                {timeline.map((step) => (
                  <div
                    key={step.key}
                    style={{
                      display: 'flex',
                      gap: '.75rem',
                      padding: '.6rem .75rem',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      background: step.state === 'done' ? '#ecfdf5' : '#f8fafc',
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{step.state === 'done' ? '✓' : '•'}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{step.label}</div>
                      <div style={{ fontSize: '.9rem', color: '#4b5563' }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {orders.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h3>Select Another Order</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
              {orders.slice(0, 8).map((o) => (
                <button
                  key={o._id}
                  className="order-action-btn track-btn"
                  onClick={() => navigate(`/track-order?orderId=${o._id}`)}
                >
                  {o.orderNumber}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="contact-info">
          <div className="contact-item">
            <h3>From Orders Page</h3>
            <p>Login and open the Orders page to view processing, shipped, and delivered statuses.</p>
          </div>
          <div className="contact-item">
            <h3>Shipment Tracking</h3>
            <p>When available, courier tracking references are shared after dispatch.</p>
          </div>
          <div className="contact-item">
            <h3>Need Assistance</h3>
            <p>
              If you need help tracking an order, contact {SITE_INFO.supportEmail} with your order ID.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default TrackOrder

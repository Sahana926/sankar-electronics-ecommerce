import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../../utils/tokenManager'
import AdminHeader from '../../components/AdminHeader'
import '../AdminOrders.css'
import '../reports.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

function RevenueReport() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = getToken('admin')
      const res = await fetch(`${API_BASE}/api/admin/orders?limit=999999`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load orders')
      setOrders((data.data || []).filter(o => o.paymentStatus === 'paid' || o.paymentStatus === 'success' || o.paymentStatus === 'completed'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="admin-revenue"><div className="page-loading">Loading revenue data...</div></div>

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const averageOrderValue = orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : 0

  return (
    <main className="main-content admin-revenue">
      <AdminHeader />
      <div className="container">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h2 className="page-title">💰 Revenue Report</h2>
              <p className="page-subtitle">Complete revenue analysis and breakdown</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
              ← Back to Dashboard
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="revenue-summary">
            <div className="summary-card large">
              <div className="summary-label">Total Revenue</div>
              <div className="summary-value currency">₹{totalRevenue.toLocaleString('en-IN')}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Orders (Paid)</div>
              <div className="summary-value">{orders.length}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Average Order Value</div>
              <div className="summary-value currency">₹{Number(averageOrderValue).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="section-header">
            <h3 className="section-title">Paid Orders</h3>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>User Email</th>
                  <th>Items</th>
                  <th>Order Amount</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map(order => (
                    <tr key={order._id}>
                      <td><strong>{order.orderNumber}</strong></td>
                      <td>{order.userEmail}</td>
                      <td>{order.items?.length || 0}</td>
                      <td><strong>₹{order.total?.toLocaleString('en-IN')}</strong></td>
                      <td>
                        <span className={`payment-method ${order.paymentMethod}`}>
                          {order.paymentMethod?.toUpperCase()}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      <div className="empty-state-icon">📭</div>
                      <div className="empty-state-text">No revenue data found</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}

export default RevenueReport

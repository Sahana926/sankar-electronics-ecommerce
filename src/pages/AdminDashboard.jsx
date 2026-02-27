import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken, getCurrentUser } from '../utils/tokenManager'
import AdminHeader from '../components/AdminHeader'
import './AdminDashboard.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

function AdminDashboard() {
  const user = getCurrentUser('admin')
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = getToken('admin')
        const res = await fetch(`${API_BASE}/api/admin/metrics`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load metrics')
        setMetrics(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  if (loading) return <div className="admin-dashboard"><div className="page-loading">Loading dashboard...</div></div>
  if (error) return <div className="admin-dashboard"><div className="error-message">{error}</div></div>

  return (
    <main className="main-content admin-dashboard">
      <AdminHeader />
      <div className="container">
        <div className="page-container">
          
          <div className="metrics-grid">
            <div className="metric-card" onClick={() => navigate('/admin/reports/products')} style={{ cursor: 'pointer' }}>
              <span className="metric-icon">📦</span>
              <div className="metric-label">Total Products</div>
              <div className="metric-value">{metrics?.totalProducts ?? 0}</div>
              <div className="metric-sublabel">All products in database</div>
            </div>
            <div className="metric-card" onClick={() => navigate('/admin/reports/orders')} style={{ cursor: 'pointer' }}>
              <span className="metric-icon">🛒</span>
              <div className="metric-label">Total Orders</div>
              <div className="metric-value">{metrics?.totalOrders ?? 0}</div>
            </div>
            <div className="metric-card" onClick={() => navigate('/admin/reports/users')} style={{ cursor: 'pointer' }}>
              <span className="metric-icon">👥</span>
              <div className="metric-label">Total Users</div>
              <div className="metric-value">{metrics?.totalUsers ?? 0}</div>
            </div>
            <div className="metric-card revenue" onClick={() => navigate('/admin/reports/revenue')} style={{ cursor: 'pointer' }}>
              <span className="metric-icon">💰</span>
              <div className="metric-label">Total Revenue</div>
              <div className="metric-value currency">₹{metrics?.totalRevenue?.toLocaleString('en-IN') ?? 0}</div>
            </div>
            <div className="metric-card low-stock" onClick={() => navigate('/admin/reports/low-stock')} style={{ cursor: 'pointer' }}>
              <span className="metric-icon">⚠️</span>
              <div className="metric-label">Low Stock Items</div>
              <div className="metric-value">{metrics?.lowStock ?? 0}</div>
            </div>
            <div className="metric-card out-of-stock" onClick={() => navigate('/admin/reports/out-of-stock')} style={{ cursor: 'pointer' }}>
              <span className="metric-icon">❌</span>
              <div className="metric-label">Out of Stock Items</div>
              <div className="metric-value">{metrics?.outOfStock ?? 0}</div>
            </div>
          </div>

          <div className="section-header">
            <div>
              <h3 className="section-title">Recent Orders</h3>
              <p className="section-subtitle">Latest order activity</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>User</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
                  metrics.recentOrders.map((o) => (
                    <tr key={o._id}>
                      <td><strong>{o.orderNumber}</strong></td>
                      <td><strong>₹{o.total?.toLocaleString('en-IN')}</strong></td>
                      <td>
                        <span className={`status-badge ${o.status?.toLowerCase()}`}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <span className={`payment-status ${o.paymentStatus?.toLowerCase()}`}>
                          {o.paymentStatus === 'success' || o.paymentStatus === 'paid' ? 'Paid' : 
                           o.paymentStatus === 'pending' ? 'Pending' : 
                           o.paymentStatus === 'failed' ? 'Failed' : 
                           o.paymentStatus}
                        </span>
                      </td>
                      <td>{o.userEmail}</td>
                      <td>{new Date(o.createdAt).toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      <div className="empty-state-icon">📭</div>
                      <div className="empty-state-text">No orders found</div>
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

export default AdminDashboard

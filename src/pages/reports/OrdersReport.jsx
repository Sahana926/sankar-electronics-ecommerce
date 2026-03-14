import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../../utils/tokenManager'
import { downloadReportPdf } from '../../utils/reportPdf'
import AdminHeader from '../../components/AdminHeader'
import '../AdminOrders.css'
import '../reports.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

function OrdersReport() {
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
      const res = await fetch(`${API_BASE}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load orders')
      setOrders(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="admin-orders"><div className="page-loading">Loading orders...</div></div>

  const totalRevenue = orders.reduce((sum, o) => {
    if (o.paymentStatus === 'paid' || o.paymentStatus === 'success' || o.paymentStatus === 'completed') {
      return sum + (o.total || 0)
    }
    return sum
  }, 0)

  const paidOrders = orders.filter(
    (o) => o.paymentStatus === 'paid' || o.paymentStatus === 'success'
  ).length

  const handleDownloadPdf = () => {
    downloadReportPdf({
      title: 'All Orders Report',
      fileName: 'orders-report',
      summaryLines: [
        `Total Orders: ${orders.length}`,
        `Paid Orders: ${paidOrders}`,
        `Total Revenue: INR ${totalRevenue.toLocaleString('en-IN')}`,
      ],
      headers: ['Order #', 'User Email', 'Amount', 'Items', 'Payment', 'Status', 'Date'],
      rows: orders.map((order) => [
        order.orderNumber,
        order.userEmail,
        `INR ${order.total?.toLocaleString('en-IN') || 0}`,
        `${order.items?.length || 0} item(s)`,
        order.paymentStatus,
        order.status,
        new Date(order.createdAt).toLocaleString('en-IN'),
      ]),
    })
  }

  return (
    <main className="main-content admin-orders">
      <AdminHeader />
      <div className="container">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h2 className="page-title">🛒 All Orders Report</h2>
              <p className="page-subtitle">Complete order history and details</p>
            </div>
            <div className="report-header-actions">
              <button className="btn btn-pdf-download" onClick={handleDownloadPdf}>
                Download PDF
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
                ← Back to Dashboard
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="report-summary">
            <div className="summary-item">
              <span className="label">Total Orders:</span>
              <span className="value">{orders.length}</span>
            </div>
            <div className="summary-item">
              <span className="label">Paid Orders:</span>
              <span className="value">{paidOrders}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total Revenue:</span>
              <span className="value currency">₹{totalRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>User Email</th>
                  <th>Amount</th>
                  <th>Items</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map(order => (
                    <tr key={order._id}>
                      <td><strong>{order.orderNumber}</strong></td>
                      <td>{order.userEmail}</td>
                      <td><strong>₹{order.total?.toLocaleString('en-IN')}</strong></td>
                      <td>{order.items?.length || 0} item(s)</td>
                      <td>
                        <span className={`payment-status ${order.paymentStatus?.toLowerCase()}`}>
                          {order.paymentStatus === 'success' || order.paymentStatus === 'paid' ? 'Paid' : 
                           order.paymentStatus === 'pending' ? 'Pending' : 
                           order.paymentStatus === 'failed' ? 'Failed' : 
                           order.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${order.status?.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="empty-state">
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

export default OrdersReport

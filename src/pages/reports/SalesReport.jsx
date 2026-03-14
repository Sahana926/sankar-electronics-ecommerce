import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../../utils/tokenManager'
import AdminHeader from '../../components/AdminHeader'
import '../AdminOrders.css'
import '../reports.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

function SalesReport() {
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
      const res = await fetch(`${API_BASE}/api/admin/orders?limit=500`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load sales report')
      setOrders(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const topSoldProducts = useMemo(() => {
    const salesMap = new Map()

    orders.forEach((order) => {
      ;(order.items || []).forEach((item) => {
        const name = item?.name || 'Unnamed Product'
        const qty = Number(item?.quantity || 0)
        const revenue = Number(item?.price || 0) * qty

        const existing = salesMap.get(name) || { name, qty: 0, revenue: 0 }
        existing.qty += qty
        existing.revenue += revenue
        salesMap.set(name, existing)
      })
    })

    return Array.from(salesMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 12)
  }, [orders])

  const maxSoldQty = topSoldProducts.length > 0 ? topSoldProducts[0].qty : 1
  const totalUnitsSold = topSoldProducts.reduce((sum, p) => sum + p.qty, 0)

  if (loading) {
    return <div className="page-loading">Loading sales report...</div>
  }

  return (
    <>
      <AdminHeader />
      <main className="main-content">
        <div className="container">
          <div className="page-container">
            <div className="page-header">
              <div>
                <h2 className="page-title">Sales Report</h2>
                <p className="page-subtitle">Most sold products based on ordered quantities</p>
              </div>
              <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
                Back to Dashboard
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="report-summary">
              <div className="summary-item">
                <span className="label">Total Orders:</span>
                <span className="value">{orders.length}</span>
              </div>
              <div className="summary-item">
                <span className="label">Products in Ranking:</span>
                <span className="value">{topSoldProducts.length}</span>
              </div>
              <div className="summary-item">
                <span className="label">Units Sold (Top List):</span>
                <span className="value">{totalUnitsSold}</span>
              </div>
            </div>

            <section className="sales-report-card" aria-label="Most sold products report">
              <h3 className="sales-report-title">Most Sold Products</h3>
              {topSoldProducts.length === 0 ? (
                <p className="sales-report-empty">No order data available yet.</p>
              ) : (
                <div className="sales-report-list">
                  {topSoldProducts.map((product) => {
                    const widthPercent = Math.max(8, Math.round((product.qty / maxSoldQty) * 100))
                    return (
                      <div className="sales-item" key={product.name}>
                        <div className="sales-item-head">
                          <span className="sales-item-name">{product.name}</span>
                          <span className="sales-item-meta">{product.qty} sold | ₹{product.revenue}</span>
                        </div>
                        <div className="sales-item-track">
                          <div className="sales-item-bar" style={{ width: `${widthPercent}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  )
}

export default SalesReport

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../../utils/tokenManager'
import AdminHeader from '../../components/AdminHeader'
import '../AdminProducts.css'
import '../reports.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

function LowStockReport() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLowStockProducts()
  }, [])

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true)
      const token = getToken('admin')
      const res = await fetch(`${API_BASE}/api/admin/reports/low-stock`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load low stock products')
      setProducts(data.data || [])
    } catch (err) {
      setError(err.message)
      // Fallback to fetching all products if endpoint doesn't exist
      fetchAllProducts()
    } finally {
      setLoading(false)
    }
  }

  const fetchAllProducts = async () => {
    try {
      const token = getToken('admin')
      const res = await fetch(`${API_BASE}/api/admin/products?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        const lowStockItems = (data.data || []).filter(p => {
          const actualStock = Array.isArray(p.colorVariants) && p.colorVariants.length > 0
            ? p.colorVariants.reduce((sum, v) => sum + (v.stockQty || 0), 0)
            : (p.stockQty || 0)
          return actualStock > 0 && actualStock < 10
        })
        setProducts(lowStockItems)
        setError('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="admin-products"><div className="page-loading">Loading low stock products...</div></div>

  return (
    <main className="main-content admin-products">
      <AdminHeader />
      <div className="container">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h2 className="page-title">⚠️ Low Stock Items Report</h2>
              <p className="page-subtitle">Products with stock less than 10 units</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
              ← Back to Dashboard
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="report-summary">
            <div className="summary-item">
              <span className="label">Low Stock Products:</span>
              <span className="value">{products.length}</span>
            </div>
          </div>

          <div className="alert-box warning">
            <span className="alert-icon">⚠️</span>
            <span className="alert-message">These products need to be reordered soon to avoid stockouts</span>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products
                    .sort((a, b) => {
                      const stockA = Array.isArray(a.colorVariants) && a.colorVariants.length > 0
                        ? a.colorVariants.reduce((sum, v) => sum + (v.stockQty || 0), 0)
                        : (a.stockQty || 0)
                      const stockB = Array.isArray(b.colorVariants) && b.colorVariants.length > 0
                        ? b.colorVariants.reduce((sum, v) => sum + (v.stockQty || 0), 0)
                        : (b.stockQty || 0)
                      return stockA - stockB
                    })
                    .map(product => {
                      const actualStock = Array.isArray(product.colorVariants) && product.colorVariants.length > 0
                        ? product.colorVariants.reduce((sum, v) => sum + (v.stockQty || 0), 0)
                        : (product.stockQty || 0)
                      return (
                        <tr key={product._id}>
                          <td><strong>{product.name}</strong></td>
                          <td>{product.sku || '–'}</td>
                          <td>{product.category || '–'}</td>
                          <td>₹{product.price}</td>
                          <td>
                            <span className="stock-warning">{actualStock} units</span>
                          </td>
                          <td>
                            <span className={`status-badge ${product.status}`}>
                              {product.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      <div className="empty-state-icon">✅</div>
                      <div className="empty-state-text">All products have healthy stock levels</div>
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

export default LowStockReport

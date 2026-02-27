import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../../utils/tokenManager'
import AdminHeader from '../../components/AdminHeader'
import '../AdminProducts.css'
import '../reports.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

function ProductsReport() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = getToken('admin')
      const res = await fetch(`${API_BASE}/api/admin/products?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load products')
      setProducts(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="admin-products"><div className="page-loading">Loading products...</div></div>

  return (
    <main className="main-content admin-products">
      <AdminHeader />
      <div className="container">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h2 className="page-title">📦 All Products Report</h2>
              <p className="page-subtitle">Complete inventory of all products</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
              ← Back to Dashboard
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="report-summary">
            <div className="summary-item">
              <span className="label">Total Products:</span>
              <span className="value">{products.length}</span>
            </div>
            <div className="summary-item">
              <span className="label">Active Products:</span>
              <span className="value">{products.filter(p => p.status === 'active').length}</span>
            </div>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <tr key={product._id}>
                      <td><strong>{product.name}</strong></td>
                      <td>{product.sku || '–'}</td>
                      <td>{product.category || '–'}</td>
                      <td>₹{product.price}</td>
                      <td>{product.stockQty}</td>
                      <td>
                        <span className={`status-badge ${product.status}`}>
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      <div className="empty-state-icon">📭</div>
                      <div className="empty-state-text">No products found</div>
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

export default ProductsReport

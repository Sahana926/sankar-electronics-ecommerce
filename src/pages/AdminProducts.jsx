import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { getToken } from '../utils/tokenManager'
import AdminHeader from '../components/AdminHeader'
import './AdminProducts.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

function AdminProducts() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [categories, setCategories] = useState([])
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [stockUpdate, setStockUpdate] = useState({ id: null, value: '' })
  const navigate = useNavigate()

  const fetchProducts = async (pageNum = 1) => {
    try {
      setLoading(true)
      const token = getToken('admin')
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '200', // Show all products
      })
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      if (status) params.append('status', status)

      const res = await fetch(`${API_BASE}/api/admin/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load products')
      setItems(data.data || [])
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 1 })
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true)
      const token = getToken('admin')
      const res = await fetch(`${API_BASE}/api/admin/products/inventory/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load summary')
      setSummary(data)
    } catch (err) {
      console.error('Failed to fetch summary:', err)
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCategories = async () => {
    try {
      const token = getToken('admin')
      const res = await fetch(`${API_BASE}/api/admin/products/inventory/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok && data.byCategory) {
        const cats = data.byCategory.map(c => c._id).filter(Boolean)
        // Always include all available categories even if no products exist
        const allCategories = [
          'Switches & Sockets',
          'Wires & Cables',
          'Lighting',
          'Fans',
          'Electrical Accessories',
          'Fasteners',
          'Hand Tools',
          'Power Tools',
          'Construction Hardware',
          'Plumbing Hardware'
        ]
        // Merge backend categories with all categories, remove duplicates
        const mergedCategories = [...new Set([...cats, ...allCategories])]
        setCategories(mergedCategories)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      // Fallback to all categories if fetch fails
      setCategories([
        'Switches & Sockets',
        'Wires & Cables',
        'Lighting',
        'Fans',
        'Electrical Accessories',
        'Fasteners',
        'Hand Tools',
        'Power Tools',
        'Construction Hardware',
        'Plumbing Hardware'
      ])
    }
  }

  const handleSearch = () => {
    fetchProducts(1)
  }

  const handleStockUpdate = async (id, newStock) => {
    try {
      const token = getToken('admin')
      const res = await fetch(`${API_BASE}/api/admin/products/${id}/stock`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stockQty: Number(newStock) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update stock')
      toast.success('Stock updated successfully')
      setStockUpdate({ id: null, value: '' })
      fetchProducts(pagination.page)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleQuickStockUpdate = async (id, action, quantity = 1) => {
    try {
      const token = getToken('admin')
      const res = await fetch(`${API_BASE}/api/admin/products/${id}/stock`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, quantity }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update stock')
      toast.success('Stock updated successfully')
      fetchProducts(pagination.page)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleSoftDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      const token = getToken('admin')
      const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Delete failed')
      toast.success('Product deleted')
      fetchProducts(pagination.page)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleRestore = async (id) => {
    try {
      const token = getToken('admin')
      const res = await fetch(`${API_BASE}/api/admin/products/${id}/restore`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Restore failed')
      toast.success('Product restored')
      fetchProducts(pagination.page)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', class: 'out-of-stock' }
    if (stock < 10) return { label: 'Low Stock', class: 'low-stock' }
    return { label: 'In Stock', class: 'in-stock' }
  }

  if (loading && items.length === 0) {
    return <div className="admin-products"><div className="page-loading">Loading products...</div></div>
  }

  return (
    <main className="main-content admin-products">
      <AdminHeader />
      <div className="container">
        <div className="page-container">
          <div className="page-header">
            <h2 className="page-title">Inventory & Products</h2>
            <div className="header-actions">
              <button className="btn btn-primary" onClick={() => navigate('/admin/products/new')}>
                ➕ Add Product
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Inventory summary cards */}
          <div className="inventory-summary-grid">
            <div className="summary-card">
              <div className="summary-icon">📦</div>
              <div className="summary-content">
                <div className="summary-label">Total Products</div>
                <div className="summary-value">{summary?.totalProducts ?? '–'}</div>
              </div>
            </div>
            <div className="summary-card in-stock">
              <div className="summary-icon">✅</div>
              <div className="summary-content">
                <div className="summary-label">In Stock (≥10)</div>
                <div className="summary-value">{summary?.inStock ?? '–'}</div>
              </div>
            </div>
            <div className="summary-card low-stock">
              <div className="summary-icon">⚠️</div>
              <div className="summary-content">
                <div className="summary-label">Low Stock (&lt;10)</div>
                <div className="summary-value">{summary?.lowStock ?? '–'}</div>
              </div>
            </div>
            <div className="summary-card out-of-stock">
              <div className="summary-icon">❌</div>
              <div className="summary-content">
                <div className="summary-label">Out of Stock</div>
                <div className="summary-value">{summary?.outOfStock ?? '–'}</div>
              </div>
            </div>
          </div>

          <div className="filters-section">
            <div className="filter-group">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="filter-input"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))
                ) : (
                  <>
                    <option value="Switches & Sockets">Switches & Sockets</option>
                    <option value="Wires & Cables">Wires & Cables</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Fans">Fans</option>
                    <option value="Electrical Accessories">Electrical Accessories</option>
                    <option value="Fasteners">Fasteners</option>
                    <option value="Hand Tools">Hand Tools</option>
                    <option value="Power Tools">Power Tools</option>
                    <option value="Construction Hardware">Construction Hardware</option>
                    <option value="Plumbing Hardware">Plumbing Hardware</option>
                  </>
                )}
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className="btn btn-primary" onClick={handleSearch}>
                🔍 Search
              </button>
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setCategory(''); setStatus(''); fetchProducts(1); }}>
                🔄 Reset
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => {
                  // Calculate actual stock (sum of color variants if they exist, otherwise use stockQty)
                  const actualStock = (Array.isArray(p.colorVariants) && p.colorVariants.length > 0)
                    ? p.colorVariants.reduce((sum, v) => sum + (v.stockQty || 0), 0)
                    : p.stockQty
                  const stockStatus = getStockStatus(actualStock)
                  const productImage = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/100x100?text=No+Image'
                  return (
                    <tr key={p._id}>
                      <td>
                        <div className="product-image-cell">
                          <img 
                            src={productImage} 
                            alt={p.name} 
                            className="product-thumbnail"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="product-name-cell">
                          <strong>{p.name}</strong>
                          {p.description && (
                            <span className="product-description">{p.description.substring(0, 50)}...</span>
                          )}
                        </div>
                      </td>
                      <td>{p.category || 'N/A'}</td>
                      <td>
                        <div className="price-cell">
                          <span className="product-price">₹{p.price}</span>
                        </div>
                      </td>
                      <td>
                        <div className="stock-cell">
                          {stockUpdate.id === p._id ? (
                            <div className="stock-edit">
                              <input
                                type="number"
                                value={stockUpdate.value}
                                onChange={(e) => setStockUpdate({ id: p._id, value: e.target.value })}
                                className="stock-input"
                                min="0"
                                autoFocus
                              />
                              <button
                                className="btn-small btn-success"
                                onClick={() => handleStockUpdate(p._id, stockUpdate.value)}
                              >
                                ✓
                              </button>
                              <button
                                className="btn-small btn-danger"
                                onClick={() => setStockUpdate({ id: null, value: '' })}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="stock-display">
                              <span className={`stock-badge ${stockStatus.class}`}>
                                {actualStock} units
                              </span>
                              <span className="stock-status-label">{stockStatus.label}</span>
                              {/* Hide stock edit actions for products with color variants */}
                              {!(Array.isArray(p.colorVariants) && p.colorVariants.length > 0) && (
                                <div className="stock-quick-actions">
                                  <button
                                    className="btn-icon btn-success"
                                    onClick={() => handleQuickStockUpdate(p._id, 'increment', 1)}
                                    title="Increase by 1"
                                  >
                                    +1
                                  </button>
                                  <button
                                    className="btn-icon btn-success"
                                    onClick={() => handleQuickStockUpdate(p._id, 'increment', 10)}
                                    title="Increase by 10"
                                  >
                                    +10
                                  </button>
                                  <button
                                    className="btn-icon btn-warning"
                                    onClick={() => handleQuickStockUpdate(p._id, 'decrement', 1)}
                                    title="Decrease by 1"
                                  >
                                    -1
                                  </button>
                                  <button
                                    className="btn-icon btn-danger"
                                    onClick={() => handleQuickStockUpdate(p._id, 'decrement', 10)}
                                    title="Decrease by 10"
                                  >
                                    -10
                                  </button>
                                  <button
                                    className="btn-icon btn-primary"
                                    onClick={() => setStockUpdate({ id: p._id, value: p.stockQty.toString() })}
                                    title="Edit stock"
                                  >
                                    ✏️
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${p.status}`}>
                          {p.status}
                        </span>
                        {p.softDeleted && (
                          <span className="deleted-badge">Deleted</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-small btn-primary"
                            onClick={() => navigate(`/admin/products/${p._id}`)}
                          >
                            Edit
                          </button>
                          {!p.softDeleted ? (
                            <button
                              className="btn btn-small btn-danger"
                              onClick={() => handleSoftDelete(p._id)}
                            >
                              Delete
                            </button>
                          ) : (
                            <button
                              className="btn btn-small btn-success"
                              onClick={() => handleRestore(p._id)}
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      <div className="empty-state-icon">📦</div>
                      <div className="empty-state-text">No products found</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                onClick={() => fetchProducts(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => fetchProducts(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default AdminProducts

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { getToken } from '../utils/tokenManager'
import './InventoryManagement.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

function InventoryManagement() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, lowStock, outOfStock, inStock
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockUpdate, setStockUpdate] = useState({ id: null, value: '' })
  const [bulkUpdate, setBulkUpdate] = useState({ ids: [], action: 'increment', quantity: 1 })

  useEffect(() => {
    fetchSummary()
    fetchProducts()
  }, [filter, categoryFilter])

  const fetchSummary = async () => {
    try {
      const token = getToken('admin')
      const res = await fetch(`${API_BASE}/api/admin/products/inventory/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load inventory summary')
      setSummary(data)
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = getToken('admin')
      let filterQuery = {}
      
      if (filter === 'lowStock') {
        filterQuery.stockQty = { $lt: 10, $gt: 0 }
      } else if (filter === 'outOfStock') {
        filterQuery.stockQty = 0
      } else if (filter === 'inStock') {
        filterQuery.stockQty = { $gte: 10 }
      }

      if (categoryFilter) {
        filterQuery.category = categoryFilter
      }

      const params = new URLSearchParams({
        includeDeleted: 'false',
        limit: '100',
      })
      
      if (Object.keys(filterQuery).length > 0) {
        // We'll filter client-side for now since backend doesn't support complex stock filters
      }

      const res = await fetch(`${API_BASE}/api/admin/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load products')
      
      // Helper function to calculate actual stock (including color variants)
      const getActualStock = (product) => {
        if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
          return product.colorVariants.reduce((sum, v) => sum + (v.stockQty || 0), 0)
        }
        return product.stockQty || 0
      }

      // Apply client-side filtering
      let filtered = data.data || []
      if (filter === 'lowStock') {
        filtered = filtered.filter(p => {
          const actualStock = getActualStock(p)
          return actualStock > 0 && actualStock < 10
        })
      } else if (filter === 'outOfStock') {
        filtered = filtered.filter(p => {
          const actualStock = getActualStock(p)
          return actualStock === 0
        })
      } else if (filter === 'inStock') {
        filtered = filtered.filter(p => {
          const actualStock = getActualStock(p)
          return actualStock >= 10
        })
      }

      if (categoryFilter) {
        filtered = filtered.filter(p => p.category === categoryFilter)
      }

      setProducts(filtered)
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
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
      fetchProducts()
      fetchSummary()
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
      fetchProducts()
      fetchSummary()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleBulkStockUpdate = async () => {
    if (bulkUpdate.ids.length === 0) {
      toast.error('Please select products to update')
      return
    }

    try {
      const token = getToken('admin')
      const updates = bulkUpdate.ids.map(id => ({
        id,
        action: bulkUpdate.action,
        quantity: bulkUpdate.quantity,
      }))

      const res = await fetch(`${API_BASE}/api/admin/products/bulk/stock`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update stock')
      toast.success(`Stock updated for ${data.results.updated} products`)
      setBulkUpdate({ ids: [], action: 'increment', quantity: 1 })
      fetchProducts()
      fetchSummary()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const toggleProductSelection = (id) => {
    setBulkUpdate(prev => ({
      ...prev,
      ids: prev.ids.includes(id)
        ? prev.ids.filter(i => i !== id)
        : [...prev.ids, id]
    }))
  }

  const selectAll = () => {
    setBulkUpdate(prev => ({
      ...prev,
      ids: products.map(p => p._id)
    }))
  }

  const clearSelection = () => {
    setBulkUpdate(prev => ({ ...prev, ids: [] }))
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', class: 'out-of-stock', color: '#dc2626' }
    if (stock < 10) return { label: 'Low Stock', class: 'low-stock', color: '#f59e0b' }
    return { label: 'In Stock', class: 'in-stock', color: '#10b981' }
  }

  const categories = summary?.byCategory?.map(c => c._id).filter(Boolean) || []

  if (loading && !summary) {
    return <div className="inventory-management"><div className="page-loading">Loading inventory...</div></div>
  }

  return (
    <main className="main-content inventory-management">
      <div className="container">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h2 className="page-title">Inventory & Stock Management</h2>
              <p className="page-subtitle">Manage product stock levels and inventory</p>
            </div>
            <div className="header-actions">
              <Link to="/admin/products" className="btn btn-secondary">
                ← Back to Products
              </Link>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Summary Cards */}
          {summary && (
            <div className="inventory-summary-grid">
              <div className="summary-card">
                <div className="summary-icon">📦</div>
                <div className="summary-content">
                  <div className="summary-label">Total Products</div>
                  <div className="summary-value">{summary.totalProducts}</div>
                </div>
              </div>
              <div className="summary-card in-stock">
                <div className="summary-icon">✅</div>
                <div className="summary-content">
                  <div className="summary-label">In Stock</div>
                  <div className="summary-value">{summary.inStock}</div>
                </div>
              </div>
              <div className="summary-card low-stock">
                <div className="summary-icon">⚠️</div>
                <div className="summary-content">
                  <div className="summary-label">Low Stock</div>
                  <div className="summary-value">{summary.lowStock}</div>
                </div>
              </div>
              <div className="summary-card out-of-stock">
                <div className="summary-icon">❌</div>
                <div className="summary-content">
                  <div className="summary-label">Out of Stock</div>
                  <div className="summary-value">{summary.outOfStock}</div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="filters-section">
            <div className="filter-group">
              <label>Stock Status:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Products</option>
                <option value="inStock">In Stock (≥10)</option>
                <option value="lowStock">Low Stock (&lt;10)</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
              <label>Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button className="btn btn-secondary" onClick={() => { setFilter('all'); setCategoryFilter(''); }}>
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {bulkUpdate.ids.length > 0 && (
            <div className="bulk-actions-bar">
              <span className="bulk-selection-count">
                {bulkUpdate.ids.length} product{bulkUpdate.ids.length !== 1 ? 's' : ''} selected
              </span>
              <div className="bulk-controls">
                <select
                  value={bulkUpdate.action}
                  onChange={(e) => setBulkUpdate(prev => ({ ...prev, action: e.target.value }))}
                  className="bulk-select"
                >
                  <option value="increment">Increase</option>
                  <option value="decrement">Decrease</option>
                </select>
                <input
                  type="number"
                  min="1"
                  value={bulkUpdate.quantity}
                  onChange={(e) => setBulkUpdate(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  className="bulk-input"
                  placeholder="Quantity"
                />
                <button className="btn btn-primary" onClick={handleBulkStockUpdate}>
                  Apply to Selected
                </button>
                <button className="btn btn-secondary" onClick={clearSelection}>
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      onChange={(e) => e.target.checked ? selectAll() : clearSelection()}
                      checked={products.length > 0 && bulkUpdate.ids.length === products.length}
                    />
                  </th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th>Quick Actions</th>
                  <th>Edit Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  // Calculate actual stock (including color variants)
                  const actualStock = (Array.isArray(p.colorVariants) && p.colorVariants.length > 0)
                    ? p.colorVariants.reduce((sum, v) => sum + (v.stockQty || 0), 0)
                    : p.stockQty || 0
                  const stockStatus = getStockStatus(actualStock)
                  return (
                    <tr key={p._id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={bulkUpdate.ids.includes(p._id)}
                          onChange={() => toggleProductSelection(p._id)}
                        />
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
                        <div className="stock-display">
                          <span className="stock-value" style={{ color: stockStatus.color, fontWeight: 'bold' }}>
                            {actualStock} units
                          </span>
                          {Array.isArray(p.colorVariants) && p.colorVariants.length > 0 && (
                            <div className="variant-stock-info">
                              <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                                {p.colorVariants.length} color variant{p.colorVariants.length !== 1 ? 's' : ''}
                              </small>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${stockStatus.class}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td>
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
                        </div>
                      </td>
                      <td>
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
                          <button
                            className="btn btn-small btn-primary"
                            onClick={() => setStockUpdate({ id: p._id, value: p.stockQty.toString() })}
                          >
                            ✏️ Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {products.length === 0 && (
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

          {/* Category Summary */}
          {summary?.byCategory && summary.byCategory.length > 0 && (
            <div className="category-summary-section">
              <h3 className="section-title">Stock by Category</h3>
              <div className="category-grid">
                {summary.byCategory.map((cat) => (
                  <div key={cat._id || 'uncategorized'} className="category-card">
                    <div className="category-name">{cat._id || 'Uncategorized'}</div>
                    <div className="category-stats">
                      <span className="category-count">{cat.count} products</span>
                      <span className="category-stock">Total: {cat.totalStock} units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default InventoryManagement


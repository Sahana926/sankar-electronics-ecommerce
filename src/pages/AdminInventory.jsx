import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { getToken } from '../utils/tokenManager'
import AdminHeader from '../components/AdminHeader'
import './AdminInventory.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

function AdminInventory() {
  const [summary, setSummary] = useState(null)
  const [lowStockItems, setLowStockItems] = useState([])
  const [outOfStockItems, setOutOfStockItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bulkUpdate, setBulkUpdate] = useState({})

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      const token = getToken('admin')

      // Fetch all products to build accurate summary
      const lowStockRes = await fetch(`${API_BASE}/api/admin/products?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const lowStockData = await lowStockRes.json()
      if (lowStockRes.ok) {
        const products = (lowStockData.data || []).map(p => {
          // Calculate actual stock from color variants if they exist
          const actualStock = (Array.isArray(p.colorVariants) && p.colorVariants.length > 0)
            ? p.colorVariants.reduce((sum, v) => sum + (v.stockQty || 0), 0)
            : (p.stockQty || 0)
          return { ...p, actualStock }
        })
        const lowStock = products.filter(p => p.actualStock > 0 && p.actualStock < 10)
        const outOfStock = products.filter(p => p.actualStock === 0)
        const inStock = products.filter(p => p.actualStock >= 10)

        const byCategoryMap = {}
        products.forEach((p) => {
          const category = p.category || 'Uncategorized'
          if (!byCategoryMap[category]) {
            byCategoryMap[category] = { _id: category, count: 0, totalStock: 0 }
          }
          byCategoryMap[category].count += 1
          byCategoryMap[category].totalStock += p.actualStock
        })

        setSummary({
          totalProducts: products.length,
          lowStock: lowStock.length,
          outOfStock: outOfStock.length,
          inStock: inStock.length,
          byCategory: Object.values(byCategoryMap).sort((a, b) => b.count - a.count),
        })
        setLowStockItems(lowStock)
        setOutOfStockItems(outOfStock)
      }
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkStockUpdate = async () => {
    try {
      const updates = Object.entries(bulkUpdate)
        .filter(([_, value]) => value !== '')
        .map(([id, value]) => ({ id, stockQty: Number(value) }))

      if (updates.length === 0) {
        toast.warning('No updates to apply')
        return
      }

      const token = getToken('admin')
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
      setBulkUpdate({})
      fetchInventoryData()
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
      fetchInventoryData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) {
    return <div className="admin-inventory"><div className="page-loading">Loading inventory...</div></div>
  }

  if (error) {
    return <div className="admin-inventory"><div className="error-message">{error}</div></div>
  }

  return (
    <>
      <AdminHeader />
      <main className="main-content admin-inventory">
      <div className="container">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h2 className="page-title">Inventory Management</h2>
              <p className="page-subtitle">Monitor and manage product stock levels</p>
            </div>
            <Link to="/admin/products" className="btn btn-secondary">
              ← Back to Products
            </Link>
          </div>

          {/* Summary Cards */}
          <div className="inventory-summary">
            <div className="summary-card total">
              <div className="summary-icon">📦</div>
              <div className="summary-content">
                <div className="summary-label">Total Products</div>
                <div className="summary-value">{summary?.totalProducts || 0}</div>
              </div>
            </div>
            <div className="summary-card in-stock">
              <div className="summary-icon">✅</div>
              <div className="summary-content">
                <div className="summary-label">In Stock</div>
                <div className="summary-value">{summary?.inStock || 0}</div>
              </div>
            </div>
            <div className="summary-card low-stock">
              <div className="summary-icon">⚠️</div>
              <div className="summary-content">
                <div className="summary-label">Low Stock</div>
                <div className="summary-value">{summary?.lowStock || 0}</div>
              </div>
            </div>
            <div className="summary-card out-of-stock">
              <div className="summary-icon">❌</div>
              <div className="summary-content">
                <div className="summary-label">Out of Stock</div>
                <div className="summary-value">{summary?.outOfStock || 0}</div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {summary?.byCategory && summary.byCategory.length > 0 && (
            <div className="category-breakdown">
              <h3 className="section-title">Stock by Category</h3>
              <div className="category-grid">
                {summary.byCategory.map((cat) => (
                  <div key={cat._id || 'uncategorized'} className="category-card">
                    <div className="category-name">{cat._id || 'Uncategorized'}</div>
                    <div className="category-stats">
                      <span className="category-count">{cat.count} products</span>
                      <span className="category-stock">{cat.totalStock} units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Stock Items */}
          {lowStockItems.length > 0 && (
            <div className="alert-section">
              <h3 className="section-title">⚠️ Low Stock Items ({lowStockItems.length})</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Quick Actions</th>
                      <th>Update Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((item) => (
                      <tr key={item._id}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.category || 'N/A'}</td>
                        <td>
                          <span className="stock-badge low-stock">{item.actualStock} units</span>
                        </td>
                        <td>
                          <div className="quick-actions">
                            <button
                              className="btn-icon btn-success"
                              onClick={() => handleQuickStockUpdate(item._id, 'increment', 5)}
                              title="Add 5 units"
                            >
                              +5
                            </button>
                            <button
                              className="btn-icon btn-success"
                              onClick={() => handleQuickStockUpdate(item._id, 'increment', 10)}
                              title="Add 10 units"
                            >
                              +10
                            </button>
                            <button
                              className="btn-icon btn-danger"
                              onClick={() => handleQuickStockUpdate(item._id, 'decrement', 1)}
                              title="Remove 1 unit"
                            >
                              -1
                            </button>
                          </div>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="stock-input"
                            placeholder="New stock"
                            value={bulkUpdate[item._id] || ''}
                            onChange={(e) => setBulkUpdate({ ...bulkUpdate, [item._id]: e.target.value })}
                            min="0"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {Object.keys(bulkUpdate).length > 0 && (
                <div className="bulk-update-actions">
                  <button className="btn btn-primary" onClick={handleBulkStockUpdate}>
                    Update All ({Object.keys(bulkUpdate).length} items)
                  </button>
                  <button className="btn btn-secondary" onClick={() => setBulkUpdate({})}>
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Out of Stock Items */}
          {outOfStockItems.length > 0 && (
            <div className="alert-section">
              <h3 className="section-title">❌ Out of Stock Items ({outOfStockItems.length})</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Quick Actions</th>
                      <th>Restock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outOfStockItems.map((item) => (
                      <tr key={item._id}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.category || 'N/A'}</td>
                        <td>₹{item.price}</td>
                        <td>
                          <div className="quick-actions">
                            <button
                              className="btn-icon btn-success"
                              onClick={() => handleQuickStockUpdate(item._id, 'increment', 10)}
                              title="Add 10 units"
                            >
                              +10
                            </button>
                            <button
                              className="btn-icon btn-success"
                              onClick={() => handleQuickStockUpdate(item._id, 'increment', 50)}
                              title="Add 50 units"
                            >
                              +50
                            </button>
                            <button
                              className="btn-icon btn-success"
                              onClick={() => handleQuickStockUpdate(item._id, 'increment', 100)}
                              title="Add 100 units"
                            >
                              +100
                            </button>
                          </div>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="stock-input"
                            placeholder="Restock quantity"
                            value={bulkUpdate[item._id] || ''}
                            onChange={(e) => setBulkUpdate({ ...bulkUpdate, [item._id]: e.target.value })}
                            min="0"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {Object.keys(bulkUpdate).length > 0 && (
                <div className="bulk-update-actions">
                  <button className="btn btn-primary" onClick={handleBulkStockUpdate}>
                    Restock All ({Object.keys(bulkUpdate).length} items)
                  </button>
                  <button className="btn btn-secondary" onClick={() => setBulkUpdate({})}>
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {lowStockItems.length === 0 && outOfStockItems.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <div className="empty-state-text">All products are well stocked!</div>
            </div>
          )}
        </div>
      </div>
    </main>
    </>
  )
}

export default AdminInventory


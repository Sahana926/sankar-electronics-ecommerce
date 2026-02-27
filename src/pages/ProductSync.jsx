import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { getToken } from '../utils/tokenManager'
import './ProductSync.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

// Import static products from Shop.jsx
// This is a simplified version - in production, you'd extract this to a shared file
const STATIC_PRODUCTS = [
  {
    id: 'sock-yu-6a16a-heavy',
    title: '6 A /16 A Heavy Duty Shuttered Socket (YU Series)',
    description: 'YU heavy duty 6/16A shuttered socket',
    price: 300,
    category: 'electronics',
    subcategory: 'Switches & Sockets',
    stock: 160,
  },
  {
    id: 'sock-verona-6a-3pin-isi',
    title: '6 A 3 Pin Shuttered Socket ISI (Verona Series)',
    description: 'Verona 6A shuttered socket ISI',
    price: 193,
    category: 'electronics',
    subcategory: 'Switches & Sockets',
    stock: 190,
  },
  // Add more products as needed - this is a sample
]

function ProductSync() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])

  const handleSelectAll = () => {
    setSelectedProducts(STATIC_PRODUCTS.map(p => p.id))
  }

  const handleDeselectAll = () => {
    setSelectedProducts([])
  }

  const toggleProduct = (id) => {
    setSelectedProducts(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleSync = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product to sync')
      return
    }

    setLoading(true)
    try {
      const token = getToken('user')
      const productsToSync = STATIC_PRODUCTS.filter(p => selectedProducts.includes(p.id))
      
      const res = await fetch(`${API_BASE}/api/admin/products/bulk`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: productsToSync }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to sync products')

      setResults(data.results)
      toast.success(`Sync completed: ${data.results.created} created, ${data.results.updated} updated`)
      
      if (data.results.errors && data.results.errors.length > 0) {
        toast.warning(`${data.results.errors.length} products had errors`)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="main-content product-sync">
      <div className="container">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h2 className="page-title">Product Sync</h2>
              <p className="page-subtitle">Sync static products from user side to backend database</p>
            </div>
            <div className="header-actions">
              <Link to="/admin/products" className="btn btn-secondary">
                ← Back to Products
              </Link>
            </div>
          </div>

          <div className="sync-info">
            <div className="info-card">
              <h3>📋 Instructions</h3>
              <ul>
                <li>Select products from the static product list below</li>
                <li>Click "Sync Selected Products" to save them to the backend</li>
                <li>Products will be created if they don't exist, or updated if they already exist</li>
                <li>Products are matched by SKU or product name</li>
              </ul>
            </div>
          </div>

          <div className="sync-controls">
            <div className="selection-controls">
              <button className="btn btn-secondary" onClick={handleSelectAll}>
                Select All ({STATIC_PRODUCTS.length})
              </button>
              <button className="btn btn-secondary" onClick={handleDeselectAll}>
                Deselect All
              </button>
              <span className="selection-count">
                {selectedProducts.length} of {STATIC_PRODUCTS.length} selected
              </span>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleSync}
              disabled={loading || selectedProducts.length === 0}
            >
              {loading ? 'Syncing...' : `🔄 Sync Selected Products`}
            </button>
          </div>

          {results && (
            <div className="sync-results">
              <h3>Sync Results</h3>
              <div className="results-grid">
                <div className="result-card success">
                  <div className="result-icon">✅</div>
                  <div className="result-value">{results.created}</div>
                  <div className="result-label">Created</div>
                </div>
                <div className="result-card info">
                  <div className="result-icon">🔄</div>
                  <div className="result-value">{results.updated}</div>
                  <div className="result-label">Updated</div>
                </div>
                {results.errors && results.errors.length > 0 && (
                  <div className="result-card error">
                    <div className="result-icon">❌</div>
                    <div className="result-value">{results.errors.length}</div>
                    <div className="result-label">Errors</div>
                  </div>
                )}
              </div>
              {results.errors && results.errors.length > 0 && (
                <div className="errors-list">
                  <h4>Errors:</h4>
                  <ul>
                    {results.errors.map((err, idx) => (
                      <li key={idx}>
                        <strong>{err.product}:</strong> {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="products-list">
            <h3>Available Products ({STATIC_PRODUCTS.length})</h3>
            <div className="products-grid">
              {STATIC_PRODUCTS.map((product) => (
                <div
                  key={product.id}
                  className={`product-card ${selectedProducts.includes(product.id) ? 'selected' : ''}`}
                  onClick={() => toggleProduct(product.id)}
                >
                  <div className="product-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="product-content">
                    <h4 className="product-title">{product.title}</h4>
                    <p className="product-description">{product.description}</p>
                    <div className="product-details">
                      <span className="product-category">{product.subcategory || product.category}</span>
                      <span className="product-price">₹{product.price}</span>
                      <span className="product-stock">Stock: {product.stock}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="note-section">
            <div className="note-card">
              <h4>ℹ️ Note</h4>
              <p>
                This page syncs products from the static product list in Shop.jsx to the backend database.
                In production, you should extract all static products to a separate data file and import them here.
                Currently, only a sample of products is shown. To sync all products, you'll need to:
              </p>
              <ol>
                <li>Extract all static products from Shop.jsx</li>
                <li>Add them to the STATIC_PRODUCTS array in this file</li>
                <li>Run the sync operation</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ProductSync


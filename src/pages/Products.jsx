import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'

/**
 * Products Component
 * 
 * Public page displaying all available products.
 * Visit Shop button requires login - redirects to login if not authenticated.
 */
function Products() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load products')
        const mapped = (data.data || []).map((p) => ({
          id: p._id,
          title: p.name,
          description: p.description || 'Quality product from our catalog',
          price: p.discountPrice && p.discountPrice > 0 ? `₹${p.discountPrice}` : `₹${p.price}`,
        }))
        setItems(mapped)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    return (
      <div className="products-container">
        <header className="hero">
          <h1 className="hero-title">Categories</h1>
          <p className="hero-subtitle">
            Discover quality components and tools for your electronics and electrical needs.
          </p>
          {!isAuthenticated && (
            <button className="login-btn" onClick={() => navigate('/login')}>
              Login to Continue
            </button>
          )}
        </header>

        <section className="categories">
          {loading && <p className="loading">Loading products...</p>}
          {error && !loading && <p className="error">{error}</p>}
          {!loading && !error && items.length === 0 && <p className="empty">No products available.</p>}
          {!loading && !error &&
            items.map((product) => (
              <div className="category-card" key={product.id}>
                <div className="category-icon">
                  <i className="fa-solid fa-bolt" aria-hidden="true"></i>
                </div>
                <div className="category-info">
                  <h2>{product.title}</h2>
                  <p>{product.description}</p>
                  <span className="category-price">{product.price}</span>
                </div>
                <button className="view-products-btn" onClick={() => navigate('/shop')}>
                  View Products
                </button>
              </div>
            ))}
        </section>
      </div>
    )
                } else {
                  // If not logged in, redirect to login page
                  navigate('/login', { state: { from: '/shop' } })
                }
              }}
              className="shop-now-btn"
            >
              Visit Shop
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Products


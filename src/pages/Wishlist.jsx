import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useCounts } from '../context/CountsContext'
import { getToken } from '../utils/tokenManager'

/**
 * Wishlist Component
 * 
 * Wishlist page displaying all items saved by the user.
 * Connected to backend API for wishlist management.
 * Refreshes counts after removing items.
 */
function Wishlist() {
  const { isAuthenticated } = useAuth()
  const { refreshCounts } = useCounts()
  const navigate = useNavigate()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

  const fallbackImageFor = (item) => {
    const name = (item?.name || '').toLowerCase()
    let keyword = 'electrical products'
    if (name.includes('switch')) keyword = 'light switch, electrical switch'
    else if (name.includes('light') || name.includes('bulb')) keyword = 'led light bulb, lighting'
    else if (name.includes('fan')) keyword = 'ceiling fan, table fan'
    else if (name.includes('wire') || name.includes('cable')) keyword = 'electrical cable, wires'
    else if (name.includes('mcb') || name.includes('distribution')) keyword = 'circuit breaker, mcb'
    else if (name.includes('tool')) keyword = 'hand tools, toolkit'
    return `https://source.unsplash.com/400x300/?${encodeURIComponent(keyword)}&sig=${encodeURIComponent(item?.productId || name || 'product')}`
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Fetch wishlist items when component mounts or user logs in
    fetchWishlistItems()
  }, [isAuthenticated, navigate])

  // Refresh wishlist when user changes (login/logout)
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlistItems()
    } else {
      setWishlistItems([])
    }
  }, [isAuthenticated])

  const fetchWishlistItems = async () => {
    try {
      const token = getToken('user')
      const response = await fetch(`${API_BASE}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data.items || [])
      } else {
        setWishlistItems([])
      }
    } catch (error) {
      console.log('Backend not available, using empty wishlist')
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (itemId) => {
    try {
      const token = getToken('user')
      const response = await fetch(`${API_BASE}/api/wishlist/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchWishlistItems()
        // Refresh counts to update header badges
        refreshCounts()
      }
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const addToCart = async (item) => {
    try {
      const token = getToken('user')
      const response = await fetch(`${API_BASE}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: 1,
          imageUrl: item.imageUrl || '',
        }),
      })

      if (response.ok) {
        alert('Item added to cart!')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  if (loading) {
    return (
      <main className="main-content">
        <div className="container">
          <div className="page-container">
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading wishlist...</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content">
      <div className="container">
        <div className="page-container">
          <h2 className="page-title">My Wishlist</h2>

          {wishlistItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">❤️</div>
              <h3>Your wishlist is empty</h3>
              <p>Save items you love to your wishlist</p>
              <button onClick={() => navigate('/shop')} className="shop-now-btn">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlistItems.map((item) => (
                <div key={item._id} className="wishlist-item">
                  <button
                    className="wishlist-remove"
                    onClick={() => removeFromWishlist(item._id)}
                    title="Remove from wishlist"
                  >
                    ❤️
                  </button>
                  <div className="wishlist-item-media">
                    <img
                      className="wishlist-item-image"
                      src={item.imageUrl || fallbackImageFor(item)}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="wishlist-item-price">₹{item.price}</div>
                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(item)}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Wishlist


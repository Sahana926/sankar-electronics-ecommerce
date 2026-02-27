import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useCounts } from '../context/CountsContext'
import { getToken } from '../utils/tokenManager'


function Cart() {
  const { isAuthenticated } = useAuth()
  const { refreshCounts } = useCounts()
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [expandedItems, setExpandedItems] = useState({})
  const [error, setError] = useState('')
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

    // Fetch cart items when component mounts or user logs in
    fetchCartItems()
  }, [isAuthenticated, navigate])

  // Refresh cart when user changes (login/logout)
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItems()
    } else {
      setCartItems([])
      setTotal(0)
    }
  }, [isAuthenticated])

  const fetchCartItems = async () => {
    try {
      const token = getToken('user')
      const response = await fetch(`${API_BASE}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCartItems(data.items || [])
        calculateTotal(data.items || [])
        setError('')
      } else if (response.status === 401) {
        setCartItems([])
        setTotal(0)
        setError('Session expired. Please login again.')
        navigate('/login')
      } else {
        const data = await response.json().catch(() => ({}))
        setCartItems([])
        setTotal(0)
        setError(data.message || 'Failed to load cart')
      }
    } catch (error) {
      console.log('Backend not available, using empty cart')
      setCartItems([])
      setTotal(0)
      setError('Unable to reach server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = (items) => {
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity)
    }, 0)
    setTotal(totalAmount)
  }

  const removeFromCart = async (itemId) => {
    try {
      const token = getToken('user')
      const response = await fetch(`${API_BASE}/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchCartItems()
        // Refresh counts to update header badges
        refreshCounts()
      }
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      const token = getToken('user')
      const response = await fetch(`${API_BASE}/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (response.ok) {
        fetchCartItems()
        // Refresh counts to update header badges
        refreshCounts()
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  if (loading) {
    return (
      <main className="main-content">
        <div className="container">
          <div className="page-container">
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading cart...</div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="main-content">
        <div className="container">
          <div className="page-container">
            <div className="error-message" style={{ textAlign: 'center', padding: '2rem' }}>
              {error}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content">
      <div className="container">
        <div className="page-container">
          <h2 className="page-title">Shopping Cart</h2>

          {cartItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add items to your cart to see them here</p>
              <button onClick={() => navigate('/shop')} className="shop-now-btn">
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div 
                    key={item._id} 
                    className={`cart-item ${expandedItems[item._id] ? 'expanded' : 'collapsed'}`}
                    onClick={() => toggleExpanded(item._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="cart-item-image">
                      <img
                        className="cart-item-photo"
                        src={item.imageUrl || fallbackImageFor(item)}
                        alt={item.name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                    <div className="cart-item-details">
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="cart-item-price">₹{item.price}</div>
                        <span style={{ color: '#666', fontSize: '0.9rem' }}>× {item.quantity}</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#667eea' }}>
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    </div>
                    
                    {expandedItems[item._id] && (
                      <>
                        <div className="cart-item-quantity" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateQuantity(item._id, item.quantity - 1)
                            }}
                            className="quantity-btn"
                          >
                            -
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateQuantity(item._id, item.quantity + 1)
                            }}
                            className="quantity-btn"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromCart(item._id)
                          }}
                          className="remove-btn"
                        >
                          ✕
                        </button>
                      </>
                    )}
                    
                    {!expandedItems[item._id] && (
                      <div className="cart-item-summary">
                        <span className="quantity-badge">{item.quantity}x</span>
                        <span className="item-total">₹{item.price * item.quantity}</span>
                      </div>
                    )}

                    {expandedItems[item._id] && (
                      <div className="product-checkout-section" onClick={(e) => e.stopPropagation()}>
                        <div className="product-summary">
                          <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                          <div className="summary-row">
                            <span>Shipping:</span>
                            <span>₹50</span>
                          </div>
                          <div className="summary-row total-row">
                            <span>Total:</span>
                            <span>₹{(item.price * item.quantity) + 50}</span>
                          </div>
                        </div>
                        <button 
                          className="checkout-btn"
                          onClick={() => {
                            const checkoutData = {
                              items: [
                                {
                                  id: item.productId,
                                  productId: item.productId,
                                  name: item.name || item.productName || 'Product',
                                  description: item.description || '',
                                  price: item.price,
                                  quantity: item.quantity,
                                  icon: '🛒',
                                  category: item.category || 'General',
                                  image: item.imageUrl,
                                },
                              ],
                              total: (item.price * item.quantity),
                            }
                            sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData))
                            navigate('/checkout')
                          }}
                        >
                          Proceed to Checkout
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default Cart


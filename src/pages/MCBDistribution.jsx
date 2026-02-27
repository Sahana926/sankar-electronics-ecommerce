import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCounts } from '../context/CountsContext'
import { getToken } from '../utils/tokenManager'
import { toast } from 'react-toastify'

// MCB & Distribution page styled to match Lighting layout
function MCBDistribution() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { refreshCounts } = useCounts()
  const [loading, setLoading] = useState({})
  const [feedback, setFeedback] = useState({})
  const [cartItems, setCartItems] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])
  const [selectedSubcategories, setSelectedSubcategories] = useState([])
  const [openDropdown, setOpenDropdown] = useState(null)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

  const categoryData = {
    electronics: {
      name: 'Electronics',
      icon: '⚡',
      subcategories: [
        { label: 'Switches & Sockets', icon: '🔌' },
        { label: 'Wires & Cables', icon: '🧵' },
        { label: 'Lighting', icon: '💡' },
        { label: 'Fans', icon: '🌀' },
        { label: 'MCB & Distribution', icon: '⚡' },
        { label: 'Electrical Accessories', icon: '📦' }
      ]
    },
    hardware: {
      name: 'Hardware',
      icon: '🔩',
      subcategories: [
        { label: 'Fasteners', icon: '🔩' },
        { label: 'Hand Tools', icon: '🔧' },
        { label: 'Power Tools', icon: '⚡' },
        { label: 'Construction Hardware', icon: '🏗️' },
        { label: 'Plumbing Hardware', icon: '🚰' }
      ]
    }
  }

  const subcategories = [
    { id: 'mcb', label: 'MCB' },
    { id: 'dp-mcb', label: 'DP MCB' },
    { id: 'rccb', label: 'RCCB' },
    { id: 'db-box', label: 'DB Box' }
  ]

  const fallbackImageFor = (item) => {
    const title = (item.title || '').toLowerCase()
    const sub = (item.subcategory || '').toLowerCase()
    const sig = encodeURIComponent(item.id || title || 'product')

    let keyword = 'circuit breaker'
    if (sub.includes('dp') || title.includes('double')) keyword = 'double pole mcb'
    else if (sub.includes('rccb') || title.includes('rccb')) keyword = 'rccb breaker'
    else if (sub.includes('db') || title.includes('box')) keyword = 'distribution board box'
    return `https://source.unsplash.com/800x600/?${encodeURIComponent(keyword)}&sig=${sig}`
  }

  const sampleProducts = useMemo(() => [
    {
      id: 'mcb-1',
      icon: '⚡',
      title: 'Single Pole MCB 16A',
      description: 'Reliable protection for residential circuits',
      price: 140,
      subcategory: 'mcb',
      stock: 200,
      },
    {
      id: 'mcb-2',
      icon: '⚡',
      title: 'Double Pole MCB 32A',
      description: 'DP MCB for main line protection',
      price: 320,
      subcategory: 'dp-mcb',
      stock: 160,
      },
    {
      id: 'mcb-3',
      icon: '⚡',
      title: 'RCCB 40A 30mA',
      description: 'Residual current breaker for shock protection',
      price: 950,
      subcategory: 'rccb',
      stock: 110,
      },
    {
      id: 'mcb-4',
      icon: '🗃️',
      title: '8 Way DB Box',
      description: 'Double-door distribution board box',
      price: 520,
      subcategory: 'db-box',
      stock: 130,
      }
  ], [])

  // Products list: start with samples, then replace with backend category products
  const [products, setProducts] = useState([])

  useEffect(() => {
    setProducts(
      sampleProducts.map(item => ({
        ...item,
        imageUrl: item.imageUrl || fallbackImageFor(item),
      }))
    )
  }, [sampleProducts])

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const category = encodeURIComponent('MCB & Distribution')
        const res = await fetch(`${API_BASE}/api/products?category=${category}&limit=200`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load products')
        
        // Helper to determine subcategory from product data
        const determineSubcategory = (product) => {
          const name = (product.name || '').toLowerCase()
          const desc = (product.description || '').toLowerCase()
          const features = product.features || {}
          const featureText = Object.entries(features).map(([k, v]) => `${k} ${v}`).join(' ').toLowerCase()
          const allText = name + ' ' + desc + ' ' + featureText

          if (allText.includes('dp') || allText.includes('double pole')) return 'dp-mcb'
          if (allText.includes('rccb') || allText.includes('residual current')) return 'rccb'
          if (allText.includes('db') || allText.includes('distribution') || allText.includes('box')) return 'db-box'
          if (allText.includes('mcb') || allText.includes('circuit breaker')) return 'mcb'
          
          return 'mcb' // default to single pole MCB
        }
        
        const mapped = (data.data || []).map(p => {
          const subcategory = determineSubcategory(p)
          return {
            id: p._id,
            icon: '📦',
            title: p.name,
            description: p.description || '',
            price: p.price,
            subcategory,
            stock: p.stockQty ?? 0,
            imageUrl: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : fallbackImageFor({ id: p._id, title: p.name, subcategory }),
            productRaw: p,
          }
        })
        if (mapped.length > 0) setProducts(mapped)
      } catch (err) {
        console.warn('Category load failed:', err.message)
      }
    }
    loadCategory()
  }, [API_BASE])

  const isInCart = (productId) => cartItems.some(item => item.productId === productId)
  const isInWishlist = (productId) => wishlistItems.some(item => item.productId === productId)

  useEffect(() => {
    const loadCartAndWishlist = async () => {
      if (!isAuthenticated) return
      try {
        const token = getToken('user')
        const cartResponse = await fetch(`${API_BASE}/api/cart`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (cartResponse.ok) {
          const data = await cartResponse.json()
          setCartItems(data.items || [])
        }
        const wishlistResponse = await fetch(`${API_BASE}/api/wishlist`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (wishlistResponse.ok) {
          const data = await wishlistResponse.json()
          setWishlistItems(data.items || [])
        }
      } catch (error) {
        console.error('Error loading cart/wishlist:', error)
      }
    }
    loadCartAndWishlist()
  }, [isAuthenticated, API_BASE])

  const filteredProducts = useMemo(() => {
    if (selectedSubcategories.length === 0) return products
    return products.filter(p => selectedSubcategories.includes(p.subcategory))
  }, [products, selectedSubcategories])

  const toggleSubcategory = (subcatId) => {
    setSelectedSubcategories(prev =>
      prev.includes(subcatId)
        ? prev.filter(id => id !== subcatId)
        : [...prev, subcatId]
    )
  }

  const handleAddToCart = async (e, item) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/mcb-distribution' } })
      return
    }
    if (isInCart(item.id)) return
    setLoading(prev => ({ ...prev, [`cart-${item.id}`]: true }))
    setFeedback(prev => ({ ...prev, [`cart-${item.id}`]: 'Adding...' }))
    try {
      const token = getToken('user')
      const response = await fetch(`${API_BASE}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: item.id,
          name: item.title,
          description: item.description || '',
          price: item.price,
          quantity: 1,
          icon: item.icon || '📦',
          images: item.imageUrl ? [item.imageUrl] : [],
        }),
      })
      if (!response.ok) throw new Error('Failed to add to cart')
      setCartItems(prev => [...prev, {
        productId: item.id,
        name: item.title,
        price: item.price,
        quantity: 1,
        icon: item.icon || '📦',
      }])
      setFeedback(prev => ({ ...prev, [`cart-${item.id}`]: '✓ Added' }))
      toast.success('Added to cart!')
      if (refreshCounts) refreshCounts()
      setTimeout(() => setFeedback(prev => ({ ...prev, [`cart-${item.id}`]: '' })), 2000)
    } catch (error) {
      console.error('Error adding to cart:', error)
      setFeedback(prev => ({ ...prev, [`cart-${item.id}`]: 'Error' }))
      toast.error('Failed to add to cart')
    } finally {
      setLoading(prev => ({ ...prev, [`cart-${item.id}`]: false }))
    }
  }

  const handleWishlistClick = async (e, item) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/mcb-distribution' } })
      return
    }
    const wishlisted = isInWishlist(item.id)
    if (wishlisted) {
      await handleRemoveFromWishlist(e, item)
    } else {
      await handleAddToWishlist(e, item)
    }
  }

  const handleAddToWishlist = async (e, item) => {
    e.stopPropagation()
    setLoading(prev => ({ ...prev, [`wish-${item.id}`]: true }))
    try {
      const token = getToken('user')
      const response = await fetch(`${API_BASE}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: item.id,
          name: item.title,
          description: item.description || '',
          price: item.price,
          icon: item.icon || '❤️',
          images: item.imageUrl ? [item.imageUrl] : [],
        }),
      })
      if (!response.ok) throw new Error('Failed to add to wishlist')
      setWishlistItems(prev => [...prev, {
        productId: item.id,
        name: item.title,
        price: item.price,
        icon: item.icon || '❤️',
      }])
      toast.success('Added to wishlist!')
      if (refreshCounts) refreshCounts()
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      toast.error('Failed to add to wishlist')
    } finally {
      setLoading(prev => ({ ...prev, [`wish-${item.id}`]: false }))
    }
  }

  const handleRemoveFromWishlist = async (e, item) => {
    e.stopPropagation()
    setLoading(prev => ({ ...prev, [`wish-${item.id}`]: true }))
    try {
      const token = getToken('user')
      const wishlistItem = wishlistItems.find(wishItem => wishItem.productId === item.id)
      if (!wishlistItem) return
      const response = await fetch(`${API_BASE}/api/wishlist/${wishlistItem._id || wishlistItem.productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to remove from wishlist')
      setWishlistItems(prev => prev.filter(wishItem => wishItem.productId !== item.id))
      toast.success('Removed from wishlist')
      if (refreshCounts) await refreshCounts()
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error('Failed to remove from wishlist')
    } finally {
      setLoading(prev => ({ ...prev, [`wish-${item.id}`]: false }))
    }
  }

  return (
    <main className="main-content">
      <div className="container">
        <div className="category-navigation">
          <div className="category-cards">
            {Object.entries(categoryData).map(([key, data]) => (
              <div
                key={key}
                className="category-card"
                onMouseEnter={() => setOpenDropdown(key)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <div 
                  className="category-card-header"
                  onClick={() => navigate('/shop')}
                >
                  <div className="category-icon">{data.icon}</div>
                  <h3 className="category-name">{data.name}</h3>
                  <span className="dropdown-arrow">▼</span>
                </div>
                {openDropdown === key && (
                  <div className="category-dropdown">
                    {data.subcategories.map((subcat, idx) => (
                      <div
                        key={idx}
                        className="subcategory-item"
                        onClick={() => {
                          if (subcat.label === 'Switches & Sockets') navigate('/switches-sockets')
                          else if (subcat.label === 'Wires & Cables') navigate('/wires-cables')
                          else if (subcat.label === 'Lighting') navigate('/lighting')
                          else if (subcat.label === 'Fans') navigate('/fans')
                          else if (subcat.label === 'MCB & Distribution') navigate('/mcb-distribution')
                          else if (subcat.label === 'Electrical Accessories') navigate('/electrical-accessories')
                          else if (subcat.label === 'Fasteners') navigate('/fasteners')
                          else navigate('/shop')
                          setOpenDropdown(null)
                        }}
                      >
                        {subcat.icon && <span className="subcat-icon" style={{ marginRight: 8 }}>{subcat.icon}</span>}
                        <span className="subcat-label">{subcat.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="page-header">
          <h1>MCB & Distribution</h1>
          <p className="subtitle">Breakers, RCCB, DP MCB, and DB boxes</p>
        </div>

        <div className="category-page-layout">
          <aside className="filter-sidebar">
            <h3>Filter by Type</h3>
            <div className="filter-group">
              {subcategories.map(subcat => (
                <label key={subcat.id} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedSubcategories.includes(subcat.id)}
                    onChange={() => toggleSubcategory(subcat.id)}
                  />
                  <span className="filter-label">
                    {subcat.label}
                  </span>
                </label>
              ))}
            </div>
            {selectedSubcategories.length > 0 && (
              <button 
                className="clear-filters-btn"
                onClick={() => setSelectedSubcategories([])}
              >
                Clear All Filters
              </button>
            )}
          </aside>

          <section className="products-section">
            <div className="products-header">
              <h2>
                {selectedSubcategories.length === 0 
                  ? 'All Products' 
                  : `Filtered Products (${filteredProducts.length})`}
              </h2>
              <p className="product-count">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            <div className="products-grid">
              {filteredProducts.map(item => {
                const isInStock = item.stock > 0
                const imageUrl = item.imageUrl || fallbackImageFor(item)

                return (
                  <div 
                    key={item.id} 
                    className="product-card"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    <button
                      className={`wishlist-heart ${isInWishlist(item.id) ? 'active' : ''}`}
                      onClick={(e) => handleWishlistClick(e, item)}
                      disabled={loading[`wish-${item.id}`]}
                      title={isInWishlist(item.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      {isInWishlist(item.id) ? '❤️' : '🤍'}
                    </button>

                    <div className="product-image">
                      <img src={imageUrl} alt={item.title} className="product-photo" loading="lazy" />
                      <div className="product-icon">{item.icon}</div>
                      {!isInStock && (
                        <div className="out-of-stock-overlay">Out of Stock</div>
                      )}
                    </div>

                    <div className="product-info">
                      <h3 className="product-title">{item.title}</h3>
                      <p className="product-description">{item.description}</p>

                      <div className="product-price">
                        <span className="price">₹{item.price}</span>
                      </div>

                      <div className={`stock-status ${isInStock ? 'in-stock' : 'out-of-stock'}`}>
                        {isInStock ? `${item.stock} in stock` : 'Out of Stock'}
                      </div>

                      <button
                        className={`add-to-cart-btn ${isInCart(item.id) ? 'added' : ''} ${loading[`cart-${item.id}`] ? 'loading' : ''}`}
                        onClick={(e) => handleAddToCart(e, item)}
                        disabled={isInCart(item.id) || loading[`cart-${item.id}`] || !isInStock}
                      >
                        {feedback[`cart-${item.id}`] || (isInCart(item.id) ? '✓ Added to Cart' : '🛒 Add to Cart')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="no-products">
                <p>No products found matching your filters.</p>
                <button onClick={() => setSelectedSubcategories([])}>Clear Filters</button>
              </div>
            )}
          </section>
        </div>
      </div>

      <style jsx>{`
        .category-navigation {
          margin: 15px 0 25px 0;
          padding: 15px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 100;
        }

        .category-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 15px;
        }

        .category-card {
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 200;
        }

        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .category-card-header {
          display: flex;
          align-items: center;
          gap: 15px;
          color: white;
        }

        .category-icon {
          font-size: 36px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .category-name {
          flex: 1;
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .dropdown-arrow {
          font-size: 14px;
          transition: transform 0.3s ease;
        }

        .category-card:hover .dropdown-arrow {
          transform: rotate(180deg);
        }

        .category-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 10px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          z-index: 2000;
          overflow: hidden;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .subcategory-item {
          padding: 12px 20px;
          color: #333;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
        }

        .subcategory-item:last-child {
          border-bottom: none;
        }

        .subcategory-item:hover {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding-left: 30px;
        }

        .subcat-icon {
          display: inline-block;
        }

        .subcat-label {
          display: inline-block;
        }

        .page-header {
          text-align: center;
          margin-bottom: 2rem;
          padding: 2rem 0;
          border-bottom: 2px solid #f0f0f0;
        }

        .page-header h1 {
          font-size: 2.5rem;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          font-size: 1.1rem;
          color: #666;
        }

        .category-page-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        .filter-sidebar {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          height: fit-content;
          position: sticky;
          top: 20px;
        }

        .filter-sidebar h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.2rem;
          color: #333;
          border-bottom: 2px solid #007bff;
          padding-bottom: 0.5rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .filter-checkbox {
          display: flex;
          align-items: flex-start;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .filter-checkbox:hover {
          background: #f8f9fa;
        }

        .filter-checkbox input[type="checkbox"] {
          margin-right: 0.75rem;
          margin-top: 0.25rem;
          cursor: pointer;
          width: 18px;
          height: 18px;
        }

        .filter-label {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }

        .price-range {
          font-size: 0.85rem;
          color: #28a745;
          font-weight: 600;
        }

        .clear-filters-btn {
          margin-top: 1rem;
          width: 100%;
          padding: 0.75rem;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }

        .clear-filters-btn:hover {
          background: #c82333;
        }

        .products-section {
          min-width: 0;
        }

        .products-header {
          margin-bottom: 1.5rem;
        }

        .products-header h2 {
          font-size: 1.8rem;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .product-count {
          color: #666;
          font-size: 0.95rem;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .product-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
        }

        .product-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          transform: translateY(-4px);
        }

        .wishlist-heart {
          position: absolute;
          top: 8px;
          right: 8px;
          background: white;
          border: none;
          font-size: 24px;
          cursor: pointer;
          z-index: 10;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .wishlist-heart:hover {
          transform: scale(1.1);
        }

        .wishlist-heart.active {
          animation: heartPulse 0.5s ease;
        }

        @keyframes heartPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }

        .product-image {
          position: relative;
          height: 200px;
          background: #f5f5f5;
          border-radius: 12px;
          overflow: hidden;
        }

        .product-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .product-icon {
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 34px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          padding: 6px 10px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.12);
        }

        .discount-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #ff9900;
          color: white;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }

        .out-of-stock-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .product-info {
          padding: 1rem;
        }

        .product-title {
          font-size: 1rem;
          font-weight: 600;
          color: #212121;
          margin: 0 0 0.5rem 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-description {
          font-size: 0.85rem;
          color: #878787;
          margin: 0 0 0.75rem 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-price {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 0.5rem;
        }

        .price {
          font-size: 1.25rem;
          font-weight: bold;
          color: #26a541;
        }.stock-status {
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
          font-weight: 500;
        }

        .stock-status.in-stock {
          color: #388e3c;
        }

        .stock-status.out-of-stock {
          color: #d32f2f;
        }

        .add-to-cart-btn {
          width: 100%;
          padding: 0.75rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .add-to-cart-btn:hover {
          background: #0056b3;
        }

        .add-to-cart-btn.loading {
          opacity: 0.7;
          cursor: wait;
        }

        .add-to-cart-btn.added {
          background: #28a745;
        }

        .add-to-cart-btn.added:hover {
          background: #218838;
        }

        .add-to-cart-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .no-products {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .no-products p {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 1rem;
        }

        .no-products button {
          padding: 0.75rem 1.5rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .category-navigation {
            margin: 10px 0 20px 0;
            padding: 10px;
          }

          .category-cards {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .category-page-layout {
            grid-template-columns: 1fr;
          }

          .filter-sidebar {
            position: static;
          }

          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 1rem;
          }
        }
      `}</style>
    </main>
  )
}

export default MCBDistribution

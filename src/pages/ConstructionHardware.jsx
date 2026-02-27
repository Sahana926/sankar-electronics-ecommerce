import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCounts } from '../context/CountsContext'
import { getToken } from '../utils/tokenManager'
import { toast } from 'react-toastify'

/**
 * ConstructionHardware Component
 * 
 * Dedicated page for construction hardware with sidebar filtering by subcategory
 */
function ConstructionHardware() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { refreshCounts } = useCounts()
  const [loading, setLoading] = useState({})
  const [feedback, setFeedback] = useState({})
  const [cartItems, setCartItems] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])
  const [selectedSubcategories, setSelectedSubcategories] = useState([])
  const [openDropdown, setOpenDropdown] = useState(null)
  const [selectedVariants, setSelectedVariants] = useState({})
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

  // Category data for navigation
  const categoryData = {
    electronics: {
      name: 'Electronics',
      icon: '⚡',
      subcategories: [
        { label: 'Switches & Sockets', icon: '🔌' },
        { label: 'Wires & Cables', icon: '🧵' },
        { label: 'Lighting', icon: '💡' },
        { label: 'Fans', icon: '🌀' },
        { label: 'Electrical Accessories', icon: '📦' }
      ]
    },
    hardware: {
      name: 'Hardware',
      icon: '🛠️',
      subcategories: [
        { label: 'Fasteners', icon: '🔩' },
        { label: 'Hand Tools', icon: '🧰' },
        { label: 'Power Tools', icon: '🪚' },
        { label: 'Construction Hardware', icon: '🏗️' },
        { label: 'Plumbing Hardware', icon: '🚰' }
      ]
    }
  }

  // Subcategories for this page
  const subcategories = [
    { id: 'anchors', label: 'Anchors', priceRange: 'Price varies' },
    { id: 'hinges', label: 'Hinges', priceRange: 'Price varies' },
    { id: 'brackets', label: 'Brackets', priceRange: 'Price varies' },
    { id: 'handles', label: 'Handles', priceRange: 'Price varies' }
  ]

  const fallbackImageFor = (item) => {
    const title = (item.title || '').toLowerCase()
    const sub = (item.subcategory || '').toLowerCase()
    const sig = encodeURIComponent(item.id || title || 'product')

    let keyword = 'construction hardware'
    if (sub.includes('anchor') || title.includes('anchor')) keyword = 'wall anchors, hardware'
    else if (sub.includes('hinge') || title.includes('hinge')) keyword = 'hinges, hardware'
    else if (sub.includes('bracket') || title.includes('bracket')) keyword = 'brackets, hardware'
    else if (sub.includes('handle') || title.includes('handle')) keyword = 'handles, hardware'
    return `https://source.unsplash.com/800x600/?${encodeURIComponent(keyword)}&sig=${sig}`
  }

  // Products list: load from backend
  const [products, setProducts] = useState([])

  useEffect(() => {
    // Load products from backend for this category
    const loadCategory = async () => {
      try {
        const category = encodeURIComponent('Construction Hardware')
        const res = await fetch(`${API_BASE}/api/products?category=${category}&limit=200`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load products')
        
        // Helper function to determine subcategory from product name/features (fallback)
        const determineSubcategory = (product) => {
          if (product.subcategory) {
            return product.subcategory
          }
          
          const name = (product.name || '').toLowerCase()
          const desc = (product.description || '').toLowerCase()
          const text = name + ' ' + desc
          
          const features = product.features
          const featureText = Array.isArray(features)
            ? features.map(f => `${f?.name || ''} ${f?.value || ''}`).join(' ')
            : Object.entries(features || {}).map(([k, v]) => `${k} ${v}`).join(' ')
          const normalizedFeatureText = featureText.toLowerCase()
          const allText = text + ' ' + normalizedFeatureText

          if (allText.includes('handle')) return 'handles'
          if (allText.includes('bracket')) return 'brackets'
          if (allText.includes('hinge')) return 'hinges'
          if (allText.includes('anchor')) return 'anchors'

          return 'anchors'
        }
        
        const mapped = (data.data || []).map(p => ({
          id: p._id,
          icon: '🏗️',
          title: p.name,
          description: p.description || '',
          price: p.price,
          subcategory: determineSubcategory(p),
          stock: p.stockQty ?? 0,
          imageUrl: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : fallbackImageFor({ id: p._id, title: p.name, subcategory: p.subcategory || '' }),
          colorVariants: p.colorVariants || [],
          productRaw: p,
        }))
        setProducts(mapped)
      } catch (err) {
        console.warn('Category load failed:', err.message)
      }
    }
    loadCategory()
  }, [API_BASE])

  // Check if item is in cart
  const isInCart = (productId) => cartItems.some(item => item.productId === productId)
  
  // Check if item is in wishlist
  const isInWishlist = (productId) => wishlistItems.some(item => item.productId === productId)

  // Load cart and wishlist items on component mount
  useEffect(() => {
    const loadCartAndWishlist = async () => {
      if (!isAuthenticated) return
      
      try {
        const token = getToken('user')
        
        // Load cart items
        const cartResponse = await fetch(`${API_BASE}/api/cart`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (cartResponse.ok) {
          const data = await cartResponse.json()
          setCartItems(data.items || [])
        }
        
        // Load wishlist items
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

  // Filter products by selected subcategories
  const filteredProducts = useMemo(() => {
    if (selectedSubcategories.length === 0) {
      return products
    }
    return products.filter(p => selectedSubcategories.includes(p.subcategory))
  }, [products, selectedSubcategories])

  // Toggle subcategory filter
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
      navigate('/login', { state: { from: '/construction-hardware' } })
      return
    }

    let productKey = item.id
    let priceToUse = item.price
    let nameToUse = item.title
    let iconToUse = item.icon || '🏗️'
    const variants = Array.isArray(item.colorVariants) && item.colorVariants.length > 0
      ? item.colorVariants.map(cv => ({
          id: cv.colorName || cv.id,
          label: cv.colorName || cv.label,
          price: cv.price
        }))
      : (Array.isArray(item.variants) && item.variants.length > 0 ? item.variants : [])
    if (variants.length > 0) {
      const idx = selectedVariants[item.id] ?? 0
      const v = variants[idx] || variants[0]
      productKey = `${item.id}-${v.id}`
      priceToUse = v.price
      nameToUse = `${item.title} - ${v.label}`
    }

    if (isInCart(productKey)) return

    setLoading((prev) => ({ ...prev, [`cart-${item.id}`]: true }))
    setFeedback((prev) => ({ ...prev, [`cart-${item.id}`]: 'Adding...' }))

    try {
      const token = getToken('user')
      const response = await fetch(`${API_BASE}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productKey,
          name: nameToUse,
          description: item.description || '',
          price: priceToUse,
          quantity: 1,
          icon: iconToUse,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to cart')
      }

      setCartItems(prev => [...prev, {
        productId: productKey,
        name: nameToUse,
        price: priceToUse,
        quantity: 1,
        icon: iconToUse,
      }])
      
      setFeedback((prev) => ({ ...prev, [`cart-${item.id}`]: '✓ Added' }))
      toast.success('Added to cart!')
      
      if (refreshCounts) {
        refreshCounts()
      }
      
      setTimeout(() => {
        setFeedback((prev) => ({ ...prev, [`cart-${item.id}`]: '' }))
      }, 2000)
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      setFeedback((prev) => ({ ...prev, [`cart-${item.id}`]: 'Error' }))
      toast.error('Failed to add to cart')
    } finally {
      setLoading((prev) => ({ ...prev, [`cart-${item.id}`]: false }))
    }
  }

  const handleWishlistClick = async (e, item) => {
    e.stopPropagation()
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/construction-hardware' } })
      return
    }
    
    let productKey = item.id
    let nameToUse = item.title
    let iconToUse = item.icon || '❤️'
    let priceToUse = item.price
    const variants = Array.isArray(item.colorVariants) && item.colorVariants.length > 0
      ? item.colorVariants.map(cv => ({
          id: cv.colorName || cv.id,
          label: cv.colorName || cv.label,
          price: cv.price
        }))
      : (Array.isArray(item.variants) && item.variants.length > 0 ? item.variants : [])
    if (variants.length > 0) {
      const idx = selectedVariants[item.id] ?? 0
      const v = variants[idx] || variants[0]
      productKey = `${item.id}-${v.id}`
      nameToUse = `${item.title} - ${v.label}`
      priceToUse = v.price
    }

    const isWishlisted = isInWishlist(productKey)
    
    if (isWishlisted) {
      await handleRemoveFromWishlist(e, item, productKey)
    } else {
      await handleAddToWishlist(e, item, productKey, nameToUse, iconToUse, priceToUse)
    }
  }
  
  const handleAddToWishlist = async (e, item, productKey, nameToUse, iconToUse, priceToUse) => {
    e.stopPropagation()
    
    setLoading((prev) => ({ ...prev, [`wish-${item.id}`]: true }))

    try {
      const token = getToken('user')
      const response = await fetch(`${API_BASE}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productKey,
          name: nameToUse,
          description: item.description || '',
          price: priceToUse,
          icon: iconToUse,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to wishlist')
      }

      setWishlistItems(prev => [...prev, {
        productId: productKey,
        name: nameToUse,
        price: priceToUse,
        icon: iconToUse,
      }])
      
      toast.success('Added to wishlist!')
      
      if (refreshCounts) {
        refreshCounts()
      }
      
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      toast.error('Failed to add to wishlist')
    } finally {
      setLoading((prev) => ({ ...prev, [`wish-${item.id}`]: false }))
    }
  }
  
  const handleRemoveFromWishlist = async (e, item, productKeyOverride) => {
    e.stopPropagation()
    
    setLoading((prev) => ({ ...prev, [`wish-${item.id}`]: true }))
    
    try {
      const token = getToken('user')
      const key = productKeyOverride || item.id
      const wishlistItem = wishlistItems.find(wishItem => wishItem.productId === key)
      if (!wishlistItem) return
      
      const response = await fetch(`${API_BASE}/api/wishlist/${wishlistItem._id || wishlistItem.productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('Failed to remove from wishlist')
      }
      
      setWishlistItems(prev => prev.filter(wishItem => wishItem.productId !== key))
      toast.success('Removed from wishlist')
      
      if (refreshCounts) {
        await refreshCounts()
      }
      
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error('Failed to remove from wishlist')
    } finally {
      setLoading((prev) => ({ ...prev, [`wish-${item.id}`]: false }))
    }
  }

  return (
    <main className="main-content">
      <div className="container">
        {/* Category Navigation Section */}
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
                  onClick={() => {
                    if (key === 'electronics') {
                      navigate('/shop')
                    } else {
                      navigate('/shop')
                    }
                  }}
                >
                  <div className="category-icon">{data.icon}</div>
                  <h3 className="category-name">{data.name}</h3>
                  <span className="dropdown-arrow">▼</span>
                </div>
                
                {openDropdown === key && (
                  <div className="category-dropdown">
                    {data.subcategories.map((subcat, idx) => {
                      const label = typeof subcat === 'string' ? subcat : subcat.label
                      const icon = typeof subcat === 'string' ? '' : (subcat.icon || '')
                      return (
                        <div
                          key={idx}
                          className="subcategory-item"
                          onClick={() => {
                            if (label === 'Switches & Sockets') {
                              navigate('/switches-sockets')
                            } else if (label === 'Wires & Cables') {
                              navigate('/wires-cables')
                            } else if (label === 'Lighting') {
                              navigate('/lighting')
                            } else if (label === 'Fasteners') {
                              navigate('/fasteners')
                            } else if (label === 'Hand Tools') {
                              navigate('/hand-tools')
                            } else if (label === 'Power Tools') {
                              navigate('/power-tools')
                            } else if (label === 'Construction Hardware') {
                              navigate('/construction-hardware')
                            } else {
                              navigate('/shop')
                            }
                            setOpenDropdown(null)
                          }}
                        >
                          {icon && <span className="subcat-icon" style={{ marginRight: 8 }}>{icon}</span>}
                          <span className="subcat-label">{label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="page-header">
          <h1>Construction Hardware</h1>
          <p className="subtitle">Anchors, hinges, brackets, and handles for construction projects</p>
        </div>

        <div className="category-page-layout">
          {/* Sidebar with subcategory filters */}
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
                    <span className="price-range">{subcat.priceRange}</span>
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

          {/* Products grid */}
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
                const variants = Array.isArray(item.colorVariants) && item.colorVariants.length > 0
                  ? item.colorVariants.map(cv => ({
                      id: cv.colorName || cv.id,
                      label: cv.colorName || cv.label,
                      price: cv.price,
                      swatch: cv.colorCode || '#ccc'
                    }))
                  : (Array.isArray(item.variants) && item.variants.length > 0 ? item.variants : [])
                
                const selectedIdx = selectedVariants[item.id] ?? 0
                const hasVariants = variants.length > 0
                const currentVariant = hasVariants ? variants[selectedIdx] : null
                const priceToUse = hasVariants ? (currentVariant?.price ?? item.price ?? 0) : (item.price ?? 0)
                const isInStock = item.stock > 0
                const productKey = hasVariants ? `${item.id}-${currentVariant.id}` : item.id
                const inCart = isInCart(productKey)
                const inWishlist = isInWishlist(productKey)
                const variantImage = (hasVariants && item.variantImages && currentVariant) ? item.variantImages[currentVariant.id] : null
                const variantImageUrl = (hasVariants && currentVariant && currentVariant.imageUrl) ? currentVariant.imageUrl : null
                const imageUrl = variantImageUrl || variantImage || item.imageUrl || fallbackImageFor(item)

                return (
                  <div 
                    key={item.id} 
                    className="product-card"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    {/* Wishlist Heart Button */}
                    <button
                      className={`wishlist-heart ${inWishlist ? 'active' : ''}`}
                      onClick={(e) => handleWishlistClick(e, item)}
                      disabled={loading[`wish-${item.id}`]}
                      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      {inWishlist ? '❤️' : '🤍'}
                    </button>

                    {/* Product Image */}
                    <div className="product-image">
                      <img src={imageUrl} alt={item.title} className="product-photo" loading="lazy" />
                      <div className="product-icon-overlay">{item.icon}</div>
                      {!isInStock && (
                        <div className="out-of-stock-overlay">Out of Stock</div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="product-info">
                      <h3 className="product-title">{item.title}</h3>
                      <p className="product-description">{item.description}</p>

                      {/* Price */}
                      <div className="product-price">
                        <span className="price">₹{priceToUse}</span>
                      </div>

                      {/* Stock Status */}
                      <div className={`stock-status ${isInStock ? 'in-stock' : 'out-of-stock'}`}>
                        {isInStock ? `${item.stock} in stock` : 'Out of Stock'}
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        className={`add-to-cart-btn ${inCart ? 'added' : ''} ${loading[`cart-${item.id}`] ? 'loading' : ''}`}
                        onClick={(e) => handleAddToCart(e, item)}
                        disabled={inCart || loading[`cart-${item.id}`] || !isInStock}
                      >
                        {feedback[`cart-${item.id}`] || (inCart ? '✓ Added to Cart' : '🛒 Add to Cart')}
                      </button>
                    </div>
                  </div>
                )
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

        .product-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.2s ease;
        }

        .product-card:hover .product-photo {
          transform: scale(1.03);
        }

        .product-icon-overlay {
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 26px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          padding: 6px 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
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
          background: linear-gradient(135deg, #f5f5f5 0%, #e9e9e9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
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
        }

        .stock-status {
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

export default ConstructionHardware

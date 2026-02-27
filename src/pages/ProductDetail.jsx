import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getToken } from '../utils/tokenManager'
import { useCounts } from '../context/CountsContext'

function ProductDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const { refreshCounts } = useCounts()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedColorIndex, setSelectedColorIndex] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedFeatures, setSelectedFeatures] = useState({})
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

  const fallbackImageFor = (item) => {
    const name = (item?.name || '').toLowerCase()
    const category = (item?.category || '').toLowerCase()
    let keyword = 'electrical products'
    if (name.includes('switch') || category.includes('switch')) keyword = 'light switch, electrical switch'
    else if (name.includes('light') || category.includes('light')) keyword = 'led light bulb, lighting'
    else if (name.includes('fan') || category.includes('fan')) keyword = 'ceiling fan, table fan'
    else if (name.includes('wire') || category.includes('cable')) keyword = 'electrical cable, wires'
    else if (name.includes('mcb') || category.includes('distribution')) keyword = 'circuit breaker, mcb'
    else if (category.includes('tools')) keyword = 'hand tools, toolkit'
    return `https://source.unsplash.com/1000x750/?${encodeURIComponent(keyword)}&sig=${encodeURIComponent(item?.id || name || 'product')}`
  }

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load product')
        // Normalize colorVariants (can come as array or object) and features (Map/object/array)
        const normalizeVariants = (cv) => {
          if (!cv) return []
          if (Array.isArray(cv)) return cv
          if (cv && typeof cv === 'object') return Object.values(cv)
          return []
        }

        const normalizeFeatures = (f) => {
          if (!f) return []
          if (typeof f !== 'object') return []
          
          // If it's an array
          if (Array.isArray(f)) {
            if (f.length === 0) return []
            
            // Array of { name, value } objects
            if (typeof f[0] === 'object' && 'name' in f[0] && 'value' in f[0]) {
              return f
            }
            
            // Array of [key, value] pairs
            if (Array.isArray(f[0]) && f[0].length >= 2) {
              return f.map(item => ({ name: item[0], value: item[1] }))
            }
            
            return []
          }
          
          // Plain object (most common from Mongoose Map) - return as-is
          return Object.entries(f).map(([name, value]) => ({ name, value }))
        }

        const colorVariants = normalizeVariants(data.colorVariants)
        const features = normalizeFeatures(data.features)

        console.log('Product loaded:', {
          name: data.name,
          colorVariants: data.colorVariants,
          normalizedColorVariants: colorVariants,
          features: data.features,
          normalizedFeatures: features,
        })

        setProduct({
          id: data._id,
          name: data.name,
          description: data.description || 'Product details coming soon.',
          category: data.category,
          price: data.price,
          discountPrice: data.discountPrice,
          stockQty: data.stockQty,
          images: data.images || [],
          colorVariants,
          features,
          status: data.status,
        })
        // Auto-select the first color to reveal thumbnails immediately
        if (colorVariants && colorVariants.length > 0) {
          setSelectedColorIndex(0)
          setSelectedImageIndex(0)
        } else {
          setSelectedColorIndex(null)
          setSelectedImageIndex(0)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [API_BASE, id])

  const priceToUse = (() => {
    if (!product) return 0
    
    // Priority 1: Selected feature value price
    const featurePrice = Object.values(selectedFeatures).find(f => f.price > 0)?.price
    if (featurePrice) return featurePrice
    
    // Priority 2: Color variant price
    if (selectedColorIndex !== null && product.colorVariants && product.colorVariants[selectedColorIndex]) {
      const variant = product.colorVariants[selectedColorIndex]
      if (variant.price && variant.price > 0) return variant.price
    }
    
    // Priority 3: Base product price
    return product.price || 0
  })()
  
  const inStock = product && product.stockQty > 0 && product.status === 'active'
  const heroImage = (() => {
    if (!product) return fallbackImageFor(product)
    if (
      selectedColorIndex !== null &&
      Array.isArray(product.colorVariants) &&
      product.colorVariants[selectedColorIndex] &&
      Array.isArray(product.colorVariants[selectedColorIndex].images) &&
      product.colorVariants[selectedColorIndex].images.length > 0
    ) {
      const imgs = product.colorVariants[selectedColorIndex].images
      return imgs[selectedImageIndex] || imgs[0]
    }
    return product.images?.[0] || fallbackImageFor(product)
  })()

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!product || !inStock) return

    setLoading(true)
    setFeedback('Preparing checkout...')

    const checkoutData = {
      items: [
        {
          id: product.id, // keep for UI
          productId: product.id, // required by backend order creation
          name: product.name,
          price: priceToUse,
          quantity,
          icon: '🛒',
          category: product.category,
          image: heroImage,
        },
      ],
      total: priceToUse * quantity,
    }

    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData))
    setFeedback('✓ Redirecting to checkout...')
    setTimeout(() => {
      navigate('/checkout')
      setLoading(false)
    }, 500)
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!product || !inStock) return

    setLoading(true)
    setFeedback('Adding to cart...')

    try {
      const token = getToken('user')
      const response = await fetch(`${API_BASE}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          name: product.name,
          description: product.description,
          price: priceToUse,
          quantity,
          imageUrl: heroImage,
          icon: '🛒',
        }),
      })

      if (response.ok) {
        setFeedback('✓ Added to cart!')
        refreshCounts()
      } else {
        const data = await response.json()
        setFeedback(data.message || 'Failed to add to cart')
      }
    } catch (err) {
      console.error('Error adding to cart:', err)
      setFeedback('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (value) => {
    if (!product) return
    const parsed = parseInt(value, 10)
    const safeValue = Math.max(1, Math.min(product.stockQty || 1, Number.isNaN(parsed) ? 1 : parsed))
    setQuantity(safeValue)
  }

  if (loading) {
    return (
      <main className="main-content">
        <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Loading product...</p>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="main-content">
        <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <h2>{error || 'Product not found'}</h2>
          <button
            onClick={() => navigate('/shop')}
            className="shop-btn-primary"
            style={{ marginTop: '20px' }}
          >
            Back to Shop
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content">
      <div className="container">
        <button
          onClick={() => navigate('/shop')}
          style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc', background: '#f5f5f5' }}
        >
          ← Back to Shop
        </button>

        <div className="product-detail">
          <div className="product-image-section">
            <div className="product-image-container">
              <img src={heroImage} alt={product.name} className="product-hero-image" loading="lazy" />
              <div className="product-icon-chip">🛠️</div>
            </div>
            {selectedColorIndex !== null && product?.colorVariants?.[selectedColorIndex]?.images?.length > 0 && (
              <div className="variant-thumbs">
                {product.colorVariants[selectedColorIndex].images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumb-btn ${selectedImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <img src={img} alt={`variant ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info-section">
            <h1 className="product-title">{product.name}</h1>

            <div className="product-info-chips">
              {inStock ? <span className="in-stock">✓ In Stock</span> : <span className="out-of-stock">Out of Stock</span>}
              {product.category && <span className="category-chip">{product.category}</span>}
            </div>

            <div className="price-section">
              <span className="price">₹{priceToUse?.toLocaleString()}</span>
              <span className="tax-inclusive">(inclusive of all taxes)</span>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {/* Wattage Selector */}
            {product.colorVariants && product.colorVariants.some(v => v.wattage) && (
              <div className="variant-selector">
                <h3>Watt</h3>
                <div className="variant-options">
                  {[...new Set(product.colorVariants.filter(v => v.wattage).map(v => v.wattage))].map((watt) => {
                    const variantWithWatt = product.colorVariants.find(v => v.wattage === watt);
                    const isSelected = selectedColorIndex !== null && product.colorVariants[selectedColorIndex]?.wattage === watt;
                    return (
                      <button
                        key={watt}
                        className={`variant-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          const idx = product.colorVariants.findIndex(v => v.wattage === watt);
                          if (idx !== -1) { setSelectedColorIndex(idx); setSelectedImageIndex(0); }
                        }}
                      >
                        {watt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colorVariants && product.colorVariants.length > 0 && (
              <div className="variant-selector">
                <h3>Color</h3>
                <div className="variant-options">
                  {product.colorVariants.map((v, idx) => (
                    <button
                      key={`${v.colorName}-${idx}`}
                      className={`variant-option ${selectedColorIndex === idx ? 'selected' : ''}`}
                      title={v.colorName}
                      onClick={() => { setSelectedColorIndex(idx); setSelectedImageIndex(0); }}
                    >
                      {v.colorName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Extra Features Section */}
            {product.features && product.features.length > 0 && (
              <div className="product-features">
                <h3>Specifications</h3>
                <div className="features-list">
                  {Object.entries(product.features.reduce((acc, feature) => {
                    const key = feature.name || 'Feature'
                    if (!acc[key]) acc[key] = []
                    acc[key].push(feature)
                    return acc
                  }, {})).map(([featureName, values]) => {
                    const hasMultipleValues = values.length > 1
                    const hasPricing = values.some(v => v.price > 0)
                    
                    return (
                      <div key={featureName} className="feature-group">
                        <h4 className="feature-name">{featureName.toUpperCase()}:</h4>
                        {hasMultipleValues && hasPricing ? (
                          <div className="variant-options">
                            {values.map((v, idx) => {
                              const isSelected = selectedFeatures[featureName]?.value === v.value
                              return (
                                <button
                                  key={`${featureName}-${idx}`}
                                  className={`variant-option ${isSelected ? 'selected' : ''}`}
                                  onClick={() => setSelectedFeatures(prev => ({
                                    ...prev,
                                    [featureName]: v
                                  }))}
                                >
                                  {v.value}
                                  {v.price > 0 && (
                                    <span className="variant-price"> (₹{v.price})</span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="feature-value-static">
                            {values.map((v, idx) => (
                              <span key={`${featureName}-${idx}`}>
                                {v.value || '—'}
                                {v.price > 0 && ` (₹${v.price})`}
                                {idx < values.length - 1 ? ' • ' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="quantity-selector">
              <label>Quantity:</label>
              <input
                type="number"
                min="1"
                max={product.stockQty || 1}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
              />
              <span className="stock-info">{product.stockQty} in stock</span>
            </div>

            <div className="product-actions">
              <button
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={loading || !inStock}
              >
                {loading ? 'Processing...' : '🛒 BUY NOW'}
              </button>
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={loading || !inStock}
              >
                {loading ? 'Processing...' : '+ ADD TO CART'}
              </button>
            </div>

            {feedback && <div className="feedback-message">{feedback}</div>}
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-detail {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          padding: 40px 0;
          margin-top: 20px;
        }

        .product-image-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          position: relative;
        }

        .product-image-container {
          background: linear-gradient(135deg, #f5f5f5 0%, #e9e9e9 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }

        .variant-thumbs {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        .thumb-btn {
          width: 56px;
          height: 56px;
          padding: 0;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          overflow: hidden;
        }
        .thumb-btn.active { border-color: #2874f0; }
        .thumb-btn img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .product-hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .product-icon-chip {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.92);
          border-radius: 12px;
          padding: 8px 10px;
          font-size: 28px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .product-info-section {
          padding: 20px;
        }

        .product-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #1a1a1a;
        }

        .product-info-chips {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .in-stock {
          background: #28a745;
          color: white;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 12px;
        }

        .out-of-stock {
          background: #dc3545;
          color: white;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 12px;
        }

        .category-chip {
          background: #eaf2ff;
          color: #1d56d4;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
        }

        .price-section {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }

        .price {
          font-size: 32px;
          font-weight: bold;
          color: #26a541;
        }

        .tax-inclusive {
          font-size: 13px;
          color: #26a541;
          font-weight: 500;
        }

        .product-description {
          margin-bottom: 25px;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .product-description h3 {
          font-size: 16px;
          margin-bottom: 10px;
          color: #1a1a1a;
        }

        .product-description p {
          color: #333;
          line-height: 1.6;
        }

        .variant-selector { 
          margin-bottom: 25px;
          padding: 18px;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }
        .variant-selector h3 { 
          font-size: 13px; 
          margin-bottom: 12px; 
          color: #495057;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .variant-options { 
          display: flex; 
          gap: 10px; 
          flex-wrap: wrap; 
        }
        .variant-option {
          padding: 12px 24px;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          color: #495057;
          transition: all 0.3s ease;
          min-width: 80px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .variant-option:hover { 
          border-color: #2874f0;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(40, 116, 240, 0.15);
        }
        .variant-option.selected { 
          background: linear-gradient(135deg, #2874f0 0%, #1e5bc6 100%);
          border-color: #2874f0; 
          color: white; 
          box-shadow: 0 4px 12px rgba(40, 116, 240, 0.3);
          transform: translateY(-2px);
        }

        .product-features {
          margin-bottom: 25px;
          padding: 20px;
          background: linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%);
          border-radius: 12px;
          border: 2px solid #ffb74d;
          box-shadow: 0 3px 10px rgba(255, 183, 77, 0.15);
        }

        .product-features h3 {
          font-size: 17px;
          margin-bottom: 16px;
          color: #f57c00;
          font-weight: 700;
          text-transform: capitalize;
          letter-spacing: 0.5px;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .feature-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .feature-name {
          font-size: 13px;
          color: #f57c00;
          font-weight: 700;
          margin: 0;
          letter-spacing: 0.8px;
        }

        .feature-value-static {
          font-size: 15px;
          color: #212121;
          font-weight: 600;
          padding: 10px 14px;
          background: white;
          border-radius: 8px;
          border: 1px solid #ffe0b2;
        }

        .variant-price {
          font-size: 13px;
          font-weight: 500;
          opacity: 0.9;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .feature-item {
          display: flex;
          flex-direction: column;
          padding: 14px;
          background: white;
          border-radius: 8px;
          border: 1px solid #ffe0b2;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }

        .feature-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(245, 124, 0, 0.15);
        }

        .feature-label {
          font-size: 11px;
          color: #f57c00;
          font-weight: 700;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .feature-value {
          font-size: 15px;
          color: #212121;
          font-weight: 600;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 25px;
        }

        .quantity-selector label {
          font-weight: bold;
        }

        .quantity-selector input {
          width: 60px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .stock-info {
          color: #666;
          font-size: 14px;
        }

        .product-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }

        .buy-now-btn {
          background: #ff9900;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 4px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
        }

        .buy-now-btn:hover:not(:disabled) {
          background: #ff7700;
        }

        .buy-now-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .add-to-cart-btn {
          background: #2874f0;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 4px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
        }

        .add-to-cart-btn:hover:not(:disabled) {
          background: #1d56d4;
        }

        .add-to-cart-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .feedback-message {
          padding: 12px;
          background: #d4edda;
          color: #155724;
          border-radius: 4px;
          margin-bottom: 15px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .product-detail {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .product-title {
            font-size: 20px;
          }

          .price {
            font-size: 24px;
          }

          .product-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  )
}

export default ProductDetail

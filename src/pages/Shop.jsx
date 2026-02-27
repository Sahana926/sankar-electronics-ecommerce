import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCounts } from '../context/CountsContext'
import { clearAllAuth, getToken } from '../utils/tokenManager'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

/**
 * Shop Component - Flipkart Style
 * 
 * Modern e-commerce shop page with:
 * - Product grid with images and details
 * - Clickable products to view details
 * - Add to cart with visual feedback
 * - Add to wishlist with heart animation
 * - Category filters
 * - Real-time count updates
 */
function Shop() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { refreshCounts } = useCounts()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  
  const [shopItems, setShopItems] = useState([])
  const [productsError, setProductsError] = useState('')
  const [productsLoading, setProductsLoading] = useState(true)
  
  // Filter and UI state
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [openDropdown, setOpenDropdown] = useState(null)
  
  // Cart and Wishlist state
  const [cartItems, setCartItems] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState({})
  const [feedback, setFeedback] = useState({})
  const [selectedVariants, setSelectedVariants] = useState({})
  
  // Helper functions
  const isInCart = (productId) => {
    return cartItems.some(item => item.productId === productId)
  }
  
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId)
  }
  
  const fallbackImageFor = (item) => {
    // Generate a simple placeholder with product name
    const name = (item?.title || item?.name || 'Product').substring(0, 30)
    const category = (item?.category || item?.subcategory || '').toLowerCase()
    
    // Use unsplash for better images based on category
    let keyword = 'electrical products'
    if (category.includes('switch') || category.includes('socket')) keyword = 'light switch electrical'
    else if (category.includes('wire') || category.includes('cable')) keyword = 'electrical cable wire'
    else if (category.includes('light')) keyword = 'led light bulb'
    else if (category.includes('fan')) keyword = 'ceiling fan'
    else if (category.includes('mcb') || category.includes('distribution')) keyword = 'circuit breaker'
    else if (category.includes('accessories')) keyword = 'electrical tools'
    
    return `https://source.unsplash.com/400x300/?${encodeURIComponent(keyword)}&sig=${encodeURIComponent(name)}`
  }
  
  const handleAuthFailure = (message = 'Session expired. Please login again.') => {
    clearAllAuth()
    if (typeof logout === 'function') {
      logout()
    }
    setFeedback((prev) => ({ ...prev, global: message }))
    navigate('/login', { state: { from: location.pathname } })
  }

  // Fetch cart and wishlist on mount
  useEffect(() => {
    const fetchCartAndWishlist = async () => {
      if (!isAuthenticated) return
      
      try {
        const token = getToken('user')
        if (!token) {
          handleAuthFailure('Session expired. Please login again.')
          return
        }
        
        // Fetch cart
        const cartRes = await fetch(`${API_BASE}/api/cart`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (cartRes.status === 401) {
          const cartErr = await cartRes.json().catch(() => ({}))
          handleAuthFailure(cartErr.message || 'Session expired. Please login again.')
          return
        }
        if (cartRes.ok) {
          const cartData = await cartRes.json()
          setCartItems(cartData.items || cartData.data || [])
        }
        
        // Fetch wishlist
        const wishlistRes = await fetch(`${API_BASE}/api/wishlist`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (wishlistRes.status === 401) {
          const wishErr = await wishlistRes.json().catch(() => ({}))
          handleAuthFailure(wishErr.message || 'Session expired. Please login again.')
          return
        }
        if (wishlistRes.ok) {
          const wishlistData = await wishlistRes.json()
          setWishlistItems(wishlistData.items || wishlistData.data || [])
        }
      } catch (error) {
        console.error('Error fetching cart/wishlist:', error)
      }
    }
    
    fetchCartAndWishlist()
  }, [isAuthenticated])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true)
        // Fetch all products by setting a high limit
        const res = await fetch(`${API_BASE}/api/products?limit=200`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load products')
        const mapped = (data.data || []).map(p => {
          // Map backend category to frontend structure
          // Determine if product is electronics or hardware based on category
          const backendCategory = p.category || ''
          const hardwareCategories = ['Fasteners', 'Hand Tools', 'Power Tools', 'Construction Hardware', 'Plumbing Hardware']
          const category = hardwareCategories.includes(backendCategory) ? 'hardware' : 'electronics'
          const subcategory = backendCategory // Use backend category as subcategory
          
          return {
            id: p._id,
            title: p.name,
            description: p.description || '',
            price: p.price,
            category: category,
            subcategory: subcategory,
            stock: p.stockQty ?? 0,
            status: p.status,
            icon: '📦',
            imageUrl: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '',
            productRaw: p,
          }
        })
        setShopItems(mapped)
      } catch (err) {
        console.error('Failed to fetch products', err)
        setProductsError(err.message)
      } finally {
        setProductsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Handle search query from URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search')
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl)
    }
  }, [searchParams])

  const sampleProducts = [
    {
      id: 'sock-verona-6a-3pin-isi',
      icon: '⚡',
      title: '6 A 3 Pin Shuttered Socket ISI (Verona Series)',
      description: 'Verona 6A shuttered socket ISI',
      price: 193,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 190,
      },
    {
      id: 'sock-verona-6a16a-isi',
      icon: '⚡',
      title: '6 A/16 A 3 Pin Shuttered Socket ISI (Verona Series)',
      description: 'Verona 6/16A shuttered socket ISI',
      price: 297,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 180,
      },
    {
      id: 'sock-verona-6a16a-heavy',
      icon: '⚡',
      title: '6 A/16 A Shuttered Socket (Heavy Duty) Verona',
      description: 'Verona heavy duty 6/16A shuttered socket',
      price: 297,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 160,
      },
    {
      id: 'fan-verona-1m-4step',
      icon: '🌀',
      title: '1M 4 Step Fan Regulator (Verona Series)',
      description: 'Verona 1M 4-step fan regulator',
      price: 590,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 140,
      },
    {
      id: 'fan-verona-2m-8step',
      icon: '🌀',
      title: '2M 8 Step Fan Regulator (Verona Series)',
      description: 'Verona 2M 8-step fan regulator',
      price: 671,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 140,
      },
    {
      id: 'fan-yu-1m-4step',
      icon: '🌀',
      title: '1M 4 Step Fan Regulator (YU Series)',
      description: 'YU 1M 4-step fan regulator support module',
      price: 440,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 150,
      },
    {
      id: 'fan-yu-2m-8step',
      icon: '🌀',
      title: '2M 8 Step Fan Regulator (YU Series)',
      description: 'YU 2M 8-step fan regulator support module',
      price: 545,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 150,
      },
    {
      id: 'fan-magnus-1m',
      icon: '🌀',
      title: '1M Fan Regulator (Magnus Series)',
      description: 'Magnus 1M fan regulator support module',
      price: 457,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 160,
      },
    {
      id: 'fan-magnus-2m',
      icon: '🌀',
      title: '2M Fan Regulator (Magnus Series)',
      description: 'Magnus 2M fan regulator support module',
      price: 512,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 160,
      },
    {
      id: 'cp-bliss-18m-dg',
      icon: '📋',
      title: '18M Combination Plate (Dark Grey Bliss+)',
      description: '18M cover frame only, Bliss+ dark grey',
      price: 297,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 120,
      },
    {
      id: 'cp-bliss-12m-dg',
      icon: '📋',
      title: '12M Combination Plate (Dark Grey Bliss+)',
      description: '12M cover frame only, Bliss+ dark grey',
      price: 257,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 120,
      },
    {
      id: 'cp-bliss-6m-dg',
      icon: '📋',
      title: '6M Combination Plate (Dark Grey Bliss+)',
      description: '6M cover frame only, Bliss+ dark grey',
      price: 164,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 130,
      },
    {
      id: 'cp-bliss-4m-dg',
      icon: '📋',
      title: '4M Combination Plate (Dark Grey Bliss+)',
      description: '4M cover frame only, Bliss+ dark grey',
      price: 114,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 130,
      },
    {
      id: 'cp-wood-8m-sq',
      icon: '📋',
      title: '8M Square Combination Plate (Wooden Box)',
      description: '8M square cover frame for wooden box',
      price: 257,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 110,
      },
    {
      id: 'cp-silkwhite-16m',
      icon: '📋',
      title: '16M Combination Plate (Silk White)',
      description: '16M cover frame only, silk white',
      price: 263,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 120,
      },
    {
      id: 'cp-wood-18m',
      icon: '📋',
      title: '18M Combination Plate (Wooden Box)',
      description: '18M cover frame for wooden box',
      price: 407,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 110,
      },
    {
      id: 'cp-wood-10m-h',
      icon: '📋',
      title: '10M (H) Combination Plate (Wooden Box)',
      description: '10M horizontal cover frame for wooden box',
      price: 286,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 110,
      },
    {
      id: 'cp-magnus-4m-acr-black',
      icon: '📋',
      title: '4M Combined Plate Magnus ACR Glossy Black',
      description: '4M Magnus acrylic glossy black cover frame',
      price: 490,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 90,
      },
    {
      id: 'cp-magnus-6m-acr-steelgrey',
      icon: '📋',
      title: '6M Combined Plate Magnus ACR Steel Grey',
      description: '6M Magnus acrylic steel grey cover frame',
      price: 664,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 90,
      },
    {
      id: 'cp-magnus-2m-acr-brown',
      icon: '📋',
      title: '2M Combined Plate Magnus ACR Glossy Brown',
      description: '2M Magnus acrylic glossy brown cover frame',
      price: 336,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 100,
      },
    {
      id: 'cp-magnus-4m-acr-brown',
      icon: '📋',
      title: '4M Combined Plate Magnus ACR Glossy Brown',
      description: '4M Magnus acrylic glossy brown cover frame',
      price: 490,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 95,
      },
    {
      id: 'cp-magnus-2m-acr-walnut',
      icon: '📋',
      title: '2M Combined Plate Magnus Acrylic Walnut Wood',
      description: '2M Magnus acrylic walnut wood cover frame',
      price: 348,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 100,
      },
    {
      id: 'cp-magnus-2m-acr-white',
      icon: '📋',
      title: '2M Combined Plate Magnus ACR Glossy White',
      description: '2M Magnus acrylic glossy white cover frame',
      price: 336,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 100,
      },
    {
      id: 'cp-magnus-4m-matt-grey',
      icon: '📋',
      title: '4M Combined Plate Magnus Matt Grey',
      description: '4M Magnus matt grey cover frame',
      price: 251,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 110,
      },
    {
      id: 'cp-magnus-6m-matt-gold',
      icon: '📋',
      title: '6M Combined Plate Magnus Matt Gold',
      description: '6M Magnus matt gold cover frame',
      price: 343,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 110,
      },
    {
      id: 'cp-magnus-6m-acr-black',
      icon: '📋',
      title: '6M Combined Plate Magnus ACR Glossy Black',
      description: '6M Magnus acrylic glossy black cover frame',
      price: 664,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 90,
      },
    {
      id: 'cp-magnus-6m-acr-walnut',
      icon: '📋',
      title: '6M Combined Plate Magnus Acrylic Walnut Wood',
      description: '6M Magnus acrylic walnut wood cover frame',
      price: 684,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 90,
      },
    {
      id: 'cp-magnus-6m-matt-grey',
      icon: '📋',
      title: '6M Combined Plate Magnus Matt Grey',
      description: '6M Magnus matt grey cover frame',
      price: 343,
      category: 'electronics',
      subcategory: 'Switches & Sockets',
      stock: 110,
      },
    // Wires & Cables collection
    {
      id: 'wc-1',
      icon: '🧵',
      title: '1 sq mm Copper Wire',
      description: 'High-quality copper wire for domestic wiring',
      price: 12,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 500,
      },
    {
      id: 'wc-2',
      icon: '🧵',
      title: '1.5 sq mm Copper Wire',
      description: 'Standard copper wire for general electrical use',
      price: 18,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 400,
      },
    {
      id: 'wc-3',
      icon: '🧵',
      title: '2.5 sq mm Copper Wire',
      description: 'Heavy duty wire for power circuits',
      price: 30,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 350,
      },
    {
      id: 'wc-4',
      icon: '⚡',
      title: 'Service Wire 6 sq mm',
      description: 'Weather-resistant service entrance wire',
      price: 35,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 200,
      },
    {
      id: 'wc-5',
      icon: '🌐',
      title: 'Cat6 LAN Cable',
      description: 'High-speed ethernet cable for networking',
      price: 10,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 600,
      },
    {
      id: 'wc-6',
      icon: '🧵',
      title: '1 sq mm Flexible Wire',
      description: 'Flexible copper wire for easy installation',
      price: 13,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 450,
      },
    {
      id: 'wc-7',
      icon: '🧵',
      title: '1.5 sq mm FR Wire',
      description: 'Fire-resistant wire for safety applications',
      price: 20,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 300,
      },
    {
      id: 'wc-8',
      icon: '🌐',
      title: 'Cat5e LAN Cable',
      description: 'Reliable ethernet cable for networking',
      price: 8,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 700,
      },
    {
      id: 'wc-9',
      icon: '⚡',
      title: 'Service Wire 10 sq mm',
      description: 'Heavy-duty service wire for main supply',
      price: 40,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 150,
      },
    {
      id: 'wc-10',
      icon: '🧵',
      title: '2.5 sq mm FRLS Wire',
      description: 'Fire retardant low smoke wire',
      price: 32,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 250,
      },
    // Lighting collection
    {
      id: 'light-1',
      icon: '💡',
      title: 'LED Bulb 9W Cool White',
      description: 'Energy-efficient 9W LED bulb with cool white light',
      price: 120,
      category: 'electronics',
      subcategory: 'Lighting',
      stock: 200,
      },
    {
      id: 'light-2',
      icon: '💡',
      title: 'LED Bulb 9W Warm White',
      description: 'Warm white 9W LED bulb for cozy ambiance',
      price: 110,
      category: 'electronics',
      subcategory: 'Lighting',
      stock: 180,
      },
    {
      id: 'light-3',
      icon: '💡',
      title: 'LED Bulb 12W Cool White',
      description: 'Bright 12W LED bulb for larger spaces',
      price: 160,
      category: 'electronics',
      subcategory: 'Lighting',
      stock: 150,
      },
    {
      id: 'light-4',
      icon: '💡',
      title: 'LED Bulb 12W Daylight',
      description: 'Natural daylight 12W LED bulb',
      price: 170,
      category: 'electronics',
      subcategory: 'Lighting',
      stock: 140,
      },
    {
      id: 'light-5',
      icon: '🔦',
      title: 'LED Tube Light 18W',
      description: '4ft LED tube light for offices and homes',
      price: 280,
      category: 'electronics',
      subcategory: 'Lighting',
      stock: 100,
      },
    {
      id: 'light-6',
      icon: '🔦',
      title: 'LED Tube Light 22W',
      description: 'Bright 22W LED tube light',
      price: 320,
      category: 'electronics',
      subcategory: 'Lighting',
      stock: 90,
      },
    {
      id: 'light-7',
      icon: '⬜',
      title: 'LED Panel Light 18W Square',
      description: 'Slim square panel light for false ceilings',
      price: 450,
      category: 'electronics',
      subcategory: 'Lighting',
      stock: 80,
      },
    {
      id: 'light-8',
      icon: '⬜',
      title: 'LED Panel Light 24W Round',
      description: 'Round panel light with uniform illumination',
      price: 520,
      category: 'electronics',
      subcategory: 'Lighting',
      stock: 70,
      },
    {
      id: 'light-9',
      icon: '🌃',
      title: 'LED Street Light 30W',
      description: 'Outdoor street light with high brightness',
      price: 1200,
      category: 'electronics',
      subcategory: 'Lighting',
      stock: 40,
      },
    {
      id: 'light-10',
      icon: '🌃',
      title: 'LED Street Light 50W',
      description: 'High-power street light for main roads',
      price: 1800,
      category: 'electronics',
      subcategory: 'Lighting',
      stock: 30,
      },
    {
      id: 'light-11',
      icon: '🔋',
      title: 'Rechargeable Emergency Light',
      description: 'Portable emergency light with long backup',
      price: 550,
      category: 'electronics',
      subcategory: 'Lighting',
      stock: 60,
      },
    {
      id: 'light-12',
      icon: '🔋',
      title: 'LED Emergency Bulb 9W',
      description: 'Emergency bulb with auto power backup',
      price: 420,
      category: 'electronics',
      subcategory: 'Lighting',
      stock: 75,
      },
    // Fans collection
    {
      id: 'fan-1',
      icon: '🌀',
      title: 'Ceiling Fan 1200mm',
      description: 'Energy-efficient ceiling fan',
      price: 1800,
      category: 'electronics',
      subcategory: 'Fans',
      stock: 120,
      },
    {
      id: 'fan-2',
      icon: '🌀',
      title: 'Table Fan 400mm',
      description: 'Portable 3-speed table fan with oscillation',
      price: 1250,
      category: 'electronics',
      subcategory: 'Fans',
      stock: 90,
      },
    {
      id: 'fan-3',
      icon: '🌀',
      title: 'Pedestal Fan 400mm',
      description: 'Height-adjustable pedestal fan with remote',
      price: 2100,
      category: 'electronics',
      subcategory: 'Fans',
      stock: 80,
      },
    {
      id: 'fan-4',
      icon: '🌀',
      title: 'Exhaust Fan 250mm',
      description: 'High-speed exhaust fan for kitchens and bathrooms',
      price: 1150,
      category: 'electronics',
      subcategory: 'Fans',
      stock: 70,
      },
    // MCB & Distribution collection
    {
      id: 'mcb-1',
      icon: '⚡',
      title: 'Single Pole MCB 16A',
      description: 'Reliable protection for residential circuits',
      price: 140,
      category: 'electronics',
      subcategory: 'MCB & Distribution',
      stock: 200,
      },
    {
      id: 'mcb-2',
      icon: '⚡',
      title: 'Double Pole MCB 32A',
      description: 'DP MCB for main line protection',
      price: 320,
      category: 'electronics',
      subcategory: 'MCB & Distribution',
      stock: 160,
      },
    {
      id: 'mcb-3',
      icon: '⚡',
      title: 'RCCB 40A 30mA',
      description: 'Residual current breaker for shock protection',
      price: 950,
      category: 'electronics',
      subcategory: 'MCB & Distribution',
      stock: 110,
      },
    {
      id: 'mcb-4',
      icon: '🗃️',
      title: '8 Way DB Box',
      description: 'Double-door distribution board box',
      price: 520,
      category: 'electronics',
      subcategory: 'MCB & Distribution',
      stock: 130,
      },
    // Electrical Accessories collection
    {
      id: 'acc-1',
      icon: '🔌',
      title: 'Extension Board 4 Socket',
      description: 'Surge-protected extension board with 4 universal sockets',
      price: 280,
      category: 'electronics',
      subcategory: 'Electrical Accessories',
      stock: 220,
      },
    {
      id: 'acc-2',
      icon: '⚡',
      title: 'Spike Guard 4 Socket',
      description: 'Spike guard with overload protection',
      price: 340,
      category: 'electronics',
      subcategory: 'Electrical Accessories',
      stock: 200,
      },
    {
      id: 'acc-3',
      icon: '🔌',
      title: 'Adapter Plug 3 Pin',
      description: 'Universal adapter plug for travel and home use',
      price: 65,
      category: 'electronics',
      subcategory: 'Electrical Accessories',
      stock: 500,
      },
    {
      id: 'acc-4',
      icon: '💡',
      title: 'B22 Bulb Holder',
      description: 'Heat-resistant bulb holder for ceiling fittings',
      price: 22,
      category: 'electronics',
      subcategory: 'Electrical Accessories',
      stock: 600,
      },
    {
      id: 'acc-5',
      icon: '🩹',
      title: 'Insulation Tape (18mm)',
      description: 'Flame-retardant PVC insulation tape',
      price: 10,
      category: 'electronics',
      subcategory: 'Electrical Accessories',
      stock: 1000,
      },
    {
      id: 'acc-6',
      icon: '🔗',
      title: 'Cable Ties (100 pack)',
      description: 'Durable nylon cable ties for neat wiring',
      price: 60,
      category: 'electronics',
      subcategory: 'Electrical Accessories',
      stock: 800,
      },
    {
      id: 'acc-7',
      icon: '📏',
      title: 'Conduit Pipe 10ft',
      description: 'Rigid PVC conduit pipe for safe wiring',
      price: 62,
      category: 'electronics',
      subcategory: 'Electrical Accessories',
      stock: 350,
      },
    // Wires & Cables - 1 sq mm
    {
      id: 'wc-life-plus-1sqmm',
      icon: '🧵',
      title: 'Life Line Plus S3 HRFR Cables 1.0 sq. mm 90 m',
      description: 'Available in black, blue, grey, green, white, yellow and red',
      price: 3075,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 150,
      variants: [
        { id: 'black', label: 'Black', price: 3075, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg' },
        { id: 'blue', label: 'Blue', price: 3075, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNBA1X50.jpg' },
        { id: 'grey', label: 'Grey', price: 3075, swatch: '#808080' },
        { id: 'green', label: 'Green', price: 3075, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNGA1X50.jpg' },
        { id: 'white', label: 'White', price: 3075, swatch: '#ffffff' },
        { id: 'yellow', label: 'Yellow', price: 3075, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNYA1X50.jpg' },
        { id: 'red', label: 'Red', price: 3075, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNRA1X50.jpg' }
      ]
    },
    {
      id: 'wc-lifeline-fr-1sqmm',
      icon: '🧵',
      title: 'Lifeline FR 1.0 sq. mm 180 m',
      description: 'Available in Red, black, blue, yellow',
      price: 5005,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 120,
      variants: [
        { id: 'red', label: 'Red', price: 5005, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_red_7.jpg' },
        { id: 'black', label: 'Black', price: 5005, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_black_7.jpg' },
        { id: 'blue', label: 'Blue', price: 5005, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_blue_7.jpg' },
        { id: 'yellow', label: 'Yellow', price: 5005, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_yellow_7.jpg' }
      ]
    },
    {
      id: 'wc-lifeguard-1sqmm',
      icon: '🧵',
      title: 'Life Guard FR-LSH 1.0 sq. mm Cables 90 m',
      description: 'Available in black, blue, green, yellow and red',
      price: 3170,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 140,
      variants: [
        { id: 'black', label: 'Black', price: 3170, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/black.jpg' },
        { id: 'blue', label: 'Blue', price: 3170, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/blue.jpg' },
        { id: 'green', label: 'Green', price: 3170, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/green.jpg' },
        { id: 'yellow', label: 'Yellow', price: 3170, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/yellow.jpg' },
        { id: 'red', label: 'Red', price: 3170, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/red.jpg' }
      ]
    },
    {
      id: 'wc-lifeshield-1sqmm',
      icon: '🧵',
      title: 'Life Shield HFFR 1.0 sq. mm Cables 90 m',
      description: 'Available in black, blue, green, yellow and red',
      price: 3225,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 130,
      variants: [
        { id: 'black', label: 'Black', price: 3225, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/black.jpg' },
        { id: 'blue', label: 'Blue', price: 3225, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/blue.jpg' },
        { id: 'green', label: 'Green', price: 3225, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/green.jpg' },
        { id: 'yellow', label: 'Yellow', price: 3225, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/yellow.jpg' },
        { id: 'red', label: 'Red', price: 3225, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/red.jpg' }
      ]
    },
    {
      id: 'wc-polycab-suprema-1sqmm',
      icon: '🧵',
      title: 'POLYCABSUPREMA Electron Beam 90M - 1 sq.mm',
      description: 'Available in red, yellow, blue, black, green',
      price: 3400,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 125,
      imageUrl: 'https://cms.polycab.com/media/ue4gllml/ldis09cyuaye001c006sb005s_img_01.jpg?format=webp',
      variants: [
        { id: 'red', label: 'Red', price: 3400, swatch: '#ff0000' },
        { id: 'yellow', label: 'Yellow', price: 3400, swatch: '#ffff00' },
        { id: 'blue', label: 'Blue', price: 3400, swatch: '#0000ff' },
        { id: 'black', label: 'Black', price: 3400, swatch: '#000000' },
        { id: 'green', label: 'Green', price: 3400, swatch: '#008000' }
      ]
    },
    {
      id: 'wc-polycab-green-1sqmm',
      icon: '🧵',
      title: 'Polycab Green Wire+ HR FR-LSH LF 90m - 1 sq.mm',
      description: 'Premium house wires with fire resistance',
      price: 3650,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 110,
      imageUrl: 'https://cms.polycab.com/media/lohiqjqo/ldis09cyuayl001c004sb034s_img_01.png?format=webp'
    },
    // Wires & Cables - 1.5 sq mm
    {
      id: 'wc-life-plus-1.5sqmm',
      icon: '🧵',
      title: 'Life Line Plus S3 HRFR Cables 1.5 sq. mm 90 m',
      description: 'Available in black, blue, grey, green, white, yellow and red',
      price: 4500,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 150,
      variants: [
        { id: 'black', label: 'Black', price: 4500, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg' },
        { id: 'blue', label: 'Blue', price: 4500, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNBA1X50.jpg' },
        { id: 'grey', label: 'Grey', price: 4500, swatch: '#808080' },
        { id: 'green', label: 'Green', price: 4500, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNGA1X50.jpg' },
        { id: 'white', label: 'White', price: 4500, swatch: '#ffffff' },
        { id: 'yellow', label: 'Yellow', price: 4500, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNYA1X50.jpg' },
        { id: 'red', label: 'Red', price: 4500, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNRA1X50.jpg' }
      ]
    },
    {
      id: 'wc-lifeline-fr-1.5sqmm',
      icon: '🧵',
      title: 'Lifeline FR 1.5 sq. mm 180 m',
      description: 'Available in Red, black, blue, yellow',
      price: 9475,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 100,
      variants: [
        { id: 'red', label: 'Red', price: 9475, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_red_7.jpg' },
        { id: 'black', label: 'Black', price: 9475, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_black_7.jpg' },
        { id: 'blue', label: 'Blue', price: 9475, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_blue_7.jpg' },
        { id: 'yellow', label: 'Yellow', price: 9475, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_yellow_7.jpg' }
      ]
    },
    {
      id: 'wc-lifeguard-1.5sqmm',
      icon: '🧵',
      title: 'Life Guard FR-LSH 1.5 sq. mm Cables 90 m',
      description: 'Available in black, blue, green, yellow and red',
      price: 4635,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 135,
      variants: [
        { id: 'black', label: 'Black', price: 4635, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/black.jpg' },
        { id: 'blue', label: 'Blue', price: 4635, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/blue.jpg' },
        { id: 'green', label: 'Green', price: 4635, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/green.jpg' },
        { id: 'yellow', label: 'Yellow', price: 4635, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/yellow.jpg' },
        { id: 'red', label: 'Red', price: 4635, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/red.jpg' }
      ]
    },
    {
      id: 'wc-lifeshield-1.5sqmm',
      icon: '🧵',
      title: 'Life Shield HFFR 1.5 sq. mm Cables 90 m',
      description: 'Available in black, blue, green, yellow and red',
      price: 4725,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 128,
      variants: [
        { id: 'black', label: 'Black', price: 4725, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/black.jpg' },
        { id: 'blue', label: 'Blue', price: 4725, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/blue.jpg' },
        { id: 'green', label: 'Green', price: 4725, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/green.jpg' },
        { id: 'yellow', label: 'Yellow', price: 4725, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/yellow.jpg' },
        { id: 'red', label: 'Red', price: 4725, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/red.jpg' }
      ]
    },
    {
      id: 'wc-polycab-suprema-1.5sqmm',
      icon: '🧵',
      title: 'POLYCABSUPREMA Electron Beam 90M - 1.5 sq.mm',
      description: 'Available in red, yellow, blue, black, green',
      price: 5000,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 120,
      imageUrl: 'https://cms.polycab.com/media/ue4gllml/ldis09cyuaye001c006sb005s_img_01.jpg?format=webp',
      variants: [
        { id: 'red', label: 'Red', price: 5000, swatch: '#ff0000' },
        { id: 'yellow', label: 'Yellow', price: 5000, swatch: '#ffff00' },
        { id: 'blue', label: 'Blue', price: 5000, swatch: '#0000ff' },
        { id: 'black', label: 'Black', price: 5000, swatch: '#000000' },
        { id: 'green', label: 'Green', price: 5000, swatch: '#008000' }
      ]
    },
    {
      id: 'wc-polycab-green-1.5sqmm',
      icon: '🧵',
      title: 'Polycab Green Wire+ HR FR-LSH LF 90m - 1.5 sq.mm',
      description: 'Premium house wires with fire resistance',
      price: 5900,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 105,
      imageUrl: 'https://cms.polycab.com/media/lohiqjqo/ldis09cyuayl001c004sb034s_img_01.png?format=webp'
    },
    // Wires & Cables - 2.5 sq mm
    {
      id: 'wc-life-plus-2.5sqmm',
      icon: '🧵',
      title: 'Life Line Plus S3 HRFR Cables 2.5 sq. mm 90 m',
      description: 'Available in black, blue, grey, green, white, yellow and red',
      price: 7185,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 140,
      variants: [
        { id: 'black', label: 'Black', price: 7185, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg' },
        { id: 'blue', label: 'Blue', price: 7185, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNBA1X50.jpg' },
        { id: 'grey', label: 'Grey', price: 7185, swatch: '#808080' },
        { id: 'green', label: 'Green', price: 7185, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNGA1X50.jpg' },
        { id: 'white', label: 'White', price: 7185, swatch: '#ffffff' },
        { id: 'yellow', label: 'Yellow', price: 7185, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNYA1X50.jpg' },
        { id: 'red', label: 'Red', price: 7185, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNRA1X50.jpg' }
      ]
    },
    {
      id: 'wc-lifeline-fr-2.5sqmm',
      icon: '🧵',
      title: 'Lifeline FR 2.5 sq. mm 180 m',
      description: 'Available in Red, black, blue, yellow',
      price: 9475,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 95,
      variants: [
        { id: 'red', label: 'Red', price: 9475, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_red_7.jpg' },
        { id: 'black', label: 'Black', price: 9475, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_black_7.jpg' },
        { id: 'blue', label: 'Blue', price: 9475, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_blue_7.jpg' },
        { id: 'yellow', label: 'Yellow', price: 9475, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_yellow_7.jpg' }
      ]
    },
    {
      id: 'wc-lifeguard-2.5sqmm',
      icon: '🧵',
      title: 'Life Guard FR-LSH 2.5 sq. mm Cables 90 m',
      description: 'Available in black, blue, green, yellow and red',
      price: 7400,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 130,
      variants: [
        { id: 'black', label: 'Black', price: 7400, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/black.jpg' },
        { id: 'blue', label: 'Blue', price: 7400, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/blue.jpg' },
        { id: 'green', label: 'Green', price: 7400, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/green.jpg' },
        { id: 'yellow', label: 'Yellow', price: 7400, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/yellow.jpg' },
        { id: 'red', label: 'Red', price: 7400, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/red.jpg' }
      ]
    },
    {
      id: 'wc-lifeshield-2.5sqmm',
      icon: '🧵',
      title: 'Life Shield HFFR 2.5 sq. mm Cables 90 m',
      description: 'Available in black, blue, green, yellow and red',
      price: 7540,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 125,
      variants: [
        { id: 'black', label: 'Black', price: 7540, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/black.jpg' },
        { id: 'blue', label: 'Blue', price: 7540, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/blue.jpg' },
        { id: 'green', label: 'Green', price: 7540, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/green.jpg' },
        { id: 'yellow', label: 'Yellow', price: 7540, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/yellow.jpg' },
        { id: 'red', label: 'Red', price: 7540, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/red.jpg' }
      ]
    },
    {
      id: 'wc-polycab-suprema-2.5sqmm',
      icon: '🧵',
      title: 'POLYCABSUPREMA Electron Beam 90M - 2.5 sq.mm',
      description: 'Available in red, yellow, blue, black, green',
      price: 7900,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 115,
      imageUrl: 'https://cms.polycab.com/media/ue4gllml/ldis09cyuaye001c006sb005s_img_01.jpg?format=webp',
      variants: [
        { id: 'red', label: 'Red', price: 7900, swatch: '#ff0000' },
        { id: 'yellow', label: 'Yellow', price: 7900, swatch: '#ffff00' },
        { id: 'blue', label: 'Blue', price: 7900, swatch: '#0000ff' },
        { id: 'black', label: 'Black', price: 7900, swatch: '#000000' },
        { id: 'green', label: 'Green', price: 7900, swatch: '#008000' }
      ]
    },
    {
      id: 'wc-polycab-green-2.5sqmm',
      icon: '🧵',
      title: 'Polycab Green Wire+ HR FR-LSH LF 90m - 2.5 sq.mm',
      description: 'Premium house wires with fire resistance',
      price: 9250,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 100,
      imageUrl: 'https://cms.polycab.com/media/lohiqjqo/ldis09cyuayl001c004sb034s_img_01.png?format=webp'
    },
    // Wires & Cables - 4 sq mm
    {
      id: 'wc-life-plus-4sqmm',
      icon: '🧵',
      title: 'Life Line Plus S3 HRFR Cables 4 sq. mm 90 m',
      description: 'Available in black, blue, grey, green, white, yellow and red',
      price: 10520,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 130,
      variants: [
        { id: 'black', label: 'Black', price: 10520, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg' },
        { id: 'blue', label: 'Blue', price: 10520, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNBA1X50.jpg' },
        { id: 'grey', label: 'Grey', price: 10520, swatch: '#808080' },
        { id: 'green', label: 'Green', price: 10520, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNGA1X50.jpg' },
        { id: 'white', label: 'White', price: 10520, swatch: '#ffffff' },
        { id: 'yellow', label: 'Yellow', price: 10520, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNYA1X50.jpg' },
        { id: 'red', label: 'Red', price: 10520, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNRA1X50.jpg' }
      ]
    },
    {
      id: 'wc-lifeline-fr-4sqmm',
      icon: '🧵',
      title: 'Lifeline FR 4 sq. mm 180 m',
      description: 'Available in Red, black, blue, yellow',
      price: 23435,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 90,
      variants: [
        { id: 'red', label: 'Red', price: 23435, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_red_7.jpg' },
        { id: 'black', label: 'Black', price: 23435, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_black_7.jpg' },
        { id: 'blue', label: 'Blue', price: 23435, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_blue_7.jpg' },
        { id: 'yellow', label: 'Yellow', price: 23435, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_yellow_7.jpg' }
      ]
    },
    {
      id: 'wc-lifeguard-4sqmm',
      icon: '🧵',
      title: 'Life Guard FR-LSH 4 sq. mm Cables 90 m',
      description: 'Available in black, blue, green, yellow and red',
      price: 10840,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 125,
      variants: [
        { id: 'black', label: 'Black', price: 10840, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/black.jpg' },
        { id: 'blue', label: 'Blue', price: 10840, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/blue.jpg' },
        { id: 'green', label: 'Green', price: 10840, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/green.jpg' },
        { id: 'yellow', label: 'Yellow', price: 10840, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/yellow.jpg' },
        { id: 'red', label: 'Red', price: 10840, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/red.jpg' }
      ]
    },
    {
      id: 'wc-lifeshield-4sqmm',
      icon: '🧵',
      title: 'Life Shield HFFR 4 sq. mm Cables 90 m',
      description: 'Available in black, blue, green, yellow and red',
      price: 11050,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 120,
      variants: [
        { id: 'black', label: 'Black', price: 11050, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/black.jpg' },
        { id: 'blue', label: 'Blue', price: 11050, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/blue.jpg' },
        { id: 'green', label: 'Green', price: 11050, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/green.jpg' },
        { id: 'yellow', label: 'Yellow', price: 11050, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/yellow.jpg' },
        { id: 'red', label: 'Red', price: 11050, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/red.jpg' }
      ]
    },
    {
      id: 'wc-polycab-suprema-4sqmm',
      icon: '🧵',
      title: 'POLYCABSUPREMA Electron Beam 90M - 4 sq.mm',
      description: 'Available in red, yellow, blue, black, green',
      price: 11500,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 110,
      imageUrl: 'https://cms.polycab.com/media/ue4gllml/ldis09cyuaye001c006sb005s_img_01.jpg?format=webp',
      variants: [
        { id: 'red', label: 'Red', price: 11500, swatch: '#ff0000' },
        { id: 'yellow', label: 'Yellow', price: 11500, swatch: '#ffff00' },
        { id: 'blue', label: 'Blue', price: 11500, swatch: '#0000ff' },
        { id: 'black', label: 'Black', price: 11500, swatch: '#000000' },
        { id: 'green', label: 'Green', price: 11500, swatch: '#008000' }
      ]
    },
    {
      id: 'wc-polycab-green-4sqmm',
      icon: '🧵',
      title: 'Polycab Green Wire+ HR FR-LSH LF 90m - 4 sq.mm',
      description: 'Premium house wires with fire resistance',
      price: 12200,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 95,
      imageUrl: 'https://cms.polycab.com/media/lohiqjqo/ldis09cyuayl001c004sb034s_img_01.png?format=webp'
    },
    // Wires & Cables - 6 sq mm
    {
      id: 'wc-life-plus-6sqmm',
      icon: '🧵',
      title: 'Life Line Plus S3 HRFR Cables 6 sq. mm 90 m',
      description: 'Available in black, blue, grey, green, white, yellow and red',
      price: 13410,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 120,
      variants: [
        { id: 'black', label: 'Black', price: 13410, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg' },
        { id: 'blue', label: 'Blue', price: 13410, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNBA1X50.jpg' },
        { id: 'grey', label: 'Grey', price: 13410, swatch: '#808080' },
        { id: 'green', label: 'Green', price: 13410, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNGA1X50.jpg' },
        { id: 'white', label: 'White', price: 13410, swatch: '#ffffff' },
        { id: 'yellow', label: 'Yellow', price: 13410, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNYA1X50.jpg' },
        { id: 'red', label: 'Red', price: 13410, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNRA1X50.jpg' }
      ]
    },
    {
      id: 'wc-lifeline-fr-6sqmm',
      icon: '🧵',
      title: 'Lifeline FR 6 sq. mm 180 m',
      description: 'Available in Red, black, blue, yellow',
      price: 23435,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 85,
      variants: [
        { id: 'red', label: 'Red', price: 23435, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_red_7.jpg' },
        { id: 'black', label: 'Black', price: 23435, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_black_7.jpg' },
        { id: 'blue', label: 'Blue', price: 23435, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_blue_7.jpg' },
        { id: 'yellow', label: 'Yellow', price: 23435, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_yellow_7.jpg' }
      ]
    },
    {
      id: 'wc-lifeguard-6sqmm',
      icon: '🧵',
      title: 'Life Guard FR-LSH 6 sq. mm Cables 90 m',
      description: 'Available in black, blue, green, yellow and red',
      price: 16135,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 115,
      variants: [
        { id: 'black', label: 'Black', price: 16135, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/black.jpg' },
        { id: 'blue', label: 'Blue', price: 16135, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/blue.jpg' },
        { id: 'green', label: 'Green', price: 16135, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/green.jpg' },
        { id: 'yellow', label: 'Yellow', price: 16135, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/yellow.jpg' },
        { id: 'red', label: 'Red', price: 16135, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/red.jpg' }
      ]
    },
    {
      id: 'wc-lifeshield-6sqmm',
      icon: '🧵',
      title: 'Life Shield HFFR 6 sq. mm Cables 90 m',
      description: 'Available in black, blue, green, yellow and red',
      price: 16450,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 110,
      variants: [
        { id: 'black', label: 'Black', price: 16450, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/black.jpg' },
        { id: 'blue', label: 'Blue', price: 16450, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/blue.jpg' },
        { id: 'green', label: 'Green', price: 16450, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/green.jpg' },
        { id: 'yellow', label: 'Yellow', price: 16450, swatch: '#ffff00', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/yellow.jpg' },
        { id: 'red', label: 'Red', price: 16450, swatch: '#ff0000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/red.jpg' }
      ]
    },
    {
      id: 'wc-polycab-suprema-6sqmm',
      icon: '🧵',
      title: 'POLYCABSUPREMA Electron Beam 90M - 6 sq.mm',
      description: 'Available in red, yellow, blue, black, green',
      price: 17200,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 105,
      imageUrl: 'https://cms.polycab.com/media/ue4gllml/ldis09cyuaye001c006sb005s_img_01.jpg?format=webp',
      variants: [
        { id: 'red', label: 'Red', price: 17200, swatch: '#ff0000' },
        { id: 'yellow', label: 'Yellow', price: 17200, swatch: '#ffff00' },
        { id: 'blue', label: 'Blue', price: 17200, swatch: '#0000ff' },
        { id: 'black', label: 'Black', price: 17200, swatch: '#000000' },
        { id: 'green', label: 'Green', price: 17200, swatch: '#008000' }
      ]
    },
    {
      id: 'wc-polycab-green-6sqmm',
      icon: '🧵',
      title: 'Polycab Green Wire+ HR FR-LSH LF 90m - 6 sq.mm',
      description: 'Premium house wires with fire resistance',
      price: 18400,
      category: 'electronics',
      subcategory: 'Wires & Cables',
      stock: 90,
      imageUrl: 'https://cms.polycab.com/media/lohiqjqo/ldis09cyuayl001c004sb034s_img_01.png?format=webp'
    }
  ];

  // Category data with subcategories
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

  const filteredItems = useMemo(() => {
    let items = shopItems
    
    // Filter by category
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory)
    }
    
    // Filter by subcategory
    if (selectedSubcategory) {
      items = items.filter(item => item.subcategory === selectedSubcategory)
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      )
    }
    
    return items
  }, [shopItems, selectedCategory, selectedSubcategory, searchQuery])

  // Define categories for filtering
  const categories = useMemo(() => [
    { id: 'all', label: 'All Products', count: shopItems.length },
    { id: 'electronics', label: 'Electronics', count: shopItems.filter(i => i.category === 'electronics').length },
    { id: 'components', label: 'Components', count: shopItems.filter(i => i.category === 'components').length },
    { id: 'accessories', label: 'Accessories', count: shopItems.filter(i => i.category === 'accessories').length },
  ], [shopItems])

  const getItemImageUrl = (item) => {
    const selectedIdx = selectedVariants[item.id] ?? 0
    const hasVariants = Array.isArray(item.variants) && item.variants.length > 0
    const currentVariant = hasVariants ? item.variants[selectedIdx] : null
    return (hasVariants && currentVariant?.imageUrl) ? currentVariant.imageUrl : (item.imageUrl || fallbackImageFor(item))
  }


  const handleAddToCart = async (e, item) => {
    e.stopPropagation()
    
    if (!isAuthenticated) {
      setFeedback((prev) => ({ ...prev, [`cart-${item.id}`]: 'Please login' }))
      setTimeout(() => {
        navigate('/login', { state: { from: '/shop' } })
      }, 800)
      return
    }

    if (item.stock <= 0 || item.status === 'inactive') {
      setFeedback((prev) => ({ ...prev, [`cart-${item.id}`]: 'Out of stock' }))
      setTimeout(() => {
        setFeedback((prev) => ({ ...prev, [`cart-${item.id}`]: '' }))
      }, 2000)
      return
    }

    // If already in cart, don't add again
    if (isInCart(item.id)) {
      return
    }

    setLoading((prev) => ({ ...prev, [`cart-${item.id}`]: true }))
    setFeedback((prev) => ({ ...prev, [`cart-${item.id}`]: 'Adding...' }))

    try {
      const token = getToken('user')
      if (!token) {
        handleAuthFailure('Session expired. Please login again.')
        return
      }

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
          imageUrl: getItemImageUrl(item),
          icon: item.icon || '📦',
        }),
      })

      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}))
        handleAuthFailure(errorData.message || 'Session expired. Please login again.')
        return
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to add to cart`)
      }

      const responseData = await response.json()

      // Update local cart state
        setCartItems(prev => [...prev, {
          productId: item.id,
          name: item.title,
          price: item.price,
          quantity: 1,
          imageUrl: getItemImageUrl(item),
          icon: item.icon || '📦',
        }])
      
      setFeedback((prev) => ({ ...prev, [`cart-${item.id}`]: '✓ Added' }))
      
      // Refresh the cart count in the header
      if (refreshCounts) {
        refreshCounts()
      }
      
      // Reset the feedback after 2 seconds
      setTimeout(() => {
        setFeedback((prev) => ({ ...prev, [`cart-${item.id}`]: '' }))
      }, 2000)
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      const errorMsg = error.message || 'Failed'
      setFeedback((prev) => ({ ...prev, [`cart-${item.id}`]: errorMsg }))
      setTimeout(() => {
        setFeedback((prev) => ({ ...prev, [`cart-${item.id}`]: '' }))
      }, 3000)
    } finally {
      setLoading((prev) => ({ ...prev, [`cart-${item.id}`]: false }))
    }
  }

  const handleWishlistClick = async (e, item) => {
    e.stopPropagation()
    
    if (!isAuthenticated) {
      setFeedback((prev) => ({ ...prev, [`wish-${item.id}`]: 'Please login' }))
      setTimeout(() => {
        navigate('/login', { state: { from: '/shop' } })
      }, 800)
      return
    }
    
    const isWishlisted = isInWishlist(item.id)
    
    if (isWishlisted) {
      await handleRemoveFromWishlist(e, item)
    } else {
      await handleAddToWishlist(e, item)
    }
  }
  
  const handleAddToWishlist = async (e, item) => {
    e.stopPropagation()
    
    setLoading((prev) => ({ ...prev, [`wish-${item.id}`]: true }))
    setFeedback((prev) => ({ ...prev, [`wish-${item.id}`]: 'Saving...' }))

    try {
      const token = getToken('user')
      if (!token) {
        handleAuthFailure('Session expired. Please login again.')
        return
      }

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
          imageUrl: getItemImageUrl(item),
          icon: item.icon || '❤️',
        }),
      })

      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}))
        handleAuthFailure(errorData.message || 'Session expired. Please login again.')
        return
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to add to wishlist`)
      }

      const responseData = await response.json()

      // Update local wishlist state
        setWishlistItems(prev => [...prev, {
          productId: item.id,
          name: item.title,
          price: item.price,
          imageUrl: getItemImageUrl(item),
          icon: item.icon || '❤️',
        }])
      
      setFeedback((prev) => ({ ...prev, [`wish-${item.id}`]: '✓ Saved' }))
      
      // Refresh the wishlist count in the header
      if (refreshCounts) {
        refreshCounts()
      }
      
      // Reset the feedback after 2 seconds
      setTimeout(() => {
        setFeedback((prev) => ({ ...prev, [`wish-${item.id}`]: '' }))
      }, 2000)
      
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      const errorMsg = error.message || 'Failed'
      setFeedback((prev) => ({ ...prev, [`wish-${item.id}`]: errorMsg }))
      setTimeout(() => {
        setFeedback((prev) => ({ ...prev, [`wish-${item.id}`]: '' }))
      }, 3000)
    } finally {
      setLoading((prev) => ({ ...prev, [`wish-${item.id}`]: false }))
    }
  }
  
  const handleRemoveFromWishlist = async (e, item) => {
    e.stopPropagation()
    
    setLoading((prev) => ({ ...prev, [`wish-${item.id}`]: true }))
    setFeedback((prev) => ({ ...prev, [`wish-${item.id}`]: 'Removing...' }))
    
    try {
      const token = getToken('user')
      if (!token) {
        handleAuthFailure('Session expired. Please login again.')
        return
      }
      
      // Find the wishlist item ID
      const wishlistItem = wishlistItems.find(wishItem => wishItem.productId === item.id)
      if (!wishlistItem) return
      
      const response = await fetch(`${API_BASE}/api/wishlist/${wishlistItem._id || wishlistItem.productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.status === 401) {
        const data = await response.json().catch(() => ({}))
        handleAuthFailure(data.message || 'Session expired. Please login again.')
        return
      }
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to remove from wishlist')
      }
      
      // Update local wishlist state
      setWishlistItems(prev => prev.filter(wishItem => wishItem.productId !== item.id))
      setFeedback((prev) => ({ ...prev, [`wish-${item.id}`]: 'Removed' }))
      
      // Refresh the wishlist count in the header
      if (refreshCounts) {
        await refreshCounts()
      }
      
      // Reset the feedback after 1 second
      setTimeout(() => {
        setFeedback((prev) => ({ ...prev, [`wish-${item.id}`]: '' }))
      }, 1000)
      
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      setFeedback((prev) => ({ ...prev, [`wish-${item.id}`]: 'Error' }))
      alert(`Failed to remove from wishlist: ${error.message}`)
    } finally {
      setLoading((prev) => ({ ...prev, [`wish-${item.id}`]: false }))
    }
  }

  return (
    <main className="main-content">
      <div className="container">
        {productsLoading && <div className="page-loading">Loading products...</div>}
        {productsError && <div className="error-message">{productsError}</div>}
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
                    setSelectedCategory(key)
                    setSelectedSubcategory('')
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
                            // Navigate to dedicated pages
                            if (label === 'Switches & Sockets') {
                              navigate('/switches-sockets')
                              setOpenDropdown(null)
                            } else if (label === 'Wires & Cables') {
                              navigate('/wires-cables')
                              setOpenDropdown(null)
                            } else if (label === 'Lighting') {
                              navigate('/lighting')
                              setOpenDropdown(null)
                            } else if (label === 'Fans') {
                              navigate('/fans')
                              setOpenDropdown(null)
                            } else if (label === 'MCB & Distribution') {
                              navigate('/mcb-distribution')
                              setOpenDropdown(null)
                            } else if (label === 'Electrical Accessories') {
                              navigate('/electrical-accessories')
                              setOpenDropdown(null)
                            } else if (label === 'Fasteners') {
                              navigate('/fasteners')
                              setOpenDropdown(null)
                            } else {
                              setSelectedCategory(key)
                              setSelectedSubcategory(label)
                              setOpenDropdown(null)
                            }
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

        <div className="shop-layout">
          {/* Main Content */}
          <section className="shop-main-full">
            <div className="shop-header">
              <h2 className="shop-title">
                {searchQuery ? `Search results for "${searchQuery}"` : 
                 selectedCategory === 'all' ? 'All Products' : 
                 categoryData[selectedCategory]?.name || 'Products'}
                {selectedSubcategory && ` - ${selectedSubcategory}`}
              </h2>
              <p className="shop-subtitle">
                Showing {filteredItems.length} {filteredItems.length === 1 ? 'product' : 'products'}
              </p>
            </div>

            <div className="shop-grid">
              {filteredItems.map(item => {
                const selectedIdx = selectedVariants[item.id] ?? 0
                const hasVariants = Array.isArray(item.variants) && item.variants.length > 0
                const currentVariant = hasVariants ? item.variants[selectedIdx] : null
                const priceToUse = hasVariants ? (currentVariant?.price ?? item.price ?? 0) : (item.price ?? 0)
                const isInStock = item.stock > 0 && item.status !== 'inactive'
                // Use variant-specific image if available, otherwise use product image or fallback
                const imageUrl = getItemImageUrl(item)

                return (
                  <div 
                    key={item.id} 
                    className="shop-card"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    {/* Wishlist Heart Button */}
                    <button
                      className={`wishlist-heart ${isInWishlist(item.id) ? 'active' : ''}`}
                      onClick={(e) => handleWishlistClick(e, item)}
                      disabled={loading[`wish-${item.id}`]}
                      title={isInWishlist(item.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <span className="heart-icon">{isInWishlist(item.id) ? '❤️' : '🤍'}</span>
                      {feedback[`wish-${item.id}`] && (
                        <span className="feedback-message">{feedback[`wish-${item.id}`]}</span>
                      )}
                    </button>

                    {/* Product Image */}
                    <div className="shop-card-image">
                      <img 
                        src={imageUrl} 
                        alt={item.title} 
                        className="shop-card-photo" 
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = fallbackImageFor(item)
                        }}
                      />
                      <div className="product-icon-overlay">{item.icon}</div>
                      {!isInStock && (
                        <div className="out-of-stock-overlay">Out of Stock</div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="shop-card-info">
                      <h3 className="shop-card-title">{item.title}</h3>
                      <p className="shop-card-description">{item.description}</p>

                      {/* Variant Selector */}
                      <div className="shop-card-price">
                        <span className="price">₹{priceToUse.toLocaleString()}</span>
                      </div>

                      {/* Stock Status */}
                      <div className={`stock-status ${isInStock ? 'in-stock' : 'out-of-stock'}`}>
                        {isInStock ? `${item.stock} in stock` : 'Out of Stock'}
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        className={`shop-btn-primary ${isInCart(item.id) ? 'added' : ''} ${loading[`cart-${item.id}`] ? 'loading' : ''}`}
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
          </section>
        </div>
      </div>

      <style jsx>{`
        .shop-layout {
          position: relative;
          z-index: 1;
        }

        .shop-main-full {
          width: 100%;
        }

        .shop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .shop-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
        }

        .shop-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
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
          position: relative;
        }

        .wishlist-heart:hover {
          transform: scale(1.1);
        }

        .wishlist-heart.active .heart-icon {
          color: #ff3366;
        }

        .heart-icon {
          display: inline-block;
          transition: transform 0.2s ease;
        }

        .wishlist-heart.active .heart-icon {
          animation: heartPulse 0.5s ease;
        }

        @keyframes heartPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }

        .wishlist-heart .feedback-message {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          z-index: 11;
          pointer-events: none;
        }

        .shop-card-image {
          position: relative;
          height: 200px;
          background: linear-gradient(135deg, #f5f5f5 0%, #e9e9e9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .shop-card-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.2s ease;
        }

        .shop-card:hover .shop-card-photo {
          transform: scale(1.03);
        }

        .product-icon-overlay {
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 28px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          padding: 6px 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
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

        .shop-card-info {
          padding: 12px;
        }

        .shop-card-title {
          font-size: 14px;
          font-weight: 600;
          color: #212121;
          margin: 0 0 8px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.3;
        }

        .shop-card-description {
          font-size: 12px;
          color: #878787;
          margin: 0 0 10px 0;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .shop-card-price {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .price {
          font-size: 16px;
          font-weight: bold;
          color: #26a541;
        }.stock-status {
          font-size: 12px;
          margin-bottom: 10px;
          font-weight: 500;
        }

        .stock-status.in-stock {
          color: #388e3c;
        }

        .stock-status.out-of-stock {
          color: #d32f2f;
        }

        .shop-btn-primary {
          width: 100%;
          padding: 10px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .shop-btn-primary:hover {
          background: #0056b3;
        }

        .shop-btn-primary.loading {
          opacity: 0.7;
          cursor: wait;
        }

        .shop-btn-primary.added {
          background: #28a745;
        }

        .shop-btn-primary.added:hover {
          background: #218838;
        }

        .shop-btn-primary:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        /* Category Navigation Styles */
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
        }

        .subcategory-item:last-child {
          border-bottom: none;
        }

        .subcategory-item:hover {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding-left: 30px;
        }

        @media (max-width: 768px) {
          .category-cards {
            grid-template-columns: 1fr;
          }
          
          .shop-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 12px;
          }
        }
      `}</style>
    </main>
  )
}

export default Shop


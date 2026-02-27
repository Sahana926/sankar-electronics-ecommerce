import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCounts } from '../context/CountsContext'
import { getToken } from '../utils/tokenManager'
import { toast } from 'react-toastify'

/**
 * Wires & Cables Component
 * 
 * Dedicated page for wires and cables with sidebar filtering by subcategory
 */
function WiresAndCables() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { refreshCounts } = useCounts()
  const [loading, setLoading] = useState({})
  const [feedback, setFeedback] = useState({})
  const [cartItems, setCartItems] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])
  const [selectedSubcategories, setSelectedSubcategories] = useState([])
  const [selectedVariants, setSelectedVariants] = useState({})
  const [openDropdown, setOpenDropdown] = useState(null)
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

  // Subcategory definitions
  const subcategories = [
    { id: 'wire-1sqmm', label: '1 sq mm Wire (per meter)' },
    { id: 'wire-1.5sqmm', label: '1.5 sq mm Wire (per meter)' },
    { id: 'wire-2.5sqmm', label: '2.5 sq mm Wire (per meter)' },
    { id: 'service-wire', label: '4 sq mm Wire (per meter)' },
    { id: 'lan-cable', label: '6 sq mm Wire (per meter)' }
  ]

  const fallbackImageFor = (item) => {
    const title = (item.title || '').toLowerCase()
    const sub = (item.subcategory || '').toLowerCase()
    const sig = encodeURIComponent(item.id || title || 'product')

    let keyword = 'electrical wire spool'
    if (sub.includes('lan') || title.includes('lan') || title.includes('cat')) keyword = 'network cable closeup'
    else if (title.includes('service')) keyword = 'service wire cable'
    else if (title.includes('frls') || title.includes('fr ') || title.includes('fire')) keyword = 'fire resistant cable'
    return `https://source.unsplash.com/800x600/?${encodeURIComponent(keyword)}&sig=${sig}`
  }

  // Sample products (fallback)
  const sampleProducts = useMemo(() => [
    // 1 sq mm Wires
    {
      id: 'wc-life-plus-1sqmm',
      icon: '🧵',
      title: 'Life Line Plus S3 HRFR Cables 1.0 sq. mm 90 m',
      description: 'Available in black, blue, grey, green, white, yellow and red',
      price: 3075,
      subcategory: 'wire-1sqmm',
      stock: 150,
      variants: [
        { id: 'black', label: 'Black', price: 3075, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg' },
        { id: 'blue', label: 'Blue', price: 3075, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNBA1X50.jpg' },
        { id: 'grey', label: 'Grey', price: 3075, swatch: '#808080', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg' },
        { id: 'green', label: 'Green', price: 3075, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNGA1X50.jpg' },
        { id: 'white', label: 'White', price: 3075, swatch: '#ffffff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg' },
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
      subcategory: 'wire-1sqmm',
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
      subcategory: 'wire-1sqmm',
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
      subcategory: 'wire-1sqmm',
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
      subcategory: 'wire-1sqmm',
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
      subcategory: 'wire-1sqmm',
      stock: 110,
      imageUrl: 'https://cms.polycab.com/media/lohiqjqo/ldis09cyuayl001c004sb034s_img_01.png?format=webp'
    },
    // 1.5 sq mm Wires
    {
      id: 'wc-life-plus-1.5sqmm',
      icon: '🧵',
      title: 'Life Line Plus S3 HRFR Cables 1.5 sq. mm 90 m',
      description: 'Available in black, blue, grey, green, white, yellow and red',
      price: 4500,
      subcategory: 'wire-1.5sqmm',
      stock: 150,
      variants: [
        { id: 'black', label: 'Black', price: 4500, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg' },
        { id: 'blue', label: 'Blue', price: 4500, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNBA1X50.jpg' },
        { id: 'grey', label: 'Grey', price: 4500, swatch: '#808080', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg' },
        { id: 'green', label: 'Green', price: 4500, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNGA1X50.jpg' },
        { id: 'white', label: 'White', price: 4500, swatch: '#ffffff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg' },
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
      subcategory: 'wire-1.5sqmm',
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
      subcategory: 'wire-1.5sqmm',
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
      subcategory: 'wire-1.5sqmm',
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
      subcategory: 'wire-1.5sqmm',
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
      subcategory: 'wire-1.5sqmm',
      stock: 105,
      imageUrl: 'https://cms.polycab.com/media/lohiqjqo/ldis09cyuayl001c004sb034s_img_01.png?format=webp'
    },
    // 2.5 sq mm Wires
    {
      id: 'wc-life-plus-2.5sqmm',
      icon: '🧵',
      title: 'Life Line Plus S3 HRFR Cables 2.5 sq. mm 90 m',
      description: 'Available in black, blue, grey, green, white, yellow and red',
      price: 7185,
      subcategory: 'wire-2.5sqmm',
      stock: 140,
      variants: [
        { id: 'black', label: 'Black', price: 7185, swatch: '#000000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg' },
        { id: 'blue', label: 'Blue', price: 7185, swatch: '#0000ff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNBA1X50.jpg' },
        { id: 'grey', label: 'Grey', price: 7185, swatch: '#808080', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg' },
        { id: 'green', label: 'Green', price: 7185, swatch: '#008000', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNGA1X50.jpg' },
        { id: 'white', label: 'White', price: 7185, swatch: '#ffffff', imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg' },
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
      subcategory: 'wire-2.5sqmm',
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
      subcategory: 'wire-2.5sqmm',
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
      subcategory: 'wire-2.5sqmm',
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
      subcategory: 'wire-2.5sqmm',
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
      subcategory: 'wire-2.5sqmm',
      stock: 100,
      imageUrl: 'https://cms.polycab.com/media/lohiqjqo/ldis09cyuayl001c004sb034s_img_01.png?format=webp'
    },
    // 4 sq mm Wires
    {
      id: 'wc-life-plus-4sqmm',
      icon: '🧵',
      title: 'Life Line Plus S3 HRFR Cables 4 sq. mm 90 m',
      description: 'Available in black, blue, grey, green, white, yellow and red',
      price: 10520,
      subcategory: 'service-wire',
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
      subcategory: 'service-wire',
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
      subcategory: 'service-wire',
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
      subcategory: 'service-wire',
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
      subcategory: 'service-wire',
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
      subcategory: 'service-wire',
      stock: 95,
      imageUrl: 'https://cms.polycab.com/media/lohiqjqo/ldis09cyuayl001c004sb034s_img_01.png?format=webp'
    },
    // 6 sq mm Wires
    {
      id: 'wc-life-plus-6sqmm',
      icon: '🧵',
      title: 'Life Line Plus S3 HRFR Cables 6 sq. mm 90 m',
      description: 'Available in black, blue, grey, green, white, yellow and red',
      price: 13410,
      subcategory: 'lan-cable',
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
      subcategory: 'lan-cable',
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
      subcategory: 'lan-cable',
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
      subcategory: 'lan-cable',
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
      subcategory: 'lan-cable',
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
      subcategory: 'lan-cable',
      stock: 90,
      imageUrl: 'https://cms.polycab.com/media/lohiqjqo/ldis09cyuayl001c004sb034s_img_01.png?format=webp'
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
        const category = encodeURIComponent('Wires & Cables')
        const res = await fetch(`${API_BASE}/api/products?category=${category}&limit=200`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load products')
        
        // Helper function to determine subcategory from product name/features
        const determineSubcategory = (product) => {
          const name = (product.name || '').toLowerCase()
          const desc = (product.description || '').toLowerCase()
          const text = name + ' ' + desc
          
          // Check features
          const features = product.features
          const featureText = Array.isArray(features)
            ? features.map(f => `${f?.name || ''} ${f?.value || ''}`).join(' ')
            : Object.entries(features || {}).map(([k, v]) => `${k} ${v}`).join(' ')
          const normalizedFeatureText = featureText.toLowerCase()
          const allText = text + ' ' + normalizedFeatureText
          
          // Determine based on wire size
          if (allText.includes('1 sq') || allText.includes('1sq') || allText.includes('1mm')) {
            return 'wire-1sqmm'
          } else if (allText.includes('1.5 sq') || allText.includes('1.5sq') || allText.includes('1.5mm')) {
            return 'wire-1.5sqmm'
          } else if (allText.includes('2.5 sq') || allText.includes('2.5sq') || allText.includes('2.5mm')) {
            return 'wire-2.5sqmm'
          } else if (allText.includes('4 sq') || allText.includes('4sq') || allText.includes('4mm') || allText.includes('service')) {
            return 'service-wire'
          } else if (allText.includes('6 sq') || allText.includes('6sq') || allText.includes('6mm') || allText.includes('lan') || allText.includes('cat')) {
            return 'lan-cable'
          }
          
          return 'wire-1sqmm' // Default
        }
        
        const mapped = (data.data || []).map(p => ({
          id: p._id,
          icon: '📦',
          title: p.name,
          description: p.description || '',
          price: p.price,
          subcategory: determineSubcategory(p),
          stock: p.stockQty ?? 0,
          imageUrl: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : fallbackImageFor({ id: p._id, title: p.name, subcategory: '' }),
          productRaw: p,
        }))
        if (mapped.length > 0) setProducts(mapped)
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
      navigate('/login', { state: { from: '/wires-cables' } })
      return
    }

    if (isInCart(item.id)) return

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
          productId: item.id,
          name: item.title,
          description: item.description || '',
          price: item.price,
          quantity: 1,
          icon: item.icon || '📦',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to cart')
      }

      setCartItems(prev => [...prev, {
        productId: item.id,
        name: item.title,
        price: item.price,
        quantity: 1,
        icon: item.icon || '📦',
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
      navigate('/login', { state: { from: '/wires-cables' } })
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
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to wishlist')
      }

      setWishlistItems(prev => [...prev, {
        productId: item.id,
        name: item.title,
        price: item.price,
        icon: item.icon || '❤️',
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
  
  const handleRemoveFromWishlist = async (e, item) => {
    e.stopPropagation()
    
    setLoading((prev) => ({ ...prev, [`wish-${item.id}`]: true }))
    
    try {
      const token = getToken('user')
      const wishlistItem = wishlistItems.find(wishItem => wishItem.productId === item.id)
      if (!wishlistItem) return
      
      const response = await fetch(`${API_BASE}/api/wishlist/${wishlistItem._id || wishlistItem.productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('Failed to remove from wishlist')
      }
      
      setWishlistItems(prev => prev.filter(wishItem => wishItem.productId !== item.id))
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
                  onClick={() => navigate('/shop')}
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
                            } else if (label === 'Fasteners') {
                              navigate('/fasteners')
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
          <h1>Wires & Cables</h1>
          <p className="subtitle">Premium quality electrical wires and cables</p>
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
                const selectedIdx = selectedVariants[item.id] ?? 0
                const hasVariants = Array.isArray(item.variants) && item.variants.length > 0
                const currentVariant = hasVariants ? item.variants[selectedIdx] : null
                const priceToUse = hasVariants ? (currentVariant?.price ?? item.price ?? 0) : (item.price ?? 0)
                const isInStock = item.stock > 0
                // Use variant-specific image if available, otherwise use product image or fallback
                const imageUrl = (hasVariants && currentVariant?.imageUrl) ? currentVariant.imageUrl : (item.imageUrl || fallbackImageFor(item))

                return (
                  <div 
                    key={item.id} 
                    className="product-card"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    {/* Wishlist Heart Button */}
                    <button
                      className={`wishlist-heart ${isInWishlist(item.id) ? 'active' : ''}`}
                      onClick={(e) => handleWishlistClick(e, item)}
                      disabled={loading[`wish-${item.id}`]}
                      title={isInWishlist(item.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      {isInWishlist(item.id) ? '❤️' : '🤍'}
                    </button>

                    {/* Product Image */}
                    <div className="product-image">
                      <img src={imageUrl} alt={item.title} className="product-photo" loading="lazy" />
                      <div className="product-icon">{item.icon}</div>
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
                        {isInStock ? `${item.stock}m in stock` : 'Out of Stock'}
                      </div>

                      {/* Add to Cart Button */}
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

        .variant-selector {
          display: flex;
          gap: 8px;
          margin: 0.5rem 0 0.75rem 0;
          flex-wrap: wrap;
        }

        .variant-chip {
          border: 1px solid #ddd;
          border-radius: 16px;
          padding: 6px 10px;
          font-size: 0.85rem;
          cursor: pointer;
          background: #f8f8f8;
          color: #333;
          transition: all 0.2s ease;
        }

        .variant-chip:hover {
          border-color: #aaa;
          background: #f0f0f0;
        }

        .variant-chip.active {
          border-color: #007bff;
          background: #e7f1ff;
          color: #0056b3;
          font-weight: 500;
        }

        .swatch-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid #ccc;
          display: inline-block;
          margin-right: 8px;
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

export default WiresAndCables

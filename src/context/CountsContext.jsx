import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { getToken } from '../utils/tokenManager'

const CountsContext = createContext()

export const CountsProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [ordersCount, setOrdersCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

  const fetchWithTimeout = async (url, options = {}, timeout = 4000) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    try {
      return await fetch(url, { ...options, signal: controller.signal })
    } finally {
      clearTimeout(timer)
    }
  }

  const fetchCounts = useCallback(async () => {
    try {
      const token = getToken('user')
      // Only fetch counts for user sessions, not admin sessions
      if (!token || !isAuthenticated || user?.role === 'admin') {
        setCartCount(0)
        setWishlistCount(0)
        setOrdersCount(0)
        setLoading(false)
        return
      }

      // Fetch all counts in parallel
      const [cartResponse, wishlistResponse, ordersResponse] = await Promise.all([
        fetchWithTimeout(`${API_BASE}/api/cart/count`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }).catch(() => ({ ok: false })),
        fetchWithTimeout(`${API_BASE}/api/wishlist/count`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }).catch(() => ({ ok: false })),
        fetchWithTimeout(`${API_BASE}/api/orders/count`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }).catch(() => ({ ok: false })),
      ])

      if (cartResponse.ok) {
        const cartData = await cartResponse.json()
        setCartCount(cartData.count || 0)
      } else {
        setCartCount(0)
      }

      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json()
        setWishlistCount(wishlistData.count || 0)
      } else {
        setWishlistCount(0)
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrdersCount(ordersData.count || 0)
      } else {
        setOrdersCount(0)
      }
    } catch (error) {
      console.error('Error fetching counts:', error)
    } finally {
      setLoading(false)
    }
  }, [API_BASE, isAuthenticated])

  // Fetch counts on mount and when user/auth changes
  useEffect(() => {
    fetchCounts()
    
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000)
    
    return () => clearInterval(interval)
  }, [user, isAuthenticated, fetchCounts])

  // Refresh function that can be called manually
  const refreshCounts = useCallback(() => {
    fetchCounts()
  }, [fetchCounts])

  return (
    <CountsContext.Provider value={{
      cartCount,
      wishlistCount,
      ordersCount,
      loading,
      refreshCounts,
    }}>
      {children}
    </CountsContext.Provider>
  )
}

export const useCounts = () => {
  const context = useContext(CountsContext)
  if (!context) {
    throw new Error('useCounts must be used within CountsProvider')
  }
  return context
}

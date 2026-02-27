import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * Custom hook to fetch and manage cart, wishlist, and order counts
 * Automatically refreshes on page load and when user changes
 */
export const useCounts = () => {
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

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token || !isAuthenticated) {
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
      }

      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json()
        setWishlistCount(wishlistData.count || 0)
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrdersCount(ordersData.count || 0)
      }
    } catch (error) {
      console.error('Error fetching counts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch counts on mount and when user/auth changes
  useEffect(() => {
    fetchCounts()
    
    // Refresh counts every 30 seconds to reduce background chatter
    const interval = setInterval(fetchCounts, 30000)
    
    return () => clearInterval(interval)
  }, [user, isAuthenticated])

  // Refresh function that can be called manually
  const refreshCounts = () => {
    fetchCounts()
  }

  return {
    cartCount,
    wishlistCount,
    ordersCount,
    loading,
    refreshCounts,
  }
}


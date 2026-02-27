import express from 'express'
import Wishlist from '../models/Wishlist.js'
import Product from '../models/Product.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

const resolveImageUrl = async (productId) => {
  if (!productId) return ''
  try {
    const product = await Product.findById(productId).select('images colorVariants')
    if (!product) return ''
    if (Array.isArray(product.images) && product.images.length > 0) return product.images[0]
    if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
      const firstVariant = product.colorVariants[0]
      if (Array.isArray(firstVariant.images) && firstVariant.images.length > 0) return firstVariant.images[0]
    }
    return ''
  } catch (error) {
    return ''
  }
}

// Get wishlist count - MUST be before /:itemId route to match correctly
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
    const count = wishlist ? wishlist.items.length : 0
    const items = wishlist ? wishlist.items : []
    res.json({ 
      count,
      items: items.map(item => ({
        id: item._id,
        productId: item.productId,
        name: item.name,
        price: item.price
      }))
    })
  } catch (error) {
    res.json({ count: 0, items: [] })
  }
})

// Get user's wishlist - retains data for returning users
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Find existing wishlist for user (data persists in MongoDB)
    let wishlist = await Wishlist.findOne({ user: req.user._id })

    // If no wishlist exists, create a new empty one
    if (!wishlist) {
      wishlist = new Wishlist({ 
        user: req.user._id, 
        userEmail: req.user.email,
        items: [] 
      })
      await wishlist.save()
    }

    let hasUpdates = false
    const missingImageIds = wishlist.items
      .filter(item => !item.imageUrl && item.productId)
      .map(item => item.productId)
      .filter(id => {
        // Filter out invalid ObjectIds (e.g., variant suffixes like "id-White")
        if (typeof id !== 'string') return false
        return /^[0-9a-fA-F]{24}$/.test(id)
      })

    if (missingImageIds.length > 0) {
      const products = await Product.find({ _id: { $in: missingImageIds } }).select('images colorVariants')
      const imageMap = new Map()
      products.forEach((product) => {
        let imageUrl = ''
        if (Array.isArray(product.images) && product.images.length > 0) imageUrl = product.images[0]
        else if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
          const firstVariant = product.colorVariants[0]
          if (Array.isArray(firstVariant.images) && firstVariant.images.length > 0) imageUrl = firstVariant.images[0]
        }
        imageMap.set(String(product._id), imageUrl)
      })

      wishlist.items.forEach((item) => {
        if (!item.imageUrl && imageMap.has(item.productId)) {
          item.imageUrl = imageMap.get(item.productId)
          hasUpdates = true
        }
      })
    }

    if (hasUpdates) {
      await wishlist.save()
    }

    // Return wishlist items (empty array if new user, existing items if returning user)
    res.json({
      items: wishlist.items,
      message: wishlist.items.length > 0 ? 'Wishlist retrieved successfully' : 'Wishlist is empty',
    })
  } catch (error) {
    console.error('Get wishlist error:', error)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

// Add item to wishlist
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, name, description, price, icon, imageUrl } = req.body

    let wishlist = await Wishlist.findOne({ user: req.user._id })

    if (!wishlist) {
      wishlist = new Wishlist({ 
        user: req.user._id, 
        userEmail: req.user.email,
        items: [] 
      })
    }

    // Check if item already exists
    const existingItem = wishlist.items.find(item => item.productId === productId)

    if (existingItem) {
      return res.status(400).json({ message: 'Item already in wishlist' })
    }

    const resolvedImageUrl = imageUrl || await resolveImageUrl(productId)

    wishlist.items.push({
      productId,
      name,
      description: description || '',
      price,
      imageUrl: resolvedImageUrl || '',
      icon: icon || '📦',
    })

    await wishlist.save()

    res.json({ message: 'Item added to wishlist', wishlist: wishlist.items })
  } catch (error) {
    console.error('Add to wishlist error:', error)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

// Remove item from wishlist
router.delete('/:itemId', authenticateToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' })
    }

    wishlist.items.pull(req.params.itemId)
    await wishlist.save()

    res.json({ message: 'Item removed from wishlist', wishlist: wishlist.items })
  } catch (error) {
    console.error('Remove from wishlist error:', error)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

export default router


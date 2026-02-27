import express from 'express'
import Cart from '../models/Cart.js'
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

// Get cart count - MUST be before /:itemId route to match correctly
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    const count = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0
    const items = cart ? cart.items : []
    res.json({ 
      count,
      items: items.map(item => ({
        id: item._id,
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    })
  } catch (error) {
    res.json({ count: 0, items: [] })
  }
})

// Get user's cart - retains data for returning users
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Find existing cart for user (data persists in MongoDB)
    let cart = await Cart.findOne({ user: req.user._id })

    // If no cart exists, create a new empty one
    if (!cart) {
      cart = new Cart({ 
        user: req.user._id, 
        userEmail: req.user.email,
        items: [] 
      })
      await cart.save()
    }

    let hasUpdates = false
    const missingImageIds = cart.items
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

      cart.items.forEach((item) => {
        if (!item.imageUrl && imageMap.has(item.productId)) {
          item.imageUrl = imageMap.get(item.productId)
          hasUpdates = true
        }
      })
    }

    if (hasUpdates) {
      await cart.save()
    }

    // Return cart items (empty array if new user, existing items if returning user)
    res.json({
      items: cart.items,
      message: cart.items.length > 0 ? 'Cart retrieved successfully' : 'Cart is empty',
    })
  } catch (error) {
    console.error('Get cart error:', error)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

// Add item to cart
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, name, description, price, quantity, icon, imageUrl } = req.body

    let cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
      cart = new Cart({ 
        user: req.user._id, 
        userEmail: req.user.email,
        items: [] 
      })
    }

    // Check if item already exists
    const existingItem = cart.items.find(item => item.productId === productId)

    const resolvedImageUrl = imageUrl || await resolveImageUrl(productId)

    if (existingItem) {
      existingItem.quantity += quantity || 1
      if (!existingItem.imageUrl && resolvedImageUrl) {
        existingItem.imageUrl = resolvedImageUrl
      }
    } else {
      cart.items.push({
        productId,
        name,
        description: description || '',
        price,
        quantity: quantity || 1,
        imageUrl: resolvedImageUrl || '',
        icon: icon || '📦',
      })
    }

    await cart.save()

    res.json({ message: 'Item added to cart', cart: cart.items })
  } catch (error) {
    console.error('Add to cart error:', error)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

// Update cart item quantity
router.put('/:itemId', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body
    const cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    const item = cart.items.id(req.params.itemId)
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    item.quantity = quantity
    await cart.save()

    res.json({ message: 'Cart updated', cart: cart.items })
  } catch (error) {
    console.error('Update cart error:', error)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

// Remove item from cart
router.delete('/:itemId', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    cart.items.pull(req.params.itemId)
    await cart.save()

    res.json({ message: 'Item removed from cart', cart: cart.items })
  } catch (error) {
    console.error('Remove from cart error:', error)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

export default router


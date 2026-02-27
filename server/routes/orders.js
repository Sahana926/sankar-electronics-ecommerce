import express from 'express'
import mongoose from 'mongoose'
import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Get user's orders
// By default, cancelled orders are excluded. Pass ?includeCancelled=true to include them.
router.get('/', authenticateToken, async (req, res) => {
  try {
    const includeCancelled = String(req.query.includeCancelled).toLowerCase() === 'true'
    const filter = { user: req.user._id }
    if (!includeCancelled) {
      filter.status = { $ne: 'cancelled' }
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 }) // Most recent first

    res.json({ 
      orders,
      message: orders.length > 0 ? 'Orders retrieved successfully' : 'No orders found'
    })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

// Get orders count
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
    const count = orders.length
    res.json({ 
      count,
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        items: order.items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        createdAt: order.createdAt
      }))
    })
  } catch (error) {
    res.json({ count: 0, orders: [] })
  }
})

// Create new order from cart
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      paymentStatus,
      transactionId,
      items,
      totalAmount,
      total,
    } = req.body

    // If items are provided in request, use them (from checkout)
    let orderItems = items
    let orderTotal = Number.isFinite(totalAmount)
      ? totalAmount
      : (Number.isFinite(total) ? total : null)

    // Otherwise, get from cart
    if (!orderItems || orderItems.length === 0) {
      const cart = await Cart.findOne({ user: req.user._id })

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' })
      }

      orderItems = cart.items
      orderTotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

      // Backfill missing userEmail on legacy carts to satisfy schema requirements
      if (!cart.userEmail) {
        cart.userEmail = req.user.email || 'user@example.com'
      }
    }

    // Stock validation and decrement
    for (const line of orderItems) {
      if (!line.productId || !mongoose.Types.ObjectId.isValid(line.productId)) {
        // Skip validation for non-DB products (e.g., legacy/sample items)
        continue
      }
      const product = await Product.findOne({ _id: line.productId, softDeleted: false })
      if (!product || product.status !== 'active') {
        return res.status(400).json({ message: `Product unavailable: ${line.name}` })
      }
      if (product.stockQty < line.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${line.name}` })
      }
    }

    for (const line of orderItems) {
      if (!line.productId || !mongoose.Types.ObjectId.isValid(line.productId)) {
        continue
      }
      await Product.findByIdAndUpdate(line.productId, { $inc: { stockQty: -line.quantity } })
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    if (!Number.isFinite(orderTotal)) {
      orderTotal = (orderItems || []).reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0)
    }

    const order = new Order({
      user: req.user._id,
      userEmail: req.user.email || 'user@example.com',
      orderNumber: orderNumber,
      items: orderItems,
      total: orderTotal,
      status: paymentStatus === 'success' ? 'confirmed' : 'processing',
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentStatus || 'pending',
      transactionId: transactionId || '',
    })

    await order.save()

    // Clear cart after order (if items came from cart)
    if (!items || items.length === 0) {
      const cart = await Cart.findOne({ user: req.user._id })
      if (cart) {
        cart.items = []
        await cart.save()
      }
    }

    res.status(201).json({ message: 'Order created successfully', order })
  } catch (error) {
    console.error('Create order error:', error)
    console.error('Order request payload:', {
      user: req.user?._id,
      body: req.body,
    })
    res.status(500).json({ message: error.message || 'Server error. Please try again later.' })
  }
})

// Process payment (called before creating order)
router.post('/process-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentMethod, amount, upiId, recipientUpiId } = req.body

    // Validate required fields
    if (!paymentMethod || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment method and amount are required' 
      })
    }

    // Process UPI payment
    if (paymentMethod === 'upi') {
      if (!upiId || !recipientUpiId) {
        return res.status(400).json({ 
          success: false, 
          message: 'UPI ID and recipient UPI ID are required' 
        })
      }

      // Validate UPI ID format
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/
      if (!upiRegex.test(upiId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid UPI ID format' 
        })
      }

      // Simulate successful payment (in production: integrate with payment gateway)
      const transactionId = `UPI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      console.log('Payment Processed:', {
        transactionId,
        paymentMethod,
        amount,
        from: upiId,
        to: recipientUpiId,
        status: 'success',
        timestamp: new Date().toISOString(),
        userId: req.user._id
      })

      return res.status(200).json({
        success: true,
        status: 'success',
        transactionId,
        message: `Payment of ₹${amount} sent to ${recipientUpiId}`
      })
    }

    // Cash on Delivery
    if (paymentMethod === 'cod') {
      const transactionId = `COD-${Date.now()}`
      return res.status(200).json({
        success: true,
        status: 'pending',
        transactionId,
        message: 'Order placed with Cash on Delivery'
      })
    }

    return res.status(400).json({ 
      success: false, 
      message: 'Unsupported payment method' 
    })

  } catch (error) {
    console.error('Payment processing error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Payment processing failed', 
      error: error.message 
    })
  }
})

export default router
 
// Cancel an order
router.patch('/:orderId/cancel', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params

    const order = await Order.findOne({ _id: orderId, user: req.user._id })

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' })
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Delivered orders cannot be cancelled' })
    }

    // Optional: prevent cancel if shipped
    if (order.status === 'shipped') {
      return res.status(400).json({ message: 'Shipped orders cannot be cancelled' })
    }

    order.status = 'cancelled'
    await order.save()

    return res.json({ message: 'Order cancelled successfully', order })
  } catch (error) {
    console.error('Cancel order error:', error)
    return res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})


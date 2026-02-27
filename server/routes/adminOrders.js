import express from 'express'
import Order from '../models/Order.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

const parseNumber = (value, fallback) => {
  const n = Number(value)
  return Number.isNaN(n) ? fallback : n
}

// List orders with filters
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, paymentStatus, search = '', page = 1, limit = 20 } = req.query
    const filter = {}
    if (status) filter.status = status
    if (paymentStatus) filter.paymentStatus = paymentStatus
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
      ]
    }

    const pageNum = parseNumber(page, 1)
    const limitNum = parseNumber(limit, 20)
    const skip = (pageNum - 1) * limitNum

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(filter),
    ])

    res.json({
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    })
  } catch (error) {
    console.error('Admin list orders error:', error)
    res.status(500).json({ message: 'Failed to list orders' })
  }
})

// Get single order
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  } catch (error) {
    console.error('Admin get order error:', error)
    res.status(500).json({ message: 'Failed to fetch order' })
  }
})

// Update order status
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const allowed = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' })

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json({ message: 'Status updated', order })
  } catch (error) {
    console.error('Admin update order status error:', error)
    res.status(500).json({ message: 'Failed to update status' })
  }
})

// Update payment status
router.patch('/:id/payment', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { paymentStatus } = req.body
    const allowed = ['pending', 'success', 'failed', 'paid', 'refunded']
    if (!allowed.includes(paymentStatus)) return res.status(400).json({ message: 'Invalid payment status' })

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    )
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json({ message: 'Payment status updated', order })
  } catch (error) {
    console.error('Admin update payment status error:', error)
    res.status(500).json({ message: 'Failed to update payment status' })
  }
})

export default router

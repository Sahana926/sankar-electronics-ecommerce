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

    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    order.status = status
    if (status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date()
    }
    await order.save()

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

// Review return request (approve/reject)
router.patch('/:id/return-review', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const decision = String(req.body?.decision || '').toLowerCase()
    const note = String(req.body?.note || '').trim()

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision. Use approved or rejected.' })
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (!order.returnRequest || order.returnRequest.status !== 'requested') {
      return res.status(400).json({ message: 'No pending return request found for this order.' })
    }

    order.returnRequest.status = decision
    order.returnRequest.reviewedAt = new Date()
    order.returnRequest.reviewNote = note

    // Auto-mark refund for prepaid orders when return is approved
    if (decision === 'approved' && order.paymentMethod !== 'cod') {
      order.paymentStatus = 'refunded'
    }

    await order.save()

    return res.json({
      message: decision === 'approved' ? 'Return request approved' : 'Return request rejected',
      order,
    })
  } catch (error) {
    console.error('Admin return review error:', error)
    return res.status(500).json({ message: 'Failed to review return request' })
  }
})

export default router

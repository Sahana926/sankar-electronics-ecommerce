import express from 'express'
import Order from '../models/Order.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import Razorpay from 'razorpay'

const router = express.Router()

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || ''
  const keySecret = process.env.RAZORPAY_KEY_SECRET || ''
  if (!keyId || !keySecret) return null
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

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

    // Auto-refund prepaid orders when return is approved
    if (decision === 'approved' && order.paymentMethod !== 'cod') {
      const paymentId = String(order.transactionId || '')

      if (paymentId.startsWith('pay_')) {
        const rzp = getRazorpay()
        if (!rzp) {
          return res.status(500).json({
            message: 'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on backend.',
          })
        }

        const amountInPaise = Math.round((order.total || 0) * 100)
        if (amountInPaise <= 0) {
          return res.status(400).json({ message: 'Invalid order amount for refund.' })
        }

        try {
          const refund = await rzp.payments.refund(paymentId, {
            amount: amountInPaise,
            notes: {
              orderNumber: order.orderNumber,
              reason: 'Damaged product return approved',
            },
          })

          order.paymentStatus = 'refunded'
          order.refund = {
            status: 'processed',
            method: 'razorpay',
            amount: amountInPaise / 100,
            paymentId,
            refundId: refund.id || '',
            processedAt: new Date(),
            note: 'Refund processed via Razorpay',
          }
        } catch (refundError) {
          order.refund = {
            status: 'failed',
            method: 'razorpay',
            amount: amountInPaise / 100,
            paymentId,
            refundId: '',
            processedAt: null,
            note: refundError?.message || 'Razorpay refund failed',
          }
          await order.save()
          return res.status(500).json({ message: `Refund failed: ${refundError?.message || 'Unknown error'}` })
        }
      } else {
        // Non-Razorpay transaction IDs require manual payout.
        order.refund = {
          status: 'manual_required',
          method: 'manual',
          amount: Number(order.total || 0),
          paymentId,
          refundId: '',
          processedAt: null,
          note: 'Automatic refund unavailable for this transaction. Process manually.',
        }
      }
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

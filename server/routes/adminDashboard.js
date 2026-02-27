import express from 'express'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import User from '../models/User.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/metrics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [allProducts, totalProducts, userSideProducts, totalOrders, totalUsers, revenueAgg, recentOrders] = await Promise.all([
      Product.find({ softDeleted: false }).select('stockQty colorVariants'),
      Product.countDocuments({ softDeleted: false }),
      Product.countDocuments({ softDeleted: false, status: 'active' }), // Products visible on user side
      Order.countDocuments(),
      User.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: { $in: ['success', 'paid', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).select('orderNumber total status paymentStatus createdAt userEmail'),
    ])

    const totalRevenue = revenueAgg[0]?.total || 0

    const lowStock = allProducts.filter((p) => {
      const actualStock = Array.isArray(p.colorVariants) && p.colorVariants.length > 0
        ? p.colorVariants.reduce((sum, v) => sum + (v.stockQty || 0), 0)
        : (p.stockQty || 0)
      return actualStock > 0 && actualStock < 10
    }).length

    const outOfStock = allProducts.filter((p) => {
      const actualStock = Array.isArray(p.colorVariants) && p.colorVariants.length > 0
        ? p.colorVariants.reduce((sum, v) => sum + (v.stockQty || 0), 0)
        : (p.stockQty || 0)
      return actualStock === 0
    }).length

    res.json({
      totalProducts,
      userSideProducts, // Count of products visible on user side
      totalOrders,
      totalUsers,
      totalRevenue,
      lowStock,
      outOfStock,
      recentOrders,
    })
  } catch (error) {
    console.error('Dashboard metrics error:', error)
    res.status(500).json({ message: 'Failed to load metrics' })
  }
})

// Get all users for admin
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('📊 Users endpoint called for admin')
    console.log('Authenticated user:', req.user._id, 'Role:', req.user.role)
    
    const users = await User.find({})
    console.log(`✅ Found ${users.length} users in database`)
    
    // Map to simple objects without password
    const userData = users.map(user => ({
      _id: user._id,
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user',
      createdAt: user.createdAt
    }))
    
    res.json({ data: userData })
  } catch (error) {
    console.error('❌ Error in /users endpoint:', error.message)
    console.error('Stack:', error.stack)
    res.status(500).json({ message: error.message })
  }
})

// Get low stock products report
router.get('/reports/low-stock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const allProducts = await Product.find({ softDeleted: false })

    const lowStockProducts = allProducts.filter((p) => {
      const actualStock = Array.isArray(p.colorVariants) && p.colorVariants.length > 0
        ? p.colorVariants.reduce((sum, v) => sum + (v.stockQty || 0), 0)
        : (p.stockQty || 0)
      return actualStock > 0 && actualStock < 10
    })

    res.json({ data: lowStockProducts })
  } catch (error) {
    console.error('Failed to load low stock products:', error)
    res.status(500).json({ message: 'Failed to load low stock products' })
  }
})

// Get out of stock products report
router.get('/reports/out-of-stock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const allProducts = await Product.find({ softDeleted: false })

    const outOfStockProducts = allProducts.filter((p) => {
      const actualStock = Array.isArray(p.colorVariants) && p.colorVariants.length > 0
        ? p.colorVariants.reduce((sum, v) => sum + (v.stockQty || 0), 0)
        : (p.stockQty || 0)
      return actualStock === 0
    })

    res.json({ data: outOfStockProducts })
  } catch (error) {
    console.error('Failed to load out of stock products:', error)
    res.status(500).json({ message: 'Failed to load out of stock products' })
  }
})

export default router

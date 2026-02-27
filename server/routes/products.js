import express from 'express'
import Product from '../models/Product.js'

const router = express.Router()

// Public/products for user side: only active and not soft-deleted
router.get('/', async (req, res) => {
  try {
    console.log('🛒 GET /api/products', req.query)
    const { search = '', category, sort = 'createdAt:desc', page = 1, limit = 20 } = req.query
    const filter = { status: 'active', softDeleted: false }
    if (category) filter.category = category
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ]
    }

    const [sortField, sortDirRaw] = sort.split(':')
    const sortDir = sortDirRaw === 'asc' ? 1 : -1
    const allowedSort = ['price', 'stockQty', 'createdAt']
    const sortObj = allowedSort.includes(sortField) ? { [sortField]: sortDir } : { createdAt: -1 }

    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20
    const skip = (pageNum - 1) * limitNum

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ])
    console.log(`📦 Products query: filter=${JSON.stringify(filter)} total=${total} returned=${items.length}`)

    res.json({
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    })
  } catch (error) {
    console.error('Public list products error:', error)
    res.status(500).json({ message: 'Failed to load products' })
  }
})

// Public single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, softDeleted: false, status: 'active' })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (error) {
    console.error('Public get product error:', error)
    res.status(500).json({ message: 'Failed to load product' })
  }
})

export default router

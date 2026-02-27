import express from 'express'
import Product from '../models/Product.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

const parseNumber = (value, fallback) => {
  const n = Number(value)
  return Number.isNaN(n) ? fallback : n
}

// List products with search/filter/sort/pagination
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      search = '',
      category,
      status,
      includeDeleted = 'false',
      sort = 'createdAt:desc',
      page = 1,
      limit = 20,
    } = req.query

    const filter = {}
    if (includeDeleted !== 'true') filter.softDeleted = false
    if (status) filter.status = status
    if (category) filter.category = category

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ]
    }

    const [sortField, sortDirRaw] = sort.split(':')
    const sortDir = sortDirRaw === 'asc' ? 1 : -1
    const allowedSort = ['price', 'stockQty', 'createdAt', 'updatedAt']
    const sortObj = allowedSort.includes(sortField) ? { [sortField]: sortDir } : { createdAt: -1 }

    const pageNum = parseNumber(page, 1)
    const limitNum = parseNumber(limit, 20)
    const skip = (pageNum - 1) * limitNum

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ])

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
    console.error('List products error:', error)
    res.status(500).json({ message: 'Failed to list products' })
  }
})

// Get single product
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ message: 'Failed to fetch product' })
  }
})

// Create product
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description = '',
      category = '',
      subcategory = '',
      price,
      discountPrice = 0,
      stockQty,
      sku,
      images = [],
      // New fields for advanced product data
      colorVariants = [],
      features = [],
      status = 'active',
    } = req.body

    console.log('📝 Creating product:', { name, category, subcategory, price, stockQty, featuresType: typeof features, featuresLength: Array.isArray(features) ? features.length : 'N/A' })

    if (!name || price === undefined || stockQty === undefined) {
      return res.status(400).json({ message: 'name, price, and stockQty are required' })
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      subcategory: subcategory?.trim() || '',
      price,
      discountPrice,
      stockQty,
      sku: sku?.trim(),
      images,
      colorVariants,
      features,
      status,
    })

    console.log('✅ Product created successfully:', product._id)
    res.status(201).json(product)
  } catch (error) {
    console.error('❌ Create product error:', error.message)
    console.error('Full error:', error)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Product with this SKU already exists' })
    }
    res.status(500).json({ message: error.message || 'Failed to create product' })
  }
})

// Bulk create products (for syncing from user side)
router.post('/bulk', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { products } = req.body
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'products array is required' })
    }

    const results = { created: 0, updated: 0, errors: [] }

    for (const productData of products) {
      try {
        const {
          id,
          title,
          description = '',
          price,
          originalPrice,
          stock,
          category = '',
          subcategory = '',
          sku,
          imageUrl,
        } = productData

        if (!title || price === undefined || stock === undefined) {
          results.errors.push({ product: title || id, error: 'Missing required fields' })
          continue
        }

        const productName = title.trim()
        const productCategory = category || 'general'
        const productSubcategory = subcategory || ''
        const productSku = sku || id || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const productImages = imageUrl ? [imageUrl] : []

        // Check if product exists by SKU or name
        const existingProduct = await Product.findOne({
          $or: [{ sku: productSku }, { name: productName }],
        })

        if (existingProduct) {
          // Update existing product
          existingProduct.name = productName
          existingProduct.description = description.trim()
          existingProduct.category = productCategory.trim()
          existingProduct.subcategory = productSubcategory.trim()
          existingProduct.price = originalPrice || price
          existingProduct.discountPrice = originalPrice && originalPrice > price ? price : 0
          existingProduct.stockQty = stock
          existingProduct.images = productImages.length > 0 ? productImages : existingProduct.images
          existingProduct.status = 'active'
          existingProduct.softDeleted = false
          await existingProduct.save()
          results.updated++
        } else {
          // Create new product
          await Product.create({
            name: productName,
            description: description.trim(),
            category: productCategory.trim(),
            subcategory: productSubcategory.trim(),
            price: originalPrice || price,
            discountPrice: originalPrice && originalPrice > price ? price : 0,
            stockQty: stock,
            sku: productSku,
            images: productImages,
            status: 'active',
          })
          results.created++
        }
      } catch (err) {
        results.errors.push({ product: productData.title || productData.id, error: err.message })
      }
    }

    res.json({
      message: `Sync completed: ${results.created} created, ${results.updated} updated`,
      results,
    })
  } catch (error) {
    console.error('Bulk create products error:', error)
    res.status(500).json({ message: 'Failed to sync products' })
  }
})

// Update product
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updates = { ...req.body }
    delete updates._id
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ message: 'Failed to update product' })
  }
})

// Soft delete product
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { softDeleted: true, status: 'inactive' },
      { new: true }
    )
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json({ message: 'Product soft deleted', product })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ message: 'Failed to delete product' })
  }
})

// Restore product
router.patch('/:id/restore', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { softDeleted: false, status: 'active' },
      { new: true }
    )
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json({ message: 'Product restored', product })
  } catch (error) {
    console.error('Restore product error:', error)
    res.status(500).json({ message: 'Failed to restore product' })
  }
})

// Update stock
router.patch('/:id/stock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { stockQty, action, quantity } = req.body
    
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    let newStockQty = stockQty

    // Support increment/decrement actions
    if (action === 'increment' && quantity !== undefined) {
      newStockQty = product.stockQty + Number(quantity)
    } else if (action === 'decrement' && quantity !== undefined) {
      newStockQty = Math.max(0, product.stockQty - Number(quantity))
    } else if (stockQty === undefined) {
      return res.status(400).json({ message: 'stockQty is required or use action with quantity' })
    }

    product.stockQty = newStockQty
    await product.save()

    res.json({ message: 'Stock updated', product })
  } catch (error) {
    console.error('Update stock error:', error)
    res.status(500).json({ message: 'Failed to update stock' })
  }
})

// Bulk update stock
router.patch('/bulk/stock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { updates } = req.body // Array of { id, stockQty } or { id, action, quantity }
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'updates array is required' })
    }

    const results = { updated: 0, errors: [] }

    for (const update of updates) {
      try {
        const { id, stockQty, action, quantity } = update
        const product = await Product.findById(id)
        if (!product) {
          results.errors.push({ id, error: 'Product not found' })
          continue
        }

        let newStockQty = stockQty
        if (action === 'increment' && quantity !== undefined) {
          newStockQty = product.stockQty + Number(quantity)
        } else if (action === 'decrement' && quantity !== undefined) {
          newStockQty = Math.max(0, product.stockQty - Number(quantity))
        } else if (stockQty === undefined) {
          results.errors.push({ id, error: 'Missing stockQty or action' })
          continue
        }

        product.stockQty = newStockQty
        await product.save()
        results.updated++
      } catch (err) {
        results.errors.push({ id: update.id, error: err.message })
      }
    }

    res.json({
      message: `Stock updated for ${results.updated} products`,
      results,
    })
  } catch (error) {
    console.error('Bulk update stock error:', error)
    res.status(500).json({ message: 'Failed to update stock' })
  }
})

// Get inventory summary
router.get('/inventory/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Fetch all products to calculate actual stock
    const allProducts = await Product.find({ softDeleted: false }).select('stockQty colorVariants category')
    
    console.log(`📊 Inventory Summary: Fetched ${allProducts.length} products`)
    
    // Calculate actual stock for each product
    const productsWithActualStock = allProducts.map(p => {
      const hasVariants = Array.isArray(p.colorVariants) && p.colorVariants.length > 0
      const variantStock = hasVariants ? p.colorVariants.reduce((sum, v) => sum + (v.stockQty || 0), 0) : 0
      const actualStock = hasVariants ? variantStock : (p.stockQty || 0)
      
      if (actualStock === 0) {
        console.log(`  ℹ️  Product out of stock - Has variants: ${hasVariants}, Main stock: ${p.stockQty}, Variant stock: ${variantStock}`)
      }
      
      return {
        category: p.category,
        actualStock,
        hasVariants,
        mainStock: p.stockQty,
        variantCount: hasVariants ? p.colorVariants.length : 0
      }
    })
    
    // Calculate metrics
    const totalProducts = productsWithActualStock.length
    const lowStock = productsWithActualStock.filter(p => p.actualStock > 0 && p.actualStock < 10).length
    const outOfStock = productsWithActualStock.filter(p => p.actualStock === 0).length
    const inStock = productsWithActualStock.filter(p => p.actualStock >= 10).length
    
    console.log(`  📈 Summary - Total: ${totalProducts}, InStock: ${inStock}, LowStock: ${lowStock}, OutOfStock: ${outOfStock}`)
    
    // Group by category
    const categoryMap = {}
    productsWithActualStock.forEach(p => {
      const cat = p.category || 'Uncategorized'
      if (!categoryMap[cat]) {
        categoryMap[cat] = { _id: cat, count: 0, totalStock: 0 }
      }
      categoryMap[cat].count++
      categoryMap[cat].totalStock += p.actualStock
    })
    const byCategory = Object.values(categoryMap).sort((a, b) => b.count - a.count)

    res.json({
      totalProducts,
      lowStock,
      outOfStock,
      inStock,
      byCategory,
    })
  } catch (error) {
    console.error('❌ Inventory summary error:', error)
    res.status(500).json({ message: 'Failed to load inventory summary' })
  }
})

export default router

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './models/Product.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sankar_electrical'

/**
 * Determine subcategory for Switches & Sockets products
 */
const determineSocketSubcategory = (product) => {
  const name = (product.name || '').toLowerCase()
  const desc = (product.description || '').toLowerCase()
  const text = name + ' ' + desc

  // Check for socket FIRST before checking amperage (since sockets can have 6A/16A in name)
  if ((text.includes('socket') || text.includes('sock-')) && !text.includes('switch')) {
    return 'socket'
  } else if (text.includes('fan regulator') || text.includes('regulator')) {
    return 'fan-regulator'
  } else if (text.includes('plate') || text.includes('switchboard') || text.includes('combined') || text.includes('combination')) {
    return 'switchboard'
  } else if (text.includes('16a') || text.includes('16 a') || text.includes('16ax') || text.includes('16amp')) {
    return 'modular-16a'
  } else if (text.includes('6a') || text.includes('6 a') || text.includes('6ax') || text.includes('6amp')) {
    return 'modular-6a'
  } else if (text.includes('switch')) {
    return 'modular-6a' // Default switches to 6A
  }

  return 'modular-6a' // Default fallback
}

/**
 * Determine subcategory for Wires & Cables products
 */
const determineWireSubcategory = (product) => {
  const name = (product.name || '').toLowerCase()
  const desc = (product.description || '').toLowerCase()
  const text = name + ' ' + desc

  if (text.includes('1.0 sq') || text.includes('1 sq mm') || text.includes('1.0sq')) {
    return 'wire-1sqmm'
  } else if (text.includes('1.5 sq') || text.includes('1.5sq')) {
    return 'wire-1.5sqmm'
  } else if (text.includes('2.5 sq') || text.includes('2.5sq')) {
    return 'wire-2.5sqmm'
  } else if (text.includes('4 sq') || text.includes('4.0 sq') || text.includes('4sq') || text.includes('4.0sq')) {
    return 'service-wire'
  } else if (text.includes('6 sq') || text.includes('6.0 sq') || text.includes('6sq') || text.includes('6.0sq')) {
    return 'lan-cable'
  }

  return 'wire-1sqmm' // Default fallback
}

async function updateSubcategories() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Get all products
    const products = await Product.find({})
    console.log(`📦 Found ${products.length} products`)

    let updatedCount = 0

    for (const product of products) {
      let subcategory = null

      // Determine subcategory based on category
      if (product.category === 'Switches & Sockets') {
        subcategory = determineSocketSubcategory(product)
      } else if (product.category === 'Wires & Cables') {
        subcategory = determineWireSubcategory(product)
      }

      // Update if subcategory determined and different from current
      if (subcategory && product.subcategory !== subcategory) {
        await Product.updateOne(
          { _id: product._id },
          { $set: { subcategory: subcategory } }
        )
        console.log(`✅ Updated "${product.name}" - subcategory: ${subcategory}`)
        updatedCount++
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} products`)

    // Show summary of subcategories
    const subcategoryCounts = await Product.aggregate([
      { $group: { _id: { category: '$category', subcategory: '$subcategory' }, count: { $sum: 1 } } },
      { $sort: { '_id.category': 1, '_id.subcategory': 1 } }
    ])

    console.log('\n📊 Subcategory Summary:')
    subcategoryCounts.forEach(item => {
      console.log(`  ${item._id.category} > ${item._id.subcategory || '(none)'}: ${item.count} products`)
    })

  } catch (error) {
    console.error('❌ Error updating subcategories:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

updateSubcategories()

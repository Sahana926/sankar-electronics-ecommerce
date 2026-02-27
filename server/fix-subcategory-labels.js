import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './models/Product.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sankar_electrical'

/**
 * Map subcategory IDs to their full labels
 */
const subcategoryMap = {
  // Switches & Sockets
  'switchboard': 'Modular combined Plate',
  'modular-6a': 'Modular Switches (6A)',
  'modular-16a': 'Modular Switches (16A)',
  'socket': 'Sockets',
  'fan-regulator': 'Fan Regulators',
  
  // Wires & Cables
  'wire-1sqmm': '1 sq mm Wire',
  'wire-1.5sqmm': '1.5 sq mm Wire',
  'wire-2.5sqmm': '2.5 sq mm Wire',
  'service-wire': '4 sq mm Wire',
  'lan-cable': '6 sq mm Wire'
}

async function updateSubcategoryLabels() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    let updatedCount = 0

    for (const [id, label] of Object.entries(subcategoryMap)) {
      const result = await Product.updateMany(
        { subcategory: id },
        { $set: { subcategory: label } }
      )
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${result.modifiedCount} products: "${id}" → "${label}"`)
        updatedCount += result.modifiedCount
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} products with full subcategory labels`)

    // Show summary
    const subcategoryCounts = await Product.aggregate([
      { $match: { category: { $in: ['Switches & Sockets', 'Wires & Cables'] } } },
      { $group: { _id: { category: '$category', subcategory: '$subcategory' }, count: { $sum: 1 } } },
      { $sort: { '_id.category': 1, '_id.subcategory': 1 } }
    ])

    console.log('\n📊 Updated Subcategory Summary:')
    subcategoryCounts.forEach(item => {
      console.log(`  ${item._id.category} > ${item._id.subcategory || '(none)'}: ${item.count} products`)
    })

    // Verify specific product
    const testProduct = await Product.findOne({ sku: 'CP-BLISS-12M-DG' })
    if (testProduct) {
      console.log('\n🔍 Verification - 12M Combination Plate:')
      console.log(JSON.stringify({
        name: testProduct.name,
        category: testProduct.category,
        subcategory: testProduct.subcategory
      }, null, 2))
    }

  } catch (error) {
    console.error('❌ Error updating subcategory labels:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

updateSubcategoryLabels()

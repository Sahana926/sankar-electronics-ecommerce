import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './models/Product.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sankar_electrical'

async function verifySubcategories() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // Check switchboard products
    const switchboardProducts = await Product.find({ subcategory: 'switchboard' }).limit(10)
    console.log(`🔌 Switchboard products: ${switchboardProducts.length}`)
    switchboardProducts.forEach(p => {
      console.log(`  - ${p.name} | ${p.subcategory}`)
    })

    console.log('\n')

    // Check wire products
    const wireProducts = await Product.find({ category: 'Wires & Cables' }).limit(10)
    console.log(`🧵 Wire & Cable products: ${wireProducts.length}`)
    wireProducts.forEach(p => {
      console.log(`  - ${p.name} | ${p.subcategory || '(no subcategory)'}`)
    })

    console.log('\n')

    // Check specific product
    const specificProduct = await Product.findOne({ sku: 'CP-MAG-6M-MATT-GREY' })
    if (specificProduct) {
      console.log('🎯 Found 6M Combined Plate Magnus Matt Grey:')
      console.log(JSON.stringify({
        name: specificProduct.name,
        sku: specificProduct.sku,
        category: specificProduct.category,
        subcategory: specificProduct.subcategory
      }, null, 2))
    } else {
      console.log('❌ Could not find product with SKU: CP-MAG-6M-MATT-GREY')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

verifySubcategories()

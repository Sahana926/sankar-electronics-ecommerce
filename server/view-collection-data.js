import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Cart from './models/Cart.js'
import Wishlist from './models/Wishlist.js'
import Order from './models/Order.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sankar_electrical'

async function viewCollectionData() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // Check Cart items
    console.log('📦 CART ITEMS:')
    console.log('='.repeat(60))
    const carts = await Cart.find({}).limit(5)
    carts.forEach((cart, idx) => {
      console.log(`\nCart ${idx + 1} (User: ${cart.userEmail}):`)
      console.log(`  Total items: ${cart.items.length}`)
      cart.items.forEach((item, itemIdx) => {
        console.log(`  ${itemIdx + 1}. ${item.name || '(No name)'} - Qty: ${item.quantity}, Price: ₹${item.price}`)
      })
    })

    // Check Wishlist items
    console.log('\n\n❤️ WISHLIST ITEMS:')
    console.log('='.repeat(60))
    const wishlists = await Wishlist.find({}).limit(5)
    wishlists.forEach((wishlist, idx) => {
      console.log(`\nWishlist ${idx + 1} (User: ${wishlist.userEmail}):`)
      console.log(`  Total items: ${wishlist.items.length}`)
      wishlist.items.forEach((item, itemIdx) => {
        console.log(`  ${itemIdx + 1}. ${item.name || '(No name)'} - Price: ₹${item.price}`)
      })
    })

    // Check Order items
    console.log('\n\n📋 ORDER ITEMS:')
    console.log('='.repeat(60))
    const orders = await Order.find({}).limit(5).sort({ createdAt: -1 })
    orders.forEach((order, idx) => {
      console.log(`\nOrder ${idx + 1} (${order.orderNumber}) - User: ${order.userEmail}:`)
      console.log(`  Status: ${order.status}, Total: ₹${order.totalAmount}`)
      console.log(`  Items: ${order.items.length}`)
      order.items.forEach((item, itemIdx) => {
        console.log(`  ${itemIdx + 1}. ${item.name || '(No name)'} - Qty: ${item.quantity}, Price: ₹${item.price}`)
      })
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n\n🔌 Disconnected from MongoDB')
  }
}

viewCollectionData()

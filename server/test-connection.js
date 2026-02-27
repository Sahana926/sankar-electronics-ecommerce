import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sankar_electrical'

console.log('🔌 Testing MongoDB connection...')
console.log(`📝 Connection URI: ${MONGODB_URI}`)

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB database: sankar_electrical')
    console.log('📊 Database name:', mongoose.connection.name)
    console.log('🔗 Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected')
    mongoose.connection.close()
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message)
    console.log('\n💡 Troubleshooting:')
    console.log('1. Make sure MongoDB is running')
    console.log('2. Check MongoDB Compass connection')
    console.log('3. Verify MONGODB_URI in .env file')
    process.exit(1)
  })


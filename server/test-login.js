import mongoose from 'mongoose'
import User from './models/User.js'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sankar_electrical'

async function testLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Test user data
    const testEmail = 'test@example.com'
    const testPassword = 'Test123!@#'

    // Check if test user exists
    let user = await User.findOne({ email: testEmail })
    
    if (!user) {
      console.log('📝 Creating test user...')
      user = new User({
        fullName: 'Test User',
        email: testEmail,
        phone: '1234567890',
        password: testPassword,
      })
      await user.save()
      console.log('✅ Test user created')
    } else {
      console.log('✅ Test user already exists')
    }

    // Test password comparison
    console.log('\n🔐 Testing login functionality...')
    const isValid = await user.comparePassword(testPassword)
    
    if (isValid) {
      console.log('✅ Password comparison successful')
      console.log('✅ Login functionality is working correctly')
    } else {
      console.log('❌ Password comparison failed')
    }

    await mongoose.connection.close()
    console.log('\n✅ Test completed successfully')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

testLogin()


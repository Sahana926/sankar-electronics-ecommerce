import mongoose from 'mongoose'
import Login from './models/Login.js'
import User from './models/User.js'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sankar_electrical'

async function testLoginCollection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Get a test user
    const user = await User.findOne({ email: 'test@example.com' })
    
    if (!user) {
      console.log('❌ Test user not found. Please run test-login.js first.')
      await mongoose.connection.close()
      return
    }

    console.log('\n📝 Testing Login Collection...\n')

    // Create test login records
    const testLogins = [
      {
        user: user._id,
        email: user.email,
        loginStatus: 'success',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      {
        user: user._id,
        email: user.email,
        loginStatus: 'failed',
        failureReason: 'Invalid password',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      {
        user: user._id,
        email: user.email,
        loginStatus: 'success',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
    ]

    // Insert test logins
    const createdLogins = await Login.insertMany(testLogins)
    console.log(`✅ Created ${createdLogins.length} test login records`)

    // Query login history
    const loginHistory = await Login.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5)

    console.log(`\n📊 Login History for ${user.email}:`)
    console.log(`Total login records: ${loginHistory.length}`)
    
    loginHistory.forEach((login, index) => {
      console.log(`\n${index + 1}. ${login.loginStatus.toUpperCase()}`)
      console.log(`   Date: ${login.createdAt}`)
      console.log(`   IP: ${login.ipAddress}`)
      if (login.failureReason) {
        console.log(`   Reason: ${login.failureReason}`)
      }
    })

    // Count success vs failed
    const successCount = await Login.countDocuments({ 
      user: user._id, 
      loginStatus: 'success' 
    })
    const failedCount = await Login.countDocuments({ 
      user: user._id, 
      loginStatus: 'failed' 
    })

    console.log(`\n📈 Statistics:`)
    console.log(`   Successful logins: ${successCount}`)
    console.log(`   Failed logins: ${failedCount}`)

    await mongoose.connection.close()
    console.log('\n✅ Login collection test completed successfully')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

testLoginCollection()


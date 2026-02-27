import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import dotenv from 'dotenv'

dotenv.config()

async function seedAdminUser() {
  try {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sankar_electrical')
    console.log('✅ Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'adminsankar@gmail.com' })
    
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists with email: adminsankar@gmail.com')
      console.log('Admin details:', {
        _id: existingAdmin._id,
        email: existingAdmin.email,
        fullName: existingAdmin.fullName,
        role: existingAdmin.role
      })
    } else {
      // Create new admin user
      const adminUser = new User({
        fullName: 'Admin Sankar',
        email: 'adminsankar@gmail.com',
        phone: '9999999999',
        role: 'admin',
        password: 'Admin@123', // Will be hashed by pre-save hook
      })

      await adminUser.save()
      console.log('✅ Admin user created successfully!')
      console.log('Admin details:', {
        _id: adminUser._id,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
        phone: adminUser.phone
      })
    }

    console.log('\n🎯 You can now login with:')
    console.log('Email: adminsankar@gmail.com')
    console.log('Password: Admin@123')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message)
    process.exit(1)
  }
}

seedAdminUser()

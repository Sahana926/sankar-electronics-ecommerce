import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sankar_electrical';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'adminsankar@gmail.com' });
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      console.log('Email: adminsankar@gmail.com');
      console.log('Password: Admin@123');
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      fullName: 'Admin User',
      email: 'adminsankar@gmail.com',
      phone: '9999999999',
      password: 'Admin@123',
      role: 'admin',
    });

    await admin.save();
    console.log('✅ Admin user created successfully');
    console.log('Email: adminsankar@gmail.com');
    console.log('Password: Admin@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sankar_electrical';

// Import User model
import User from './models/User.js';
import Cart from './models/Cart.js';
import Wishlist from './models/Wishlist.js';

async function seedTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create test user
    const testUserData = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      password: 'password123',
      role: 'user',
      isEmailVerified: true,
    };

    // Hash password
    const hashedPassword = await bcryptjs.hash(testUserData.password, 10);

    // Delete existing test user if exists
    await User.deleteOne({ email: testUserData.email });

    // Create new user
    const user = new User({
      fullName: testUserData.fullName,
      email: testUserData.email,
      phone: testUserData.phone,
      password: hashedPassword,
      role: 'user',
      isEmailVerified: true,
    });

    await user.save();
    console.log('✅ Test user created:', testUserData.email);

    // Create empty cart for user
    await Cart.deleteOne({ user: user._id });
    const cart = new Cart({
      user: user._id,
      userEmail: user.email,
      items: []
    });
    await cart.save();
    console.log('✅ Cart created for user');

    // Create empty wishlist for user
    await Wishlist.deleteOne({ user: user._id });
    const wishlist = new Wishlist({
      user: user._id,
      userEmail: user.email,
      items: []
    });
    await wishlist.save();
    console.log('✅ Wishlist created for user');

    console.log('\n📝 Test User Credentials:');
    console.log(`Email: ${testUserData.email}`);
    console.log(`Password: ${testUserData.password}`);
    console.log('\nYou can now login with these credentials!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedTestUsers();

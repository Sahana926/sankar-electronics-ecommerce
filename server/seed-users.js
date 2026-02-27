import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sankar_electrical';

async function clearDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Get all collections
    const collections = mongoose.connection.collections;

    // Clear all collections
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }

    console.log('✅ All test data cleared from database');
    console.log('\n📝 Database is now ready for fresh signup and login!');
    console.log('Users must now signup to create their account.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();


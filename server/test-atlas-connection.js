import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testAtlasConnection = async () => {
  try {
    console.log('🔍 Testing MongoDB Atlas connection...');
    console.log('📍 Connection URI:', process.env.MONGODB_URI?.replace(/:[^:]*@/, ':****@'));
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sankar_electrical', {
      serverSelectionTimeoutMS: 10000,
    });

    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🖥️  Host:', mongoose.connection.host);
    console.log('🔗 Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\n📝 Troubleshooting tips:');
    console.error('1. Check your MONGODB_URI in .env file');
    console.error('2. Verify your IP is whitelisted in MongoDB Atlas');
    console.error('3. Check database username and password');
    console.error('4. Ensure cluster is not paused');
    process.exit(1);
  }
};

testAtlasConnection();

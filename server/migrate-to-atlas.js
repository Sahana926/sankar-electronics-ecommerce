import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const migrateToAtlas = async () => {
  const localClient = new MongoClient('mongodb://localhost:27017');
  const atlasClient = new MongoClient(process.env.MONGODB_URI);

  try {
    console.log('🚀 Starting MongoDB Data Migration from Local to Atlas...\n');

    // Connect to local MongoDB
    console.log('📡 Connecting to Local MongoDB...');
    await localClient.connect();
    const localDb = localClient.db('sankar_electrical');
    console.log('✅ Connected to Local MongoDB\n');

    // Connect to MongoDB Atlas
    console.log('📡 Connecting to MongoDB Atlas...');
    await atlasClient.connect();
    const atlasDb = atlasClient.db('sankar_electrical');
    console.log('✅ Connected to MongoDB Atlas\n');

    // Get all collections from local database
    const collections = await localDb.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('⚠️  No collections found in local database.');
      console.log('💡 Make sure local MongoDB is running and has data in "sankar_electrical" database.');
      await localClient.close();
      await atlasClient.close();
      process.exit(0);
    }

    console.log(`📊 Found ${collections.length} collections in local database:\n`);

    let totalDocsMigrated = 0;

    // Migrate each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const localCollection = localDb.collection(collectionName);
      const atlasCollection = atlasDb.collection(collectionName);

      // Get all documents from local collection
      const documents = await localCollection.find({}).toArray();
      
      if (documents.length > 0) {
        // Clear existing data in Atlas collection first
        await atlasCollection.deleteMany({});
        
        // Insert documents into Atlas
        await atlasCollection.insertMany(documents);
        console.log(`   ✅ ${collectionName}: ${documents.length} documents migrated`);
        totalDocsMigrated += documents.length;
      } else {
        console.log(`   ⚠️  ${collectionName}: 0 documents (empty collection)`);
      }
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`📝 Total documents migrated: ${totalDocsMigrated}`);
    console.log(`📦 Total collections migrated: ${collections.length}`);
    console.log('\n💡 Your local MongoDB data is still intact.');
    console.log('   You can now check MongoDB Atlas Data Explorer to see your data.');

    await localClient.close();
    await atlasClient.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Make sure local MongoDB is running (check MongoDB Compass)');
    console.error('2. Verify MONGODB_URI is correct in .env');
    console.error('3. Check your IP is whitelisted in MongoDB Atlas');
    console.error('4. Verify database name is "sankar_electrical" in both local and Atlas');
    
    await localClient.close();
    await atlasClient.close();
    process.exit(1);
  }
};

migrateToAtlas();

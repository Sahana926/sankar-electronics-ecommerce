import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ShippingZone, Warehouse } from './models/ShippingZone.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sankar_electrical';

/**
 * Seed shipping zones and warehouse data
 */
const seedShippingData = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('\n🗑️  Clearing existing shipping data...');
    await ShippingZone.deleteMany({});
    await Warehouse.deleteMany({});
    console.log('✅ Cleared existing data');

    // Seed Shipping Zones
    console.log('\n📦 Seeding shipping zones...');
    const zones = [
      {
        zoneName: 'Zone 1',
        minDistance: 0,
        maxDistance: 19.99,
        charge: 20,
        estimatedDays: 1,
        description: 'Under 20 km',
        isActive: true
      },
      {
        zoneName: 'Zone 2',
        minDistance: 20,
        maxDistance: 50,
        charge: 50,
        estimatedDays: 2,
        description: 'Between 20-50 km',
        isActive: true
      },
      {
        zoneName: 'Zone 3',
        minDistance: 50.01,
        maxDistance: 100,
        charge: 70,
        estimatedDays: 3,
        description: 'Between 50-100 km',
        isActive: true
      },
      {
        zoneName: 'Not Serviceable',
        minDistance: 100.01,
        maxDistance: 10000,
        charge: 0,
        estimatedDays: 1,
        description: 'Beyond service area (>100 km)',
        isActive: true
      }
    ];

    const createdZones = await ShippingZone.insertMany(zones);
    console.log(`✅ Created ${createdZones.length} shipping zones`);
    createdZones.forEach(zone => {
      console.log(`   - ${zone.zoneName}: ${zone.minDistance}-${zone.maxDistance} km → ₹${zone.charge} (${zone.estimatedDays} days)`);
    });

    // Seed Warehouse
    console.log('\n🏢 Seeding warehouse data...');
    
    // Warehouse location - Tiruppur, Tamil Nadu
    const warehouse = {
      name: 'Sankar Electrical Main Warehouse',
      pincode: '641607', // Tiruppur, Tamil Nadu
      address: 'MS Nagar, Tiruppur',
      city: 'Tiruppur',
      state: 'Tamil Nadu',
      coordinates: {
        latitude: 11.1087,  // Tiruppur coordinates
        longitude: 77.3411
      },
      isActive: true,
      isPrimary: true
    };

    const createdWarehouse = await Warehouse.create(warehouse);
    console.log('✅ Created warehouse:');
    console.log(`   - Name: ${createdWarehouse.name}`);
    console.log(`   - Pincode: ${createdWarehouse.pincode}`);
    console.log(`   - Location: ${createdWarehouse.city}, ${createdWarehouse.state}`);
    console.log(`   - Coordinates: ${createdWarehouse.coordinates.latitude}, ${createdWarehouse.coordinates.longitude}`);

    console.log('\n✨ Shipping data seeded successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Update warehouse pincode and coordinates in seed-shipping.js');
    console.log('   2. Test the API: POST /api/shipping/calculate-shipping');
    console.log('   3. Expand pincode database in shippingService.js for production');
    console.log('   4. Consider using Google Maps API for accurate distance calculation');

  } catch (error) {
    console.error('❌ Error seeding shipping data:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
};

// Run the seed function
seedShippingData()
  .then(() => {
    console.log('\n✅ Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });

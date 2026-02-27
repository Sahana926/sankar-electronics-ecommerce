import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/shipping';

/**
 * Test the shipping API endpoints
 */
const testShippingAPI = async () => {
  console.log('🧪 Testing Shipping API\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Calculate shipping for local delivery (Delhi to Delhi)
    console.log('\n📍 Test 1: Local Delivery (Delhi to Delhi)');
    console.log('-'.repeat(60));
    const localDelivery = await axios.post(`${API_BASE_URL}/calculate-shipping`, {
      deliveryPincode: '110002',
      cartWeight: 3
    });
    console.log('Request:', { deliveryPincode: '110002', cartWeight: 3 });
    console.log('Response:', JSON.stringify(localDelivery.data, null, 2));

    // Test 2: Calculate shipping for zonal delivery (Delhi to Noida)
    console.log('\n📍 Test 2: Zonal Delivery (Delhi to Noida)');
    console.log('-'.repeat(60));
    const zonalDelivery = await axios.post(`${API_BASE_URL}/calculate-shipping`, {
      deliveryPincode: '201301',
      cartWeight: 5
    });
    console.log('Request:', { deliveryPincode: '201301', cartWeight: 5 });
    console.log('Response:', JSON.stringify(zonalDelivery.data, null, 2));

    // Test 3: Calculate shipping for national delivery (Delhi to Mumbai)
    console.log('\n📍 Test 3: National Delivery (Delhi to Mumbai)');
    console.log('-'.repeat(60));
    const nationalDelivery = await axios.post(`${API_BASE_URL}/calculate-shipping`, {
      deliveryPincode: '400001',
      cartWeight: 8
    });
    console.log('Request:', { deliveryPincode: '400001', cartWeight: 8 });
    console.log('Response:', JSON.stringify(nationalDelivery.data, null, 2));

    // Test 4: Calculate shipping with heavy weight
    console.log('\n📦 Test 4: Heavy Package (with weight surcharge)');
    console.log('-'.repeat(60));
    const heavyPackage = await axios.post(`${API_BASE_URL}/calculate-shipping`, {
      deliveryPincode: '560001',
      cartWeight: 12
    });
    console.log('Request:', { deliveryPincode: '560001', cartWeight: 12 });
    console.log('Response:', JSON.stringify(heavyPackage.data, null, 2));

    // Test 5: Validate pincode
    console.log('\n✅ Test 5: Validate Pincode');
    console.log('-'.repeat(60));
    const validPincode = await axios.post(`${API_BASE_URL}/validate-pincode`, {
      pincode: '110001'
    });
    console.log('Request:', { pincode: '110001' });
    console.log('Response:', JSON.stringify(validPincode.data, null, 2));

    // Test 6: Invalid pincode
    console.log('\n❌ Test 6: Invalid Pincode');
    console.log('-'.repeat(60));
    const invalidPincode = await axios.post(`${API_BASE_URL}/validate-pincode`, {
      pincode: '12345'
    });
    console.log('Request:', { pincode: '12345' });
    console.log('Response:', JSON.stringify(invalidPincode.data, null, 2));

    // Test 7: Get all shipping zones
    console.log('\n📋 Test 7: Get All Shipping Zones');
    console.log('-'.repeat(60));
    const zones = await axios.get(`${API_BASE_URL}/zones`);
    console.log('Response:', JSON.stringify(zones.data, null, 2));

    // Test 8: Get warehouse info
    console.log('\n🏢 Test 8: Get Warehouse Information');
    console.log('-'.repeat(60));
    const warehouse = await axios.get(`${API_BASE_URL}/warehouse`);
    console.log('Response:', JSON.stringify(warehouse.data, null, 2));

    // Test 9: Check serviceability
    console.log('\n🔍 Test 9: Check Serviceability');
    console.log('-'.repeat(60));
    const serviceability = await axios.get(`${API_BASE_URL}/check-serviceability/400001`);
    console.log('Request:', { pincode: '400001' });
    console.log('Response:', JSON.stringify(serviceability.data, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    console.error('\nError details:', error.response?.status, error.response?.statusText);
  }
};

/**
 * Test error scenarios
 */
const testErrorScenarios = async () => {
  console.log('\n\n🔴 Testing Error Scenarios\n');
  console.log('='.repeat(60));

  try {
    // Test: Missing pincode
    console.log('\n❌ Test: Missing Pincode');
    console.log('-'.repeat(60));
    await axios.post(`${API_BASE_URL}/calculate-shipping`, {
      cartWeight: 5
    });
  } catch (error) {
    console.log('Expected Error:', error.response?.data);
  }

  try {
    // Test: Invalid pincode format
    console.log('\n❌ Test: Invalid Pincode Format');
    console.log('-'.repeat(60));
    await axios.post(`${API_BASE_URL}/calculate-shipping`, {
      deliveryPincode: '0123456',
      cartWeight: 5
    });
  } catch (error) {
    console.log('Expected Error:', error.response?.data);
  }

  try {
    // Test: Negative weight
    console.log('\n❌ Test: Negative Weight');
    console.log('-'.repeat(60));
    await axios.post(`${API_BASE_URL}/calculate-shipping`, {
      deliveryPincode: '110001',
      cartWeight: -5
    });
  } catch (error) {
    console.log('Expected Error:', error.response?.data);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Error scenario tests completed!');
  console.log('='.repeat(60));
};

// Run all tests
const runAllTests = async () => {
  console.log('\n🚀 Starting Shipping API Tests...\n');
  console.log('⚠️  Make sure the server is running on http://localhost:5001\n');
  
  await testShippingAPI();
  await testErrorScenarios();
  
  console.log('\n\n✨ All tests completed!\n');
};

runAllTests().catch(console.error);

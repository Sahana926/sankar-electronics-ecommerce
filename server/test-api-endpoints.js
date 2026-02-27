// Test the updated API endpoints
const API_BASE = 'http://127.0.0.1:5001'

// You'll need to replace this with an actual user token
const testEndpoints = async () => {
  console.log('Testing API endpoints...\n')
  
  // Note: You need a valid user token to test these endpoints
  // Login first to get a token, then use it here
  
  const token = 'YOUR_TOKEN_HERE' // Replace with actual token
  
  try {
    // Test cart count endpoint
    console.log('Testing GET /api/cart/count')
    const cartRes = await fetch(`${API_BASE}/api/cart/count`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const cartData = await cartRes.json()
    console.log('Cart Response:', JSON.stringify(cartData, null, 2))
    
    console.log('\n---\n')
    
    // Test wishlist count endpoint
    console.log('Testing GET /api/wishlist/count')
    const wishlistRes = await fetch(`${API_BASE}/api/wishlist/count`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const wishlistData = await wishlistRes.json()
    console.log('Wishlist Response:', JSON.stringify(wishlistData, null, 2))
    
    console.log('\n---\n')
    
    // Test orders count endpoint
    console.log('Testing GET /api/orders/count')
    const ordersRes = await fetch(`${API_BASE}/api/orders/count`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const ordersData = await ordersRes.json()
    console.log('Orders Response:', JSON.stringify(ordersData, null, 2))
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

console.log('To test the endpoints:')
console.log('1. Login to get a token')
console.log('2. Replace YOUR_TOKEN_HERE in this file with the actual token')
console.log('3. Run: node test-api-endpoints.js')

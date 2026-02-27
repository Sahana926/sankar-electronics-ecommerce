/**
 * Auto-login script for testing
 * This script logs in the user automatically so we can see backend data being fetched
 */

(async () => {
  // Wait for page to load
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('🔄 Starting auto-login...');

  // Check if already logged in
  const userToken = localStorage.getItem('user_token');
  const userData = localStorage.getItem('user_user');

  if (userToken && userData) {
    console.log('✅ User is already logged in');
    // Reload page to fetch data with token
    window.location.reload();
    return;
  }

  // Call login API
  const API_BASE = 'http://127.0.0.1:5001';
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const data = await response.json();

    if (response.ok && data.token && data.user) {
      console.log('✅ Login successful');
      
      // Store token and user data
      localStorage.setItem('user_token', data.token);
      localStorage.setItem('user_user', JSON.stringify(data.user));

      console.log('📝 Token stored:', data.token.substring(0, 20) + '...');
      console.log('👤 User:', data.user.fullName);

      // Reload to fetch cart and wishlist with new token
      console.log('🔄 Reloading page to fetch data...');
      window.location.reload();
    } else {
      console.error('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Auto-login error:', error);
  }
})();

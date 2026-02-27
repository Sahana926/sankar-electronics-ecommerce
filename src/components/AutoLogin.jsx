import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * AutoLogin Component
 * Automatically logs in test user for development/testing
 * This helps verify backend data is being fetched correctly
 */
export default function AutoLogin() {
  const { login, isAuthenticated } = useAuth()
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

  useEffect(() => {
    const autoLogin = async () => {
      // Skip if already authenticated
      if (isAuthenticated) {
        console.log('✅ User already authenticated');
        return;
      }

      console.log('🔄 Attempting auto-login...');

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
          console.log('✅ Auto-login successful');
          console.log('👤 User:', data.user.fullName);
          
          // Use the login function from context
          login(data.token, data.user);
        } else {
          console.log('ℹ️ Auto-login not available:', data.message);
        }
      } catch (error) {
        console.log('ℹ️ Auto-login skipped:', error.message);
      }
    };

    // Run auto-login on component mount
    autoLogin();
  }, [isAuthenticated, login, API_BASE]);

  // This component doesn't render anything
  return null;
}

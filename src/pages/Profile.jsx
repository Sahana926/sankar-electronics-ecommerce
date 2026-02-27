import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../utils/tokenManager';
import './Profile.css';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(() => {
    if (user) {
      const address = typeof user.address === 'object' && user.address !== null ? user.address : {}
      return {
        fullName: user.fullName || user.name || 'Not provided',
        email: user.email || 'Not provided',
        phone: user.phone || address.phone || 'Not provided',
        address: address.street || (typeof user.address === 'string' ? user.address : '') || 'Not provided',
        city: address.city || user.city || 'Not provided',
        state: address.state || user.state || 'Not provided',
        pincode: address.pincode || user.pincode || 'Not provided',
        country: address.country || user.country || 'Not provided',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided',
        gender: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not specified'
      }
    }
    return {
      fullName: 'Loading...',
      email: 'Loading...',
      phone: 'Not provided',
      address: 'Not provided',
      city: 'Not provided',
      state: 'Not provided',
      pincode: 'Not provided',
      country: 'Not provided',
      dateOfBirth: 'Not provided',
      gender: 'Not specified'
    }
  });
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001';

  const fetchUserProfile = async () => {
    try {
      const token = getToken('user');
      console.log('Token available:', !!token);
      
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return false;
      }

      console.log('Fetching user profile from API...');
      const response = await fetch(`${API_BASE}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API response status:', response.status, 'OK:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch profile');
      }

      const responseData = await response.json();
      console.log('Full API Response:', responseData);

      // Handle both response formats (with or without 'data' property)
      const userData = responseData.data || responseData;
      console.log('Extracted user data:', userData);
      
      // Extract address fields, handling both nested and flat structures
      const address = typeof userData.address === 'object' && userData.address !== null ? userData.address : {};
      console.log('Address object:', address);
      
      const profileData = {
        fullName: userData.fullName || userData.name || 'Not provided',
        email: userData.email || 'Not provided',
        phone: userData.phone || address.phone || 'Not provided',
        address: address.street || (typeof userData.address === 'string' ? userData.address : '') || 'Not provided',
        city: address.city || userData.city || 'Not provided',
        state: address.state || userData.state || 'Not provided',
        pincode: address.pincode || userData.pincode || 'Not provided',
        country: address.country || userData.country || 'Not provided',
        dateOfBirth: userData.dateOfBirth ? 
          new Date(userData.dateOfBirth).toLocaleDateString() : 'Not provided',
        gender: userData.gender ? 
          userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : 'Not specified'
      };
      
      console.log('Final processed profile data:', profileData);
      
      // Update state
      setProfile(profileData);
      
      // Update context
      updateUser({
        ...user,
        ...userData
      });
      
      console.log('Profile state and context updated');
      return true;
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile: ' + error.message);
      return false;
    }
  };

  // Use user context as optimistic data immediately
  useEffect(() => {
    if (user) {
      const address = typeof user.address === 'object' && user.address !== null ? user.address : {}
      setProfile(prev => ({
        ...prev,
        fullName: user.fullName || user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || address.phone || prev.phone,
        address: address.street || (typeof user.address === 'string' ? user.address : '') || prev.address,
        city: address.city || user.city || prev.city,
        state: address.state || user.state || prev.state,
        pincode: address.pincode || user.pincode || prev.pincode,
        country: address.country || user.country || prev.country,
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : prev.dateOfBirth,
        gender: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : prev.gender
      }))
    }
  }, [user])

  // Fetch profile on component mount and when user changes
  useEffect(() => {
    let isMounted = true;
    
    const initializeProfile = async () => {
      console.log('Profile component mounted/user changed');
      console.log('Current user:', user);
      console.log('User ID available:', user?.id || user?._id);
      
      if (isMounted) {
        setIsLoading(true);
      }
      
      await fetchUserProfile();
      
      if (isMounted) {
        setIsLoading(false);
      }
    };
    
    // ✅ FIX: Only fetch if user is logged in (check both id and _id)
    if (user?.id || user?._id) {
      initializeProfile();
    } else {
      console.log('No user ID found, not fetching profile');
      if (isMounted) {
        setIsLoading(false);
      }
    }
    
    // Set up event listener for profile updates
    const handleProfileUpdate = async () => {
      console.log('Profile update event received, refetching...');
      if (isMounted) {
        setIsLoading(true);
        await fetchUserProfile();
        setIsLoading(false);
      }
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      isMounted = false;
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user?.id, user?._id]);

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <button 
          className="edit-profile-btn"
          onClick={() => navigate('/edit-profile')}
        >
          Edit Profile
        </button>
      </div>
      
      <div className="profile-card">
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Full Name:</span>
              <span className="detail-value">{profile.fullName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{profile.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{profile.phone}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date of Birth:</span>
              <span className="detail-value">{profile.dateOfBirth}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Gender:</span>
              <span className="detail-value">{profile.gender}</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Address</h2>
          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Street:</span>
              <span className="detail-value">{profile.address}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">City:</span>
              <span className="detail-value">{profile.city}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">State:</span>
              <span className="detail-value">{profile.state}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Postal Code:</span>
              <span className="detail-value">{profile.pincode}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Country:</span>
              <span className="detail-value">{profile.country}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

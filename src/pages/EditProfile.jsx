import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../utils/tokenManager';
import './EditProfile.css';
import { toast } from 'react-toastify';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    dateOfBirth: '',
    gender: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken('user');
        
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login');
          return;
        }
        
        console.log('Fetching user profile for editing...');
        const response = await fetch(`${API_BASE}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const responseData = await response.json();
        console.log('Edit Profile API Response:', responseData);

        if (response.ok) {
          const userData = responseData.data || responseData;
          const address = typeof userData.address === 'object' ? userData.address : {};
          
          const formData = {
            fullName: userData.fullName || userData.name || '',
            email: userData.email || '',
            phone: userData.phone || address.phone || '',
            address: address.street || '',
            city: address.city || userData.city || '',
            state: address.state || userData.state || '',
            pincode: address.pincode || userData.pincode || '',
            country: address.country || userData.country || 'India',
            dateOfBirth: userData.dateOfBirth ? 
              (typeof userData.dateOfBirth === 'string' ? 
                userData.dateOfBirth.split('T')[0] : 
                new Date(userData.dateOfBirth).toISOString().split('T')[0]) : 
              '',
            gender: userData.gender || ''
          };
          
          console.log('Setting form data:', formData);
          setFormData(formData);
        } else {
          throw new Error(responseData.message || 'Failed to load profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error(error.message || 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    // ✅ FIX: Fetch profile when user changes (not just on mount)
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id, API_BASE, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!');
    
    if (isSaving) {
      console.log('Already saving, returning');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const token = getToken('user');
      console.log('Token exists:', !!token);
      
      if (!token) {
        console.log('No token, redirecting to login');
        setIsSaving(false);
        navigate('/login');
        return;
      }

      // Prepare the data to send in the format expected by the backend
      const updateData = {
        fullName: formData.fullName?.trim() || '',
        phone: formData.phone?.trim() || '',
        address: formData.address?.trim() || '',
        city: formData.city?.trim() || '',
        state: formData.state?.trim() || '',
        pincode: formData.pincode?.trim() || '',
        country: formData.country || 'India',
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender ? formData.gender.toLowerCase() : ''
      };

      console.log('Sending update data:', updateData);

      const response = await fetch(`${API_BASE}/api/users/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      console.log('Response received. Status:', response.status, 'OK:', response.ok);

      let responseData = {};
      try {
        responseData = await response.json();
        console.log('Parsed response:', responseData);
      } catch (err) {
        console.error('Failed to parse JSON response:', err);
        responseData = {};
      }
      
      // Always try to show success and navigate if response OK
      if (response.ok) {
        console.log('Response was OK, processing success');
        const updatedUser = responseData.data || responseData;
        
        // Update auth context
        if (updatedUser && Object.keys(updatedUser).length > 0) {
          updateUser({
            ...user,
            ...updatedUser
          });
        }
        
        toast.success('Profile updated successfully!');
        window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedUser }));
        
        console.log('About to navigate to profile...');
        setIsSaving(false);
        
        // Navigate to profile after a brief delay
        setTimeout(() => {
          console.log('Navigating to profile');
          navigate('/profile', { replace: true });
        }, 500);
      } else {
        console.log('Response was NOT OK, handling error');
        // Extract error message from various possible formats
        let errorMsg = 'Failed to update profile';
        
        if (responseData?.message) {
          errorMsg = responseData.message;
        } else if (responseData?.errors && Array.isArray(responseData.errors)) {
          errorMsg = responseData.errors
            .map(err => err.msg || err.message || JSON.stringify(err))
            .join(', ');
        } else if (typeof responseData === 'string') {
          errorMsg = responseData;
        }
        
        console.error('Backend error message:', errorMsg);
        console.error('Full response data:', responseData);
        setIsSaving(false);
        throw new Error(errorMsg);
      }
      
    } catch (error) {
      console.error('Exception in handleSubmit:', error);
      console.error('Error stack:', error.stack);
      toast.error(error.message || 'An error occurred while updating your profile');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="edit-profile-container">
      <h1>Edit Profile</h1>
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="form-section">
          <h2>Personal Information</h2>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Address</h2>
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/profile')}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-btn"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;

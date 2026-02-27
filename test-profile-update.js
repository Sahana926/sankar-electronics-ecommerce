// Test script to debug the profile update issue
const testUpdate = async () => {
  try {
    // Get token from localStorage would be needed in browser
    // For now, use a test token
    const token = 'your_token_here'; // This needs to be a valid token
    
    const updateData = {
      fullName: 'Test User',
      phone: '8778699805',
      address: 'Test Address',
      city: 'Erode',
      state: 'Tamil Nadu',
      pincode: '641607',
      country: 'India',
      dateOfBirth: '2025-12-08',
      gender: 'female',
      companyName: 'kongu engineering college'
    };

    console.log('Sending update data:', updateData);

    const response = await fetch('http://127.0.0.1:5000/api/users/update-profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);

    const responseData = await response.json();
    console.log('Response data:', responseData);

  } catch (error) {
    console.error('Error:', error);
  }
};

// Run test
testUpdate();

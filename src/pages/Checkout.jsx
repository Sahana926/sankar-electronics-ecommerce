import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getToken } from '../utils/tokenManager'
import '../styles/Checkout.css'

function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [checkoutData, setCheckoutData] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orderPlacing, setOrderPlacing] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    landmark: '',
    locality: '',
    alternatePhone: '',
    addressType: 'home',
    country: 'India'
  })
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [upiId, setUpiId] = useState('')
  const [upiVerified, setUpiVerified] = useState(false)
  const [upiError, setUpiError] = useState('')
  const [verifyingUpi, setVerifyingUpi] = useState(false)
  const [shippingInfo, setShippingInfo] = useState(null)
  const [calculatingShipping, setCalculatingShipping] = useState(false)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'
  const OWNER_UPI_ID = 'sahanasahana64899@okicici' // Owner's UPI ID where payments will be received
  const [razorpayReady, setRazorpayReady] = useState(false)
  const [showWaiting, setShowWaiting] = useState(false)
  const [razorpayKey, setRazorpayKey] = useState('')
  const [hasRazorpayKey, setHasRazorpayKey] = useState(false)

  // Debug: Monitor addresses changes
  useEffect(() => {
    console.log('Addresses state changed:', addresses)
  }, [addresses])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Clear any stale pending payment data from older flows
    if (sessionStorage.getItem('pendingOrderDetails') || sessionStorage.getItem('transactionId')) {
      sessionStorage.removeItem('pendingOrderDetails')
      sessionStorage.removeItem('transactionId')
    }

    // Get checkout data from session/localStorage
    const data = sessionStorage.getItem('checkoutData')
    if (data) {
      const parsed = JSON.parse(data)
      if (parsed && Array.isArray(parsed.items)) {
        setCheckoutData(parsed)
      } else if (parsed && (parsed.productId || parsed.productName)) {
        // Backward-compat for older stored shape
        const normalized = {
          items: [
            {
              id: parsed.productId || parsed.id,
              productId: parsed.productId || parsed.id,
              name: parsed.productName || parsed.name || 'Product',
              description: parsed.description || '',
              price: parsed.price || 0,
              quantity: parsed.quantity || 1,
              icon: '🛒',
              category: parsed.category || 'General',
              image: parsed.imageUrl || parsed.image || '',
            },
          ],
          total: parsed.total || (parsed.price || 0) * (parsed.quantity || 1),
        }
        setCheckoutData(normalized)
        sessionStorage.setItem('checkoutData', JSON.stringify(normalized))
      } else {
        setCheckoutData(null)
      }
    }

    // Fetch user profile
    fetchUserProfile()
  }, [isAuthenticated, navigate])

  // Reload profile data when returning to this page (e.g., from edit profile)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        fetchUserProfile()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', () => {
      if (isAuthenticated) fetchUserProfile()
    })
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', fetchUserProfile)
    }
  }, [isAuthenticated])

  const createPaidOrder = async (orderDetails, transactionId) => {
    try {
      const token = getToken('user')

      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: orderDetails.address,
          paymentMethod: 'upi',
          paymentStatus: 'success',
          transactionId: transactionId,
          items: orderDetails.items || [],
          totalAmount: orderDetails.amount
        }),
      })

      if (response.ok) {
        // Clear sessionStorage
        sessionStorage.removeItem('checkoutData')
        
        alert(`✅ Payment Successful!\n\nYour order has been placed successfully.\n\nTransaction ID: ${transactionId}\nAmount: ₹${orderDetails.amount}\n\nThank you for shopping with us!`)
        
        // Redirect to orders page
        navigate('/orders')
      } else {
        setLoading(false)
        const error = await response.json().catch(() => ({}))
        alert('Failed to create order: ' + (error.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating paid order:', error)
      setLoading(false)
      alert('Error creating order: ' + error.message)
    } finally {
      setOrderPlacing(false)
      setShowWaiting(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const token = getToken('user')
      const response = await fetch(`${API_BASE}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const responseData = await response.json()
        const data = responseData.data || responseData
        console.log('Profile data received:', data)
        setUserProfile(data)
        
        // Set addresses from profile - support both multiple and single address
        // Keep existing addresses in state and only add/update from profile if needed
        if (data.addresses && data.addresses.length > 0) {
          setAddresses(data.addresses)
          setSelectedAddress(data.addresses[0])
        } else if (data.address) {
          // Check if address has any meaningful data
          const hasAddressData = data.address.street || data.address.city || 
                                 data.address.state || data.address.pincode || 
                                 data.address.postalCode
          
          console.log('Address data:', data.address)
          console.log('Has address data:', hasAddressData)
          
          // Create an address object (with or without full address)
          const addressObj = {
            _id: 'default',
            name: data.fullName || data.name || 'User',
            phone: data.phone || '',
            street: data.address.street || '',
            city: data.address.city || '',
            state: data.address.state || '',
            postalCode: data.address.pincode || data.address.postalCode || '',
            landmark: data.address.landmark || '',
            locality: data.address.locality || '',
            alternatePhone: data.address.alternatePhone || '',
            addressType: data.address.addressType || 'home',
            country: data.address.country || 'India'
          }
          
          // Only set if addresses is empty, otherwise keep existing addresses
          setAddresses(prev => prev.length === 0 ? [addressObj] : prev)
          if (!selectedAddress) {
            setSelectedAddress(addressObj)
          }
        } else {
          // Always create an address object with user's basic info
          const addressObj = {
            _id: 'default',
            name: data.fullName || data.name || 'User',
            phone: data.phone || '',
            street: '',
            city: '',
            state: '',
            postalCode: '',
            landmark: '',
            locality: '',
            alternatePhone: '',
            addressType: 'home',
            country: 'India'
          }
          setAddresses(prev => prev.length === 0 ? [addressObj] : prev)
          if (!selectedAddress) {
            setSelectedAddress(addressObj)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          // Using OpenStreetMap Nominatim API for reverse geocoding (free)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          )
          
          if (response.ok) {
            const data = await response.json()
            const address = data.address || {}
            
            // Update form fields with location data
            setNewAddress(prev => ({
              ...prev,
              street: address.road || address.suburb || '',
              locality: address.neighbourhood || address.suburb || '',
              city: address.city || address.town || address.village || '',
              state: address.state || '',
              postalCode: address.postcode || '',
              country: address.country || 'India'
            }))
            
            alert('Location detected! Please verify the details.')
          } else {
            alert('Unable to fetch address from location. Please enter manually.')
          }
        } catch (error) {
          console.error('Error fetching address:', error)
          alert('Error getting address. Please enter manually.')
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert('Unable to get your location. Please check your browser permissions.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleAddAddress = async () => {
    console.log('handleAddAddress called', newAddress)
    
    if (!newAddress.name || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      alert('Please fill all required fields')
      return
    }

    try {
      const token = getToken('user')
      console.log('Sending address to API...')
      
      const response = await fetch(`${API_BASE}/api/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          address: {
            street: newAddress.street,
            city: newAddress.city,
            state: newAddress.state,
            pincode: newAddress.postalCode,
            landmark: newAddress.landmark,
            locality: newAddress.locality,
            alternatePhone: newAddress.alternatePhone,
            addressType: newAddress.addressType,
            country: newAddress.country || 'India'
          },
          fullName: newAddress.name,
          phone: newAddress.phone
        }),
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const addedAddress = {
          _id: 'new-' + Date.now().toString(),
          name: newAddress.name,
          phone: newAddress.phone,
          street: newAddress.street,
          city: newAddress.city,
          state: newAddress.state,
          postalCode: newAddress.postalCode,
          landmark: newAddress.landmark,
          locality: newAddress.locality,
          alternatePhone: newAddress.alternatePhone,
          addressType: newAddress.addressType
        }
        
        console.log('Adding address to list:', addedAddress)
        
        // Add to addresses list and automatically select it
        setAddresses(prevAddresses => {
          const updatedAddresses = [...prevAddresses, addedAddress]
          console.log('Updated addresses:', updatedAddresses)
          return updatedAddresses
        })
        setSelectedAddress(addedAddress)
        
        // Reset form
        setNewAddress({
          name: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          postalCode: '',
          landmark: '',
          locality: '',
          alternatePhone: '',
          addressType: 'home',
          country: 'India'
        })
        setShowAddAddress(false)
        
        // Scroll to the new address
        setTimeout(() => {
          const addressSection = document.querySelector('.address-section')
          if (addressSection) {
            addressSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        }, 100)
        
        alert('Address saved successfully!')
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('API error:', errorData)
        alert('Failed to save address. Please try again.')
      }
    } catch (error) {
      console.error('Error adding address:', error)
      alert('Error saving address: ' + error.message)
    }
  }

  const handleVerifyUpi = async () => {
    if (!upiId.trim()) {
      setUpiError('This field is required')
      return
    }

    // Basic UPI ID validation
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/
    if (!upiRegex.test(upiId)) {
      setUpiError('Please enter a valid UPI ID')
      return
    }

    setVerifyingUpi(true)
    setUpiError('')

    try {
      // Simulate UPI verification (in real app, this would call payment gateway API)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUpiVerified(true)
      setUpiError('')
      alert('UPI ID verified successfully!')
    } catch (error) {
      setUpiError('Unable to verify UPI ID. Please try again.')
      setUpiVerified(false)
    } finally {
      setVerifyingUpi(false)
    }
  }

  // Load Razorpay Checkout script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        setRazorpayReady(true)
        return resolve(true)
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        setRazorpayReady(true)
        resolve(true)
      }
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  // Fetch Razorpay public key from backend
  useEffect(() => {
    const fetchKey = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/payments/config`)
        const data = await res.json()
        if (data?.keyId) {
          setRazorpayKey(data.keyId)
          setHasRazorpayKey(true)
        } else {
          setHasRazorpayKey(false)
        }
      } catch (e) {
        console.warn('Unable to fetch Razorpay key')
        setHasRazorpayKey(false)
      }
    }
    fetchKey()
  }, [])

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address')
      return
    }

    // Check if delivery location is beyond service area
    if (shippingInfo && shippingInfo.distance > 100) {
      alert('❌ Location Not Serviceable\n\nWe currently deliver within 100km radius only. Your location is outside our service area.')
      return
    }

    // Validate payment method specific requirements
    if (paymentMethod === 'upi' && !upiVerified) {
      alert('Please verify your UPI ID before proceeding')
      return
    }

    setOrderPlacing(true)
    try {
      const token = getToken('user')
      
      // Calculate final amount
      const finalAmount = checkoutData.total + calculateDeliveryFee()
      
      // Prepare order data
      const orderData = {
        items: checkoutData.items,
        total: finalAmount,
        shippingAddress: selectedAddress,
        paymentMethod: paymentMethod,
        upiId: paymentMethod === 'upi' ? upiId : undefined
      }

      if (paymentMethod === 'cod') {
        // For COD, directly create the order
        const orderResponse = await fetch(`${API_BASE}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...orderData,
            paymentStatus: 'pending',
            transactionId: `COD-${Date.now()}`,
          }),
        })

        if (!orderResponse.ok) {
          const error = await orderResponse.json()
          throw new Error(error.message || 'Failed to create order')
        }

        // Clear cart and redirect to success page
        sessionStorage.removeItem('checkoutData')
        sessionStorage.removeItem('pendingOrderDetails')
        
        // Show success message
        alert('Order placed successfully! You can pay via cash on delivery.')
        
        // Redirect to orders page
        navigate('/orders')
        setOrderPlacing(false)
      } else if (paymentMethod === 'upi') {
        // For UPI, use Razorpay
        if (!hasRazorpayKey) {
          throw new Error('UPI payments are not configured. Please use COD or try again later.')
        }

        const razorpayLoaded = await loadRazorpay()
        if (!razorpayLoaded) {
          throw new Error('Unable to load Razorpay. Please try again.')
        }

        // Create Razorpay order
        const response = await fetch(`${API_BASE}/api/payments/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: finalAmount,
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            payment_capture: 1
          }),
        })

        const orderResponse = await response.json()

        if (!response.ok) {
          throw new Error(orderResponse.message || 'Failed to create payment order')
        }

        console.log('Razorpay order created:', orderResponse);

        // Configure Razorpay options
        const options = {
          key: razorpayKey,
          amount: orderResponse.order.amount,
          currency: orderResponse.order.currency,
          name: 'Sankar Electricals & Hardwares',
          description: `Order for ${checkoutData.items.length} items`,
          order_id: orderResponse.order.id,
          handler: async function (response) {
            try {
              console.log('Razorpay payment response:', response);
              
              // Verify payment
              const verifyResponse = await fetch(`${API_BASE}/api/payments/verify-payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderData: orderData
                }),
              })

              const result = await verifyResponse.json()
              console.log('Verification result:', result);

              if (!verifyResponse.ok || !result.success) {
                throw new Error(result.message || 'Payment verification failed')
              }

              // Clear cart and redirect to success page
              sessionStorage.removeItem('checkoutData')
              sessionStorage.removeItem('pendingOrderDetails')
              
              // Show success message
              alert('✅ Payment Successful! Your order has been placed.')
              
              // Redirect to orders page
              navigate('/orders')
            } catch (error) {
              console.error('Payment verification error:', error)
              alert(`❌ Payment verification failed: ${error.message}`)
            } finally {
              setOrderPlacing(false)
            }
          },
          prefill: {
            name: userProfile?.fullName || '',
            email: userProfile?.email || '',
            contact: userProfile?.phone || '',
          },
          theme: {
            color: '#3399cc'
          },
          method: {
            netbanking: true,
            card: true,
            upi: true,
            wallet: true,
          },
          modal: {
            ondismiss: function() {
              setOrderPlacing(false)
            }
          }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert(`Error: ${error.message}`)
      setOrderPlacing(false)
    }
  }

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return
    
    const updatedItems = [...checkoutData.items]
    updatedItems[index].quantity = newQuantity
    setCheckoutData({
      ...checkoutData,
      items: updatedItems,
      total: calculateTotal(updatedItems)
    })
  }

  const handleRemoveItem = (index) => {
    const updatedItems = checkoutData.items.filter((_, i) => i !== index)
    setCheckoutData({
      ...checkoutData,
      items: updatedItems,
      total: calculateTotal(updatedItems)
    })
  }

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateDiscount = () => 0

  // Calculate shipping charges based on delivery pincode
  const calculateShippingCharges = useCallback(async (pincode) => {
    if (!pincode) {
      console.log('No pincode provided')
      setShippingInfo(null)
      return
    }

    // Allow pincodes that are 6 digits or might be incomplete
    if (typeof pincode === 'string' && pincode.trim().length < 6) {
      console.log('Pincode too short:', pincode)
      setShippingInfo(null)
      return
    }

    setCalculatingShipping(true)
    try {
      // Calculate total cart weight (assuming 1kg per item for now)
      const cartWeight = checkoutData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 1

      console.log('Calculating shipping for pincode:', pincode, 'Weight:', cartWeight)

      const response = await fetch(`${API_BASE}/api/shipping/calculate-shipping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliveryPincode: pincode,
          cartWeight: cartWeight
        })
      })

      const data = await response.json()

      if (data.success) {
        setShippingInfo(data.data)
        console.log('Shipping calculated successfully:', data.data)
      } else {
        console.error('Shipping calculation failed:', data.error)
        setShippingInfo(null)
      }
    } catch (error) {
      console.error('Error calculating shipping:', error)
      setShippingInfo(null)
    } finally {
      setCalculatingShipping(false)
    }
  }, [checkoutData, API_BASE])
  // Recalculate shipping when selected address changes
  useEffect(() => {
    if (selectedAddress && selectedAddress.postalCode) {
      calculateShippingCharges(selectedAddress.postalCode)
    } else {
      // Clear shipping info if no address selected
      setShippingInfo(null)
    }
  }, [selectedAddress, calculateShippingCharges])

  // Show alert if location is not serviceable (>100km)
  useEffect(() => {
    if (shippingInfo && shippingInfo.distance > 100) {
      alert('❌ Location Not Serviceable\n\nWe currently deliver within 100km radius only. Your location is outside our service area.')
    }
  }, [shippingInfo])

  const calculateDeliveryFee = () => {
    // Calculate delivery fee based on distance
    if (shippingInfo && shippingInfo.distance !== undefined) {
      const distance = shippingInfo.distance
      console.log('Calculating delivery fee for distance:', distance)
      
      if (distance < 20) {
        return 20
      } else if (distance >= 20 && distance <= 50) {
        return 50
      } else if (distance > 50 && distance <= 100) {
        return 70
      } else {
        // Above 100km: not serviceable
        return 0
      }
    }
    // No shipping info, return 0 (user must select valid address)
    return 0
  }

  if (loading) {
    return <div className="checkout-loading">Loading...</div>
  }

  if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
    return (
      <main className="main-content checkout-empty">
        <div className="container">
          <div className="empty-state">
            <h2>Nothing in Checkout</h2>
            <p>Click on a product's "Buy Now" to start shopping</p>
            <button onClick={() => navigate('/shop')} className="btn-primary">
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content checkout-page">
      <div className="checkout-container">
        {/* Left Column - Address and Items */}
        <div className="checkout-left">
          {/* LOGIN SECTION */}
          <section className="checkout-section login-section">
            <div className="section-header">
              <h3>1</h3>
              <h2>LOGIN</h2>
            </div>
            <div className="section-content">
              <div className="user-info-row">
                <div className="user-info">
                  <p className="user-name">
                    {userProfile?.fullName || userProfile?.name || 'User'} {userProfile?.phone ? `+${userProfile.phone}` : ''}
                  </p>
                </div>
                <button 
                  className="btn-change"
                  onClick={() => navigate('/edit-profile', { state: { from: '/checkout' } })}
                >
                  CHANGE
                </button>
              </div>
            </div>
          </section>

          {/* DELIVERY ADDRESS SECTION */}
          <section className="checkout-section address-section">
            <div className="section-header">
              <h3>2</h3>
              <h2>DELIVERY ADDRESS</h2>
            </div>
            <div className="section-content">
              {addresses.length > 0 && selectedAddress && (
                <button 
                  className="btn-change-address"
                  onClick={() => navigate('/edit-profile', { state: { from: '/checkout' } })}
                >
                  CHANGE
                </button>
              )}
              {addresses.length > 0 ? (
                <div className="address-list">
                  {console.log('Rendering addresses:', addresses)}
                  {addresses.map((address, index) => (
                    <div
                      key={address._id || index}
                      className={`address-card ${selectedAddress && selectedAddress._id === address._id ? 'selected' : ''}`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <input
                        type="radio"
                        checked={selectedAddress && selectedAddress._id === address._id}
                        onChange={() => setSelectedAddress(address)}
                      />
                      <div className="address-details">
                        <p className="address-name">
                          {address.name}
                          {address.addressType && (
                            <span className="address-type-badge">
                              {address.addressType === 'home' ? '🏠 Home' : '🏢 Work'}
                            </span>
                          )}
                        </p>
                        {(address.street || address.city || address.state || address.postalCode) ? (
                          <>
                            <p className="address-text">
                              {address.street && `${address.street}, `}
                              {address.locality && `${address.locality}, `}
                              {address.landmark && `${address.landmark}, `}
                              {address.city && `${address.city}, `}
                              {address.state && `${address.state}`}
                              {address.postalCode && ` - ${address.postalCode}`}
                            </p>
                            {address.addressType && (
                              <p className="address-delivery-time">
                                {address.addressType === 'home' 
                                  ? 'All day delivery' 
                                  : 'Delivery between 10 AM - 5 PM'}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="address-text address-incomplete">
                            Address details not provided. Please add your address.
                          </p>
                        )}
                        <p className="address-phone">Phone: {address.phone}</p>
                        {address.alternatePhone && (
                          <p className="address-phone">Alternate: {address.alternatePhone}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {!showAddAddress ? (
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="btn-add-address"
                >
                  + ADD A NEW ADDRESS
                </button>
              ) : (
                <div className="add-address-form">
                  <div className="form-header">
                    <input type="radio" checked={true} readOnly={true} />
                    <h4>ADD A NEW ADDRESS</h4>
                  </div>

                  <div className="form-grid">
                    <div className="form-group full-width">
                      <input
                        type="text"
                        placeholder="Name"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group full-width">
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        maxLength="10"
                        required
                      />
                    </div>

                    <div className="form-group half-width">
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        maxLength="6"
                        required
                      />
                    </div>

                    <div className="form-group half-width">
                      <input
                        type="text"
                        placeholder="Locality"
                        value={newAddress.locality}
                        onChange={(e) => setNewAddress({ ...newAddress, locality: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group full-width">
                      <textarea
                        placeholder="Address (Area and Street)"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        rows="3"
                        required
                      />
                    </div>

                    <div className="form-group full-width">
                      <input
                        type="text"
                        placeholder="City/District/Town"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group full-width state-group">
                      <select
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        required
                      >
                        <option value="">--Select State--</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                      </select>
                      <label className="state-label">State</label>
                    </div>

                    <div className="form-group half-width">
                      <input
                        type="text"
                        placeholder="Landmark (Optional)"
                        value={newAddress.landmark}
                        onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                      />
                    </div>

                    <div className="form-group half-width">
                      <input
                        type="tel"
                        placeholder="Alternate Phone (Optional)"
                        value={newAddress.alternatePhone}
                        onChange={(e) => setNewAddress({ ...newAddress, alternatePhone: e.target.value })}
                        maxLength="10"
                      />
                    </div>

                    <div className="form-group full-width address-type-section">
                      <label className="address-type-label">Address Type</label>
                      <div className="address-type-options">
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="addressType"
                            value="home"
                            checked={newAddress.addressType === 'home'}
                            onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                          />
                          <span>Home (All day delivery)</span>
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="addressType"
                            value="work"
                            checked={newAddress.addressType === 'work'}
                            onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                          />
                          <span>Work (Delivery between 10 AM - 5 PM)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions-flipkart">
                    <button 
                      type="button"
                      onClick={handleAddAddress} 
                      className="btn-save-deliver"
                    >
                      SAVE AND DELIVER HERE
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowAddAddress(false)} 
                      className="btn-cancel-flipkart"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ORDER SUMMARY SECTION */}
          <section className="checkout-section order-summary-section">
            <div className="section-header">
              <h3>3</h3>
              <h2>ORDER SUMMARY</h2>
            </div>
            <div className="section-content">
              <div className="items-list">
                {checkoutData.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      <div className="item-icon">{item.icon}</div>
                    </div>
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p className="item-price">₹{item.price}</p>
                    </div>
                    <div className="item-quantity">
                      <button onClick={() => handleQuantityChange(index, item.quantity - 1)}>−</button>
                      <input type="text" value={item.quantity} readOnly />
                      <button onClick={() => handleQuantityChange(index, item.quantity + 1)}>+</button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="btn-remove"
                    >
                      REMOVE
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PAYMENT METHOD SECTION */}
          <section className="checkout-section payment-section">
            <div className="section-header">
              <h3>4</h3>
              <h2>PAYMENT OPTIONS</h2>
            </div>
            <div className="section-content payment-content">
              <div className="payment-methods-list">
                {/* UPI Option */}
                <div className="payment-method-item" onClick={() => setPaymentMethod('upi')}>
                  <div className="payment-method-header">
                    <div className="payment-icon upi-icon">UPI</div>
                    <div className="payment-method-info">
                      <h4>UPI</h4>
                      <p className="payment-subtitle">Pay by any UPI app</p>
                      <p className="payment-offer">Flat ₹10 Cashback on Paytm UPI payments. Min Order Value ₹99. Valid once per Paytm account</p>
                    </div>
                  </div>
                </div>

                {/* COD Option */}
                <div className="payment-method-item" onClick={() => setPaymentMethod('cod')}>
                  <div className="payment-method-header">
                    <div className="payment-icon cod-icon">💵</div>
                    <div className="payment-method-info">
                      <h4>Cash on Delivery</h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* UPI Payment Details */}
              {paymentMethod === 'upi' && (
                <div className="payment-details-panel">
                  <div className="upi-payment-form">
                    {!hasRazorpayKey && (
                      <div className="upi-intent-box">
                        <p className="intent-title">Direct UPI (no gateway)</p>
                        <p className="intent-note">Tap Pay to open your UPI app. Payment will be marked pending until we verify manually.</p>
                        <div className="intent-row">
                          <span className="intent-label">Pay to UPI ID:</span>
                          <strong>{OWNER_UPI_ID}</strong>
                        </div>
                      </div>
                    )}
                    <div className="add-upi-section">
                      <input 
                        type="radio" 
                        id="addNewUpi"
                        checked={true}
                        readOnly={true}
                      />
                      <label htmlFor="addNewUpi" className="upi-option-label">
                        <span>Add new UPI ID</span>
                        <a href="#" className="how-to-find">How to find?</a>
                      </label>
                    </div>

                    <div className="upi-input-section">
                      <div className="upi-input-wrapper">
                        <input
                          type="text"
                          className={`upi-input ${upiError ? 'error' : ''}`}
                          placeholder="Enter your UPI ID"
                          value={upiId}
                          onChange={(e) => {
                            setUpiId(e.target.value)
                            setUpiError('')
                            setUpiVerified(false)
                          }}
                        />
                        <button 
                          className="btn-verify-upi"
                          onClick={handleVerifyUpi}
                          disabled={verifyingUpi || !upiId.trim()}
                        >
                          {verifyingUpi ? 'Verifying...' : 'Verify'}
                        </button>
                      </div>
                      {upiError && (
                        <p className="upi-error">{upiError}</p>
                      )}
                      {upiVerified && (
                        <p className="upi-success">✓ UPI ID verified successfully</p>
                      )}
                    </div>

                    <button 
                      className="btn-pay-amount"
                      onClick={handlePlaceOrder}
                      disabled={!upiVerified || orderPlacing}
                    >
                      {orderPlacing ? 'Processing...' : `Pay ₹${checkoutData.total + calculateDeliveryFee()}`}
                    </button>

                    {showWaiting && (
                      <div className="waiting-panel">
                        <div className="clock">5m</div>
                        <div className="text">
                          Open your UPI app to complete payment, then return here.
                          Please do not refresh or press back.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* COD Payment Details */}
              {paymentMethod === 'cod' && (
                <div className="payment-details-panel">
                  <div className="cod-payment-info">
                    <div className="cod-icon-large">💵</div>
                    <h3>Cash on Delivery</h3>
                    <p className="cod-description">Pay with cash when your order is delivered</p>
                    
                    <div className="cod-details-box">
                      <div className="cod-detail-row">
                        <span className="cod-label">Amount to Pay:</span>
                        <strong className="cod-amount">₹{checkoutData.total + calculateDeliveryFee()}</strong>
                      </div>
                      <div className="cod-detail-row">
                        <span className="cod-label">Payment Method:</span>
                        <strong>Cash</strong>
                      </div>
                      <div className="cod-detail-row">
                        <span className="cod-label">When to Pay:</span>
                        <strong>At the time of delivery</strong>
                      </div>
                    </div>

                    <div className="cod-instructions">
                      <h4>Instructions:</h4>
                      <ul>
                        <li>✓ Keep exact cash ready for faster delivery</li>
                        <li>✓ Delivery person will hand over the order after payment</li>
                        <li>✓ Check the products before making payment</li>
                        <li>✓ Make sure someone is available to receive the order</li>
                      </ul>
                    </div>

                    <button 
                      className="btn-place-order-cod"
                      onClick={handlePlaceOrder}
                      disabled={orderPlacing || !selectedAddress}
                    >
                      {orderPlacing ? 'Placing Order...' : 'PLACE ORDER'}
                    </button>

                    <p className="cod-note">
                      ⓘ You can inspect the product before making the payment
                    </p>
                  </div>
                </div>
              )}

              {/* Card Payment Details */}
              {paymentMethod === 'card' && (
                <div className="payment-details-panel">
                  <div className="card-payment-info">
                    <p>Card payment integration coming soon!</p>
                    <p className="note">For now, please use UPI or Cash on Delivery.</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column - Price Details */}
        <div className="checkout-right">
          <section className="price-details-section">
            <h2>PRICE DETAILS</h2>
            <div className="price-row">
              <span>Price ({checkoutData.items.length} item{checkoutData.items.length > 1 ? 's' : ''})</span>
              <span>₹{checkoutData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
            </div>
            {calculateDiscount() > 0 && (
              <div className="price-row discount">
                <span>Discount</span>
                <span>−₹{calculateDiscount()}</span>
              </div>
            )}
            <div className="price-row">
              <span>Delivery Fee</span>
              <span className={calculateDeliveryFee() === 0 && shippingInfo ? 'free' : ''}>
                {calculatingShipping ? (
                  'Calculating...'
                ) : !shippingInfo ? (
                  '₹0 (Select address to calculate)'
                ) : shippingInfo.distance > 100 ? (
                  <span style={{ color: '#ff6b6b' }}>Not Serviceable (&gt;100km)</span>
                ) : calculateDeliveryFee() === 0 ? (
                  'Free'
                ) : (
                  <>
                    ₹{calculateDeliveryFee()}
                    {shippingInfo && (
                      <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '5px' }}>
                        ({Math.round(shippingInfo.distance)}km)
                      </span>
                    )}
                  </>
                )}
              </span>
            </div>
            <div className="price-divider"></div>
            <div className="price-row total">
              <span>Total Payable</span>
              <span>₹{checkoutData.total + calculateDeliveryFee()}</span>
            </div>
            {calculateDiscount() > 0 && (
              <div className="savings">
                <span className="savings-label">
                  ✓ Your Total Savings on this order ₹{calculateDiscount()}
                </span>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={orderPlacing || !selectedAddress}
              className="btn-continue"
            >
              {orderPlacing ? 'Placing Order...' : 'CONTINUE'}
            </button>

            <div className="security-info">
              <p>✓ Safe and Secure Payments. Easy returns.</p>
              <p>100% Authentic products.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default Checkout

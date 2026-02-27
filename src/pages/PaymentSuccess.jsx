import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getToken } from '../utils/tokenManager'

function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [orderCreated, setOrderCreated] = useState(false)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Get payment status from URL or sessionStorage
    const paymentId = searchParams.get('razorpay_payment_id') || sessionStorage.getItem('transactionId')
    const pendingOrderDetails = sessionStorage.getItem('pendingOrderDetails')

    if (pendingOrderDetails) {
      createOrderAfterPayment(pendingOrderDetails, paymentId)
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, navigate])

  const createOrderAfterPayment = async (orderDetailsJson, paymentId) => {
    try {
      const orderDetails = JSON.parse(orderDetailsJson)
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
          transactionId: paymentId || 'TXN-' + Date.now(),
          items: orderDetails.items || [],
          totalAmount: orderDetails.amount
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setOrderCreated(true)
        
        // Clear sessionStorage
        sessionStorage.removeItem('pendingOrderDetails')
        sessionStorage.removeItem('transactionId')
        sessionStorage.removeItem('paymentCompleted')
        sessionStorage.removeItem('checkoutData')
        
        // Redirect to orders page after 3 seconds
        setTimeout(() => {
          navigate('/orders')
        }, 3000)
      } else {
        console.error('Failed to create order')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="main-content" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="container">
          <h2>Processing Payment...</h2>
          <p>Please wait while we complete your order.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content" style={{ padding: '60px 20px', textAlign: 'center' }}>
      <div className="container">
        {orderCreated ? (
          <>
            <h2>✓ Payment Successful!</h2>
            <p>Your order has been created successfully.</p>
            <p>Redirecting to your orders page...</p>
          </>
        ) : (
          <>
            <h2>Payment Completed</h2>
            <p>Your payment has been processed. Please wait while we complete your order.</p>
          </>
        )}
      </div>
    </main>
  )
}

export default PaymentSuccess

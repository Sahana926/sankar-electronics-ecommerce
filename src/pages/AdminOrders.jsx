import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import AdminHeader from '../components/AdminHeader'
import { getToken } from '../utils/tokenManager'
import './AdminOrders.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isReviewingReturn, setIsReviewingReturn] = useState({})

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = getToken('admin')
      const res = await fetch(`${API_BASE}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load orders')
      setOrders(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (id, status) => {
    try {
      const token = getToken('admin')
      if (!token) {
        toast.error('Admin session expired. Please login again.')
        return
      }
      
      const res = await fetch(`${API_BASE}/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        console.error('Update status error:', data)
        return toast.error(data.message || 'Update failed')
      }
      toast.success('Status updated')
      fetchOrders()
    } catch (error) {
      console.error('Update status exception:', error)
      toast.error('Failed to update order status')
    }
  }

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      const token = getToken('admin')
      if (!token) {
        toast.error('Admin session expired. Please login again.')
        return
      }
      
      const res = await fetch(`${API_BASE}/api/admin/orders/${id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentStatus }),
      })
      const data = await res.json()
      if (!res.ok) {
        console.error('Update payment status error:', data)
        return toast.error(data.message || 'Update failed')
      }
      toast.success('Payment status updated')
      fetchOrders()
    } catch (error) {
      console.error('Update payment status exception:', error)
      toast.error('Failed to update payment status')
    }
  }

  const reviewReturnRequest = async (order, decision) => {
    try {
      const token = getToken('admin')
      if (!token) {
        toast.error('Admin session expired. Please login again.')
        return
      }

      const note = window.prompt(
        decision === 'approved'
          ? 'Optional note for approving this return request:'
          : 'Reason for rejecting this return request:'
      )

      if (note === null) {
        return
      }

      const trimmedNote = note.trim()
      if (decision === 'rejected' && trimmedNote.length < 5) {
        toast.error('Please provide a rejection reason (minimum 5 characters).')
        return
      }

      setIsReviewingReturn((prev) => ({ ...prev, [order._id]: true }))

      const res = await fetch(`${API_BASE}/api/admin/orders/${order._id}/return-review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ decision, note: trimmedNote }),
      })

      const data = await res.json()
      if (!res.ok) {
        return toast.error(data.message || 'Failed to review return request')
      }

      toast.success(data.message || 'Return request updated')
      fetchOrders()
    } catch (error) {
      console.error('Return review exception:', error)
      toast.error('Failed to review return request')
    } finally {
      setIsReviewingReturn((prev) => ({ ...prev, [order._id]: false }))
    }
  }

  if (loading) return <div className="page-loading">Loading orders...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <>
      <AdminHeader />
      <main className="main-content">
      <div className="container">
        <div className="page-container">
          <h2 className="page-title">Admin Orders</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>User</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td data-label="Order #">{o.orderNumber}</td>
                    <td data-label="User">{o.userEmail}</td>
                    <td data-label="Total">₹{o.total}</td>
                    <td data-label="Status">
                      <div>{o.status}</div>
                      {o.returnRequest?.status === 'requested' && (
                        <div className="return-request-badge">Return requested</div>
                      )}
                      {o.returnRequest?.status === 'approved' && (
                        <div className="return-request-badge approved">Return approved</div>
                      )}
                      {o.returnRequest?.status === 'rejected' && (
                        <div className="return-request-badge rejected">Return rejected</div>
                      )}
                    </td>
                    <td data-label="Payment">
                      <select 
                        value={o.paymentStatus?.toLowerCase() || 'pending'} 
                        onChange={(e) => updatePaymentStatus(o._id, e.target.value)}
                        className="payment-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td data-label="Actions">
                      <div className="admin-order-actions">
                        <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        {o.returnRequest?.status === 'requested' && (
                          <div className="return-review-actions">
                            <button
                              type="button"
                              className="return-review-btn approve"
                              disabled={!!isReviewingReturn[o._id]}
                              onClick={() => reviewReturnRequest(o, 'approved')}
                            >
                              {isReviewingReturn[o._id] ? 'Processing...' : 'Approve Return'}
                            </button>
                            <button
                              type="button"
                              className="return-review-btn reject"
                              disabled={!!isReviewingReturn[o._id]}
                              onClick={() => reviewReturnRequest(o, 'rejected')}
                            >
                              {isReviewingReturn[o._id] ? 'Processing...' : 'Reject Return'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6}>No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
    </>
  )
}

export default AdminOrders

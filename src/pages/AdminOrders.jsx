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
                    <td data-label="Status">{o.status}</td>
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
                      <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
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

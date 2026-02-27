import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../../utils/tokenManager'
import AdminHeader from '../../components/AdminHeader'
import '../AdminProducts.css'
import '../reports.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

function UsersReport() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterRole, setFilterRole] = useState('all') // 'all', 'admin', 'user'

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    // Apply filter when users or filterRole changes
    if (filterRole === 'all') {
      setFilteredUsers(users)
    } else {
      setFilteredUsers(users.filter(u => u.role === filterRole))
    }
  }, [users, filterRole])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = getToken('admin')
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load users')
      setUsers(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="admin-users"><div className="page-loading">Loading users...</div></div>

  return (
    <main className="main-content admin-users">
      <AdminHeader />
      <div className="container">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h2 className="page-title">👥 All Users Report</h2>
              <p className="page-subtitle">Complete user list and details</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
              ← Back to Dashboard
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="filter-cards">
            <div 
              className={`filter-card ${filterRole === 'all' ? 'active' : ''}`}
              onClick={() => setFilterRole('all')}
            >
              <div className="filter-icon">👥</div>
              <div className="filter-label">All Users</div>
              <div className="filter-count">{users.length}</div>
            </div>
            <div 
              className={`filter-card ${filterRole === 'admin' ? 'active' : ''}`}
              onClick={() => setFilterRole('admin')}
            >
              <div className="filter-icon">🛡️</div>
              <div className="filter-label">Admin Users</div>
              <div className="filter-count">{users.filter(u => u.role === 'admin').length}</div>
            </div>
            <div 
              className={`filter-card ${filterRole === 'user' ? 'active' : ''}`}
              onClick={() => setFilterRole('user')}
            >
              <div className="filter-icon">👤</div>
              <div className="filter-label">Regular Users</div>
              <div className="filter-count">{users.filter(u => u.role === 'user').length}</div>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Account Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td><strong>{user.fullName}</strong></td>
                      <td>{user.email}</td>
                      <td>{user.phone || '–'}</td>
                      <td>
                        <span className={`status-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      <div className="empty-state-icon">📭</div>
                      <div className="empty-state-text">No users found</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}

export default UsersReport

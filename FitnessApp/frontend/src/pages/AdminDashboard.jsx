import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAdminStats, getAllUsers, createUser, updateUserRole, deleteUser } from '../api/api'
import Modal from '../components/Modal'
import '../cssfiles/AdminDashboard.css'

const ROLES = ['client', 'trainer', 'admin']

function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'client' })
  const [error, setError] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsData, usersData] = await Promise.all([getAdminStats(), getAllUsers()])
      setStats(statsData)
      setUsers(usersData)
    } catch (err) {
      console.error('Error fetching admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUserRole(id, newRole)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u))
    } catch (err) {
      alert('Failed to update role.')
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const newUser = await createUser(createForm)
      setUsers(prev => [newUser, ...prev])
      setShowCreateModal(false)
      setCreateForm({ name: '', email: '', password: '', role: 'client' })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesTab = activeTab === 'all' || u.role === activeTab
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  if (loading) return (
    <div className="page-container">
      <div className="loading-container"><div className="spinner"></div></div>
    </div>
  )

  return (
    <div className="admin-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage all users, roles, and system access</p>
        </div>

        {/* Stats Cards */}
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-number">{stats?.totalUsers ?? 0}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-card stat-card--admin">
            <span className="stat-number">{stats?.totalAdmins ?? 0}</span>
            <span className="stat-label">Admins</span>
          </div>
          <div className="stat-card stat-card--trainer">
            <span className="stat-number">{stats?.totalTrainers ?? 0}</span>
            <span className="stat-label">Trainers</span>
          </div>
          <div className="stat-card stat-card--client">
            <span className="stat-number">{stats?.totalClients ?? 0}</span>
            <span className="stat-label">Clients</span>
          </div>
        </div>

        {/* Users Table */}
        <section className="admin-section">
          <div className="section-header">
            <h2>User Management</h2>
            <button className="addbtn" onClick={() => setShowCreateModal(true)}>+ Add User</button>
          </div>

          <div className="admin-controls">
            <div className="tab-group">
              {['all', 'client', 'trainer', 'admin'].map(tab => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'tab-btn--active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <input
              className="search-input"
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {filteredUsers.length === 0 ? (
            <div className="empty-state"><p>No users found.</p></div>
          ) : (
            <div className="progress-table-container">
              <table className="progress-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong>{u.id === user?.id && <span className="you-badge"> (you)</span>}</td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          className={`role-select role-select--${u.role}`}
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          disabled={u.id === user?.id}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                      <td>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(u.id, u.name)}
                          disabled={u.id === user?.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setError('') }} title="Add New User">
        <form onSubmit={handleCreate} className="form">
          {error && <div className="form-error">{error}</div>}
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} required disabled={submitting} placeholder="Full name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} required disabled={submitting} placeholder="Email address" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} required disabled={submitting} placeholder="Temporary password" />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value })} disabled={submitting}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setShowCreateModal(false); setError('') }} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create User'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminDashboard
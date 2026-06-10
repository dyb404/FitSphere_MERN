import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === 'admin') return <Navigate to="/admin-dashboard" replace />
    if (user?.role === 'trainer') return <Navigate to="/trainer-dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
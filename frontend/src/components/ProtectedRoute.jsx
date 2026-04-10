import { Navigate } from 'react-router-dom'
import { useAuth }   from '../context/AuthContext'

/**
 * ProtectedRoute — STATELESS component.
 * Redirects to /login if user is not authenticated.
 * Shows nothing while auth state is loading.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: '#1a4144' }}>Loading…</div>
  if (!user)   return <Navigate to="/login" replace />
  return children
}

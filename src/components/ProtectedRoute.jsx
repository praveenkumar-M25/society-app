import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader } from './StateViews'

// Wraps any route that needs a logged-in user, optionally restricted to a role.
export default function ProtectedRoute({ children, requireRole }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <Loader label="Checking your session…" />
  if (!user) return <Navigate to="/login" replace />
  if (requireRole && profile?.role !== requireRole) return <Navigate to="/dashboard" replace />

  return children
}

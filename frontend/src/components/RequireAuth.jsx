import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function RequireAuth({ children, roles, loginPath = '/login' }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="auth-page">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`${loginPath}?next=${next}`} replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

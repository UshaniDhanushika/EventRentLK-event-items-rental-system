import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

export default function AdminLoginPage() {
  const { login, logout } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await login(email, password)
      if (res.role !== 'ADMIN') {
        logout()
        setError('This account is not an administrator.')
        return
      }
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <ThemeToggle className="theme-toggle--floating" />
      <div className="auth-card">
        <h1>Admin sign in</h1>
        <p className="muted small">
          Customer area: <Link to="/login">user sign in</Link>
        </p>

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="banner error">{error}</p>}
          <button type="submit" className="primary wide" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in to dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}

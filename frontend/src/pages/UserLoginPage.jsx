import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

export default function UserLoginPage() {
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const rawNext = params.get('next') || '/'
  const next =
    rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

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
      if (res.role !== 'USER') {
        logout()
        setError('This account is an admin. Please use the admin sign-in page.')
        return
      }
      navigate(next.startsWith('/') ? next : '/', { replace: true })
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
        <h1>Customer sign in</h1>
        <p className="muted small">
          New here?{' '}
          <Link to="/register">Create an account</Link>
        </p>

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
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
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="muted small center">
          <Link to="/admin/login">Staff / admin sign in</Link>
        </p>
      </div>
    </div>
  )
}

import { Link, NavLink } from 'react-router-dom'
import ThemeToggle from '../ThemeToggle'
import { useAuth } from '../../auth/AuthContext'
import logoImg from '../../assets/logo.png'


function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M6 19c0-3.314 2.686-6 6-6s6 2.686 6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function navClass({ isActive }) {
  return `owner-nav-item${isActive ? ' owner-nav-item--active' : ''}`
}

export default function AdminOwnerNav() {
  const { user, logout } = useAuth()

  return (
    <div className="owner-topnav-inner">
      <Link to="/admin" className="owner-logo">
        <img src={logoImg} alt="EventRentLK Logo" className="brand-logo-img" />
        <span className="brand-text">
          <span className="brand-name">EventRentLK</span>
          <span className="brand-tagline">Celebrate More, Spend Less</span>
        </span>
      </Link>
      <nav className="owner-topnav-links" aria-label="Admin navigation">
        <NavLink to="/admin" end className={navClass}>
          <IconGrid />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/users" className={navClass}>
          <IconUser />
          <span>User details</span>
        </NavLink>
      </nav>
      <div className="owner-nav-meta">
        <span className="small">{user?.email}</span>
        <ThemeToggle />
        <button type="button" className="ghost small" onClick={logout}>
          Sign out
        </button>
      </div>
    </div>
  )
}

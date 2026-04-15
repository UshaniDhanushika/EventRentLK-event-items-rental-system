import { Outlet } from 'react-router-dom'
import AdminOwnerNav from '../components/admin/AdminOwnerNav'
import '../styles/adminOwnerDashboard.css'

export default function AdminLayout() {
  return (
    <div className="owner-shell">
      <header className="owner-topnav">
        <AdminOwnerNav />
      </header>
      <Outlet />
      <footer className="owner-footer">
        <p>EventRentLK Admin — Control Center</p>
      </footer>
    </div>
  )
}

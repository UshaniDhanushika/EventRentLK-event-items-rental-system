import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import AdminDashboardHome from './pages/AdminDashboardHome'
import AdminLayout from './pages/AdminLayout'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminUsersPage from './pages/AdminUsersPage'
import RegisterPage from './pages/RegisterPage'
import UserApp from './pages/UserApp'
import UserLoginPage from './pages/UserLoginPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UserApp />} />
      <Route
        path="/checkout"
        element={
          <RequireAuth roles={['USER', 'ADMIN']} loginPath="/login">
            <UserApp />
          </RequireAuth>
        }
      />
      <Route path="/login" element={<UserLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAuth roles={['ADMIN']} loginPath="/admin/login">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<AdminDashboardHome />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

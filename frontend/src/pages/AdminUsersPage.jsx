import { useCallback, useEffect, useState } from 'react'
import { fetchAdminUsers, confirmRental } from '../api/adminApi'

function formatWhen(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return '—'
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchAdminUsers()
      setUsers(list)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleConfirm = async (orderId) => {
    if (!window.confirm('Confirm this rental and send notification email?')) return
    try {
      await confirmRental(orderId)
      alert('Confirmed and email sent!')
      load()
    } catch (e) {
      alert('Failed: ' + e.message)
    }
  }

  return (
    <main className="owner-main">
      <h1 className="owner-page-title">User details</h1>
      <p className="owner-page-sub">Registered accounts and roles</p>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="banner error">{error}</p>}

      {!loading && !error && (
        <div className="owner-panel admin-users-table-wrap">
          <div className="admin-table-scroll">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact Info</th>
                  <th>Rentals (Item | Price | Status | Action)</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="admin-user-name-cell">
                        <strong>{u.fullName || '—'}</strong>
                        <span className="muted tiny">{u.id}</span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-contact-cell">
                        <div className="email">{u.email}</div>
                        <div className="phone tiny muted">{u.phoneNumber || 'No phone'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-rentals-cell">
                        {(u.rentals && u.rentals.length > 0) ? (
                          <ul className="admin-user-rentals-list">
                            {u.rentals.map((r, idx) => (
                              <li key={idx} className="admin-rental-item-row">
                                <div className="rental-info">
                                  <span className="item-name">{r.equipmentName}</span>
                                  <span className="item-price">${r.price ? Number(r.price).toFixed(2) : '0.00'}</span>
                                  <span className={`status-badge ${(r.status || '').toLowerCase().trim().replace('_', '-')}`}>
                                    {r.status}
                                  </span>
                                </div>
                                {(r.status?.toUpperCase().includes('PENDING') || r.status?.toUpperCase().includes('SUBMITTED')) && (
                                  <button 
                                    className="confirm-btn-small" 
                                    onClick={() => handleConfirm(r.orderId)}
                                    style={{ marginLeft: '10px' }}
                                  >
                                    Confirm & Email
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="muted small">No rentals</span>
                        )}
                      </div>
                    </td>
                    <td><span className="admin-role-pill">{u.role}</span></td>
                    <td className="muted small">{formatWhen(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminEarningsChart from '../components/admin/AdminEarningsChart'
import {
  confirmRental,
  createAdminEquipment,
  deleteAdminEquipment,
  fetchAdminDashboard,
  fetchAdminEquipment,
  updateAdminEquipment,
  fetchAllRentals,
} from '../api/adminApi'

const money = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function IconDollar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v18M16 7.5c0-1.933-1.79-3.5-4-3.5S8 5.567 8 7.5s1.79 3.5 4 3.5 4 1.567 4 3.5-1.79 3.5-4 3.5-4-1.567-4-3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconBox() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8.5 12 4l8 4.5v7L12 20 4 15.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M4 8.5 12 13l8-4.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 13v7" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function IconTrend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 16 9 11l4 4 7-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 8h6v6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconStar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5 14.2 9l5.8.4-4.5 3.8 1.4 5.7L12 16.9 6.1 18.9l1.4-5.7L3 9.4l5.8-.4L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const emptyForm = () => ({
  name: '',
  description: '',
  category: '',
  dailyRate: '',
  quantityAvailable: '0',
  imageUrl: '',
  imageFile: null,
  applicablePath: 'both', // 'wedding', 'birthday', 'both'
})

export default function AdminDashboardHome() {
  const [dashboard, setDashboard] = useState(null)
  const [equipment, setEquipment] = useState([])
  const [rentals, setRentals] = useState([])
  const [tab, setTab] = useState('rentals')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const loadDashboard = useCallback(async () => {
    try {
      const d = await fetchAdminDashboard()
      setDashboard(d)
    } catch(e) {}
  }, [])

  const loadEquipment = useCallback(async () => {
    try {
      const list = await fetchAdminEquipment()
      setEquipment(list)
    } catch(e) {}
  }, [])

  const loadRentals = useCallback(async () => {
    try {
      const data = await fetchAllRentals()
      setRentals(data)
    } catch (e) {
      console.error('Failed to load rentals:', e)
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await loadDashboard()
      await loadEquipment()
      await loadRentals()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [loadDashboard, loadEquipment, loadRentals])

  useEffect(() => {
    load()
  }, [load])

  const chartSeries = useMemo(
    () => dashboard?.monthlyEarnings ?? [],
    [dashboard],
  )

  const resetForm = () => {
    setForm(emptyForm())
    setEditingId(null)
  }

  const onEdit = (item) => {
    let path = 'both'
    let cleanDesc = item.description ?? ''
    const match = cleanDesc.match(/::path:(\w+)::/)
    if (match) {
      path = match[1]
      cleanDesc = cleanDesc.replace(/::path:\w+::/, '').trim()
    }

    setEditingId(item.id)
    setForm({
      name: item.name ?? '',
      description: cleanDesc,
      category: item.category ?? '',
      dailyRate: item.dailyRate != null ? String(item.dailyRate) : '',
      quantityAvailable:
        item.quantityAvailable != null ? String(item.quantityAvailable) : '0',
      imageUrl: item.imageUrl ?? '',
      imageFile: null,
      applicablePath: path,
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setForm((f) => ({ ...f, imageUrl: reader.result, imageFile: file }))
    }
    reader.readAsDataURL(file)
  }

  const submitEquipment = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = {
      name: form.name.trim(),
      description: `${form.description.trim()} ::path:${form.applicablePath}::`.trim(),
      category: form.category.trim(),
      dailyRate: Number(form.dailyRate),
      quantityAvailable: Number.parseInt(form.quantityAvailable, 10) || 0,
      imageUrl: form.imageUrl.trim() || undefined,
    }
    try {
      if (editingId) {
        await updateAdminEquipment(editingId, payload)
      } else {
        await createAdminEquipment(payload)
      }
      await loadEquipment()
      resetForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm('Delete this item from the catalog?')) return
    setError(null)
    try {
      await deleteAdminEquipment(id)
      if (editingId === id) resetForm()
      await loadEquipment()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleConfirmRental = async (id) => {
    if (!window.confirm('Confirm this rental and send notification email?')) return
    try {
      await confirmRental(id)
      alert('Rental confirmed and email sent!')
      loadRentals()
    } catch (e) {
      alert('Failed: ' + e.message)
    }
  }

  return (
    <main className="owner-main">
      <div>
        <h1 className="owner-page-title">Admin dashboard</h1>
        <p className="owner-page-sub">Track your rental business performance</p>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="banner error">{error}</p>}

      <div className="owner-tabs" role="tablist" aria-label="Dashboard sections">
        <button
          type="button" role="tab"
          aria-selected={tab === 'rentals'}
          className={`owner-tab${tab === 'rentals' ? ' owner-tab--on' : ''}`}
          onClick={() => setTab('rentals')}
        >
          Manage rentals
        </button>
        <button
          type="button" role="tab"
          aria-selected={tab === 'items'}
          className={`owner-tab${tab === 'items' ? ' owner-tab--on' : ''}`}
          onClick={() => setTab('items')}
        >
          Manage items
        </button>
        <button
          type="button" role="tab"
          aria-selected={tab === 'earnings'}
          className={`owner-tab${tab === 'earnings' ? ' owner-tab--on' : ''}`}
          onClick={() => setTab('earnings')}
        >
          Earnings
        </button>
      </div>

      {tab === 'rentals' && (
        <div className="owner-panel">
          <div className="owner-chart-head">
            <h2>Rental management</h2>
            <p>View orders and send confirmation emails.</p>
          </div>
          <div className="admin-table-scroll">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.customerName}</strong><br/><span className="tiny muted">{r.customerEmail}</span></td>
                    <td className="small">{r.lines?.map(l => l.equipmentName).join(', ')}</td>
                    <td>${r.total?.toFixed(2)}</td>
                    <td>
                       <span className={`status-badge ${(r.status || '').toLowerCase().trim().replace('_', '-')}`}>
                         {r.status}
                       </span>
                    </td>
                    <td>
                       {(r.status?.toUpperCase().includes('PENDING') || r.status?.toUpperCase().includes('SUBMITTED')) && (
                         <button className="confirm-btn-small" onClick={() => handleConfirmRental(r.id)}>
                           Confirm & Email
                         </button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'items' && (
        <div className="owner-panel admin-items-panel">
          <div className="owner-chart-head">
            <h2>Equipment catalog</h2>
            <p>Add, edit, or remove items.</p>
          </div>
          <form className="admin-item-form" onSubmit={submitEquipment}>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Name</span><input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required /></label>
              <label className="admin-field"><span>Category</span><input value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} required /></label>
              <label className="admin-field"><span>Daily rate</span><input type="number" step="0.01" value={form.dailyRate} onChange={e => setForm(f => ({...f, dailyRate: e.target.value}))} required /></label>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="primary" disabled={saving}>{editingId ? 'Save changes' : 'Add item'}</button>
              {editingId && <button type="button" className="ghost" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
          <div className="admin-table-scroll admin-items-table">
            <table className="admin-data-table">
              <thead><tr><th>Name</th><th>Category</th><th>Rate</th><th /></tr></thead>
              <tbody>
                {equipment.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{money.format(Number(item.dailyRate))}</td>
                    <td className="admin-row-actions">
                      <button className="ghost small" onClick={() => onEdit(item)}>Edit</button>
                      <button className="ghost small danger-text" onClick={() => onDelete(item.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'earnings' && dashboard && (
        <div className="owner-panel">
          <h2>Earnings history</h2>
          <AdminEarningsChart data={chartSeries} />
        </div>
      )}

      {dashboard && (
        <div className="owner-stat-grid" style={{ marginTop: '2rem' }}>
          <div className="owner-stat-card">
            <div className="owner-stat-head"><span className="owner-stat-label">Total earnings</span><IconDollar /></div>
            <div className="owner-stat-value accent-num">{money.format(Number(dashboard.totalEarningsThisMonth))}</div>
          </div>
          <div className="owner-stat-card">
            <div className="owner-stat-head"><span className="owner-stat-label">Active rentals</span><IconBox /></div>
            <div className="owner-stat-value accent-num">{dashboard.activeRentals}</div>
          </div>
          <div className="owner-stat-card">
            <div className="owner-stat-head"><span className="owner-stat-label">Total orders</span><IconTrend /></div>
            <div className="owner-stat-value accent-num">{dashboard.totalRentals}</div>
          </div>
        </div>
      )}
    </main>
  )
}

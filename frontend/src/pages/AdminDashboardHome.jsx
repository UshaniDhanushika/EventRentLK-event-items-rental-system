import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminEarningsChart from '../components/admin/AdminEarningsChart'
import {
  createAdminEquipment,
  deleteAdminEquipment,
  fetchAdminDashboard,
  fetchAdminEquipment,
  updateAdminEquipment,
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
  const [tab, setTab] = useState('earnings')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const loadDashboard = useCallback(async () => {
    const d = await fetchAdminDashboard()
    setDashboard(d)
  }, [])

  const loadEquipment = useCallback(async () => {
    const list = await fetchAdminEquipment()
    setEquipment(list)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([loadDashboard(), loadEquipment()])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [loadDashboard, loadEquipment])

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
    // Extract hidden path tag from description if exists
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
      // Embed path as hidden tag in description
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

  return (
    <main className="owner-main">
      <div>
        <h1 className="owner-page-title">Admin dashboard</h1>
        <p className="owner-page-sub">Track your rental business performance</p>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="banner error">{error}</p>}

      {dashboard && !loading && (
        <>
          <div className="owner-stat-grid">
            <div className="owner-stat-card">
              <div className="owner-stat-head">
                <span className="owner-stat-label">Total earnings</span>
                <span className="owner-stat-icon" aria-hidden>
                  <IconDollar />
                </span>
              </div>
              <div className="owner-stat-value accent-num">
                {money.format(Number(dashboard.totalEarningsThisMonth))}
              </div>
              <p className="owner-stat-hint">This month</p>
            </div>
            <div className="owner-stat-card">
              <div className="owner-stat-head">
                <span className="owner-stat-label">Active rentals</span>
                <span className="owner-stat-icon" aria-hidden>
                  <IconBox />
                </span>
              </div>
              <div className="owner-stat-value accent-num">{dashboard.activeRentals}</div>
              <p className="owner-stat-hint">Currently rented</p>
            </div>
            <div className="owner-stat-card">
              <div className="owner-stat-head">
                <span className="owner-stat-label">Total rentals</span>
                <span className="owner-stat-icon" aria-hidden>
                  <IconTrend />
                </span>
              </div>
              <div className="owner-stat-value accent-num">{dashboard.totalRentals}</div>
              <p className="owner-stat-hint">All time</p>
            </div>
            <div className="owner-stat-card">
              <div className="owner-stat-head">
                <span className="owner-stat-label">Average rating</span>
                <span className="owner-stat-icon" aria-hidden>
                  <IconStar />
                </span>
              </div>
              <div className="owner-stat-value accent-num">{dashboard.averageRating}</div>
              <p className="owner-stat-hint">
                {dashboard.ratingPlaceholder ? 'Demo value' : 'Based on reviews'}
              </p>
            </div>
          </div>

          <div className="owner-tabs" role="tablist" aria-label="Dashboard sections">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'earnings'}
              className={`owner-tab${tab === 'earnings' ? ' owner-tab--on' : ''}`}
              onClick={() => setTab('earnings')}
            >
              Earnings history
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'popular'}
              className={`owner-tab${tab === 'popular' ? ' owner-tab--on' : ''}`}
              onClick={() => setTab('popular')}
            >
              Most rented items
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'items'}
              className={`owner-tab${tab === 'items' ? ' owner-tab--on' : ''}`}
              onClick={() => setTab('items')}
            >
              Manage items
            </button>
          </div>

          {tab === 'earnings' && (
            <div className="owner-panel">
              <div className="owner-chart-head">
                <h2>Monthly earnings</h2>
                <p>Your earnings over the past 3 months.</p>
              </div>
              <AdminEarningsChart data={chartSeries} />
            </div>
          )}

          {tab === 'popular' && (
            <div className="owner-panel">
              <div className="owner-chart-head">
                <h2>Most rented items</h2>
                <p>Quantity rented across all orders (by equipment name).</p>
              </div>
              {(dashboard.mostRentedItems?.length ?? 0) === 0 ? (
                <p className="muted">No rental line data yet.</p>
              ) : (
                <ul className="owner-items-list">
                  {dashboard.mostRentedItems.map((row) => (
                    <li key={row.equipmentName}>
                      <span className="owner-items-name">{row.equipmentName}</span>
                      <span className="owner-items-count">{row.rentalCount} rented</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'items' && (
            <div className="owner-panel admin-items-panel">
              <div className="owner-chart-head">
                <h2>Equipment catalog</h2>
                <p>Add, edit, or remove items shown in the storefront.</p>
              </div>

              <form className="admin-item-form" onSubmit={submitEquipment}>
                <div className="admin-form-grid">
                  <label className="admin-field">
                    <span>Name</span>
                    <input
                      value={form.name}
                      onChange={(ev) => setForm((f) => ({ ...f, name: ev.target.value }))}
                      required
                    />
                  </label>
                  <label className="admin-field">
                    <span>Category</span>
                    <input
                      value={form.category}
                      onChange={(ev) => setForm((f) => ({ ...f, category: ev.target.value }))}
                      required
                    />
                  </label>
                  <label className="admin-field">
                    <span>Daily rate ($)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.dailyRate}
                      onChange={(ev) =>
                        setForm((f) => ({ ...f, dailyRate: ev.target.value }))
                      }
                      required
                    />
                  </label>
                  <label className="admin-field">
                    <span>Quantity</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.quantityAvailable}
                      onChange={(ev) =>
                        setForm((f) => ({ ...f, quantityAvailable: ev.target.value }))
                      }
                      required
                    />
                  </label>
                  <label className="admin-field admin-field--full">
                    <span>Description</span>
                    <textarea
                      rows={2}
                      value={form.description}
                      onChange={(ev) =>
                        setForm((f) => ({ ...f, description: ev.target.value }))
                      }
                    />
                  </label>
                  <label className="admin-field admin-field--full">
                    <span>Applicable Path</span>
                    <div className="path-selector">
                      <label className="radio-label">
                        <input 
                          type="radio" 
                          name="applicablePath" 
                          value="wedding" 
                          checked={form.applicablePath === 'wedding'}
                          onChange={() => setForm(f => ({...f, applicablePath: 'wedding'}))}
                        />
                        <span>Wedding Only</span>
                      </label>
                      <label className="radio-label">
                        <input 
                          type="radio" 
                          name="applicablePath" 
                          value="birthday" 
                          checked={form.applicablePath === 'birthday'}
                          onChange={() => setForm(f => ({...f, applicablePath: 'birthday'}))}
                        />
                        <span>Birthday Only</span>
                      </label>
                      <label className="radio-label">
                        <input 
                          type="radio" 
                          name="applicablePath" 
                          value="both" 
                          checked={form.applicablePath === 'both'}
                          onChange={() => setForm(f => ({...f, applicablePath: 'both'}))}
                        />
                        <span>Both</span>
                      </label>
                    </div>
                  </label>
                  <label className="admin-field admin-field--full">
                    <span>Item Image</span>
                    <div className="image-upload-container">
                      {form.imageUrl && (
                        <div className="image-preview">
                          <img src={form.imageUrl} alt="Preview" />
                          <button 
                            type="button" 
                            className="remove-img" 
                            onClick={() => setForm(f => ({...f, imageUrl: '', imageFile: null}))}
                          >
                            ×
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input"
                      />
                      {!form.imageUrl && <p className="muted small">Select an image from your device</p>}
                    </div>
                  </label>
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="primary" disabled={saving}>
                    {editingId ? 'Save changes' : 'Add item'}
                  </button>
                  {editingId && (
                    <button type="button" className="ghost" onClick={resetForm}>
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>

              <div className="admin-table-scroll admin-items-table">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Rate / day</th>
                      <th>Qty</th>
                      <th>Path</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {equipment.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td>{money.format(Number(item.dailyRate))}</td>
                        <td>{item.quantityAvailable}</td>
                        <td className="small muted">
                          {(() => {
                            const match = (item.description || '').match(/::path:(\w+)::/)
                            const path = match ? match[1] : 'both'
                            return (
                              <>
                                {path === 'wedding' && '💍 Wedding'}
                                {path === 'birthday' && '🎂 Birthday'}
                                {path === 'both' && '✨ Both'}
                              </>
                            )
                          })()}
                        </td>
                        <td className="admin-row-actions">
                          <button
                            type="button"
                            className="ghost small"
                            onClick={() => onEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="ghost small danger-text"
                            onClick={() => onDelete(item.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}

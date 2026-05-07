import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminEarningsChart from '../components/admin/AdminEarningsChart'
import AdminCategoryChart from '../components/admin/AdminCategoryChart'
import AdminTopItemsChart from '../components/admin/AdminTopItemsChart'
import {
  confirmRental,
  completeRental,
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

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const emptyForm = () => ({
  name: '',
  description: '',
  category: '',
  dailyRate: '',
  quantityAvailable: '0',
  totalStock: '0',
  imageUrl: '',
  imageFile: null,
  applicablePath: 'both',
})

export default function AdminDashboardHome() {
  const [dashboard, setDashboard] = useState(null)
  const [equipment, setEquipment] = useState([])
  const [rentals, setRentals] = useState([])
  const [tab, setTab] = useState('rentals')
  const [chartType, setChartType] = useState('daily')
  const [search, setSearch] = useState('') // Search state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
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
      const today = new Date().toISOString().split('T')[0]
      const list = await fetchAdminEquipment(today, today)
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

  const chartSeries = useMemo(() => {
    if (!dashboard) return []
    return chartType === 'daily' ? dashboard.dailyEarnings : dashboard.monthlyEarnings
  }, [dashboard, chartType])

  // Filtered Rentals for Search
  const filteredRentals = useMemo(() => {
    if (!search.trim()) return rentals
    const q = search.toLowerCase()
    return rentals.filter(r => 
      (r.customerName || '').toLowerCase().includes(q) || 
      (r.customerEmail || '').toLowerCase().includes(q) ||
      (r.id || '').toLowerCase().includes(q)
    )
  }, [rentals, search])

  // Filtered Inventory for Search
  const filteredInventory = useMemo(() => {
    if (!search.trim() || tab !== 'inventory') return equipment
    const q = search.toLowerCase()
    return equipment.filter(item => 
      (item.name || '').toLowerCase().includes(q) || 
      (item.category || '').toLowerCase().includes(q)
    )
  }, [equipment, search, tab])

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
      quantityAvailable: String(item.quantityAvailable || 0),
      totalStock: String(item.totalStock || item.quantityAvailable || 0),
      imageUrl: item.imageUrl ?? '',
      imageFile: null,
      applicablePath: path,
    })
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
      totalStock: Number.parseInt(form.totalStock, 10) || Number.parseInt(form.quantityAvailable, 10) || 0,
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

  const handleReturnRental = async (id) => {
    if (!window.confirm('Mark this item as returned and send a confirmation email to the customer?')) return
    try {
      await completeRental(id)
      alert('Item marked as returned and stock restored!')
      loadRentals()
      loadEquipment()
    } catch (e) {
      alert('Failed: ' + e.message)
    }
  }

  return (
    <main className="owner-main">
      <div className="admin-dashboard-head-row">
        <div>
          <h1 className="owner-page-title">Admin dashboard</h1>
          <p className="owner-page-sub">Track your rental business performance</p>
        </div>
        
        {/* Search Bar */}
        <div className="admin-search-box">
          <IconSearch />
          <input 
            type="text" 
            placeholder={`Search ${tab}...`} 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="banner error">{error}</p>}

      <div className="owner-tabs" role="tablist" aria-label="Dashboard sections">
        <button type="button" role="tab" aria-selected={tab === 'rentals'} className={`owner-tab${tab === 'rentals' ? ' owner-tab--on' : ''}`} onClick={() => { setTab('rentals'); setSearch(''); }}>Manage rentals</button>
        <button type="button" role="tab" aria-selected={tab === 'items'} className={`owner-tab${tab === 'items' ? ' owner-tab--on' : ''}`} onClick={() => { setTab('items'); setSearch(''); }}>Manage items</button>
        <button type="button" role="tab" aria-selected={tab === 'inventory'} className={`owner-tab${tab === 'inventory' ? ' owner-tab--on' : ''}`} onClick={() => { setTab('inventory'); setSearch(''); }}>Inventory</button>
        <button type="button" role="tab" aria-selected={tab === 'earnings'} className={`owner-tab${tab === 'earnings' ? ' owner-tab--on' : ''}`} onClick={() => { setTab('earnings'); setSearch(''); }}>Earnings</button>
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
                {filteredRentals.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.customerName}</strong><br/><span className="tiny muted">{r.customerEmail}</span></td>
                    <td className="small">{r.lines?.map(l => l.equipmentName).join(', ')}</td>
                    <td>${r.total?.toFixed(2)}</td>
                    <td><span className={`status-badge ${(r.status || '').toLowerCase().trim().replace('_', '-')}`}>{r.status}</span></td>
                    <td className="admin-row-actions">
                       {(r.status?.toUpperCase().includes('PENDING') || r.status?.toUpperCase().includes('SUBMITTED')) && (
                         <button className="confirm-btn-small" onClick={() => handleConfirmRental(r.id)}>Confirm & Email</button>
                       )}
                       {r.status?.toUpperCase() === 'CONFIRMED' && (
                         <button className="confirm-btn-small" style={{ background: 'var(--navy)' }} onClick={() => handleReturnRental(r.id)}>Mark Returned</button>
                       )}
                    </td>
                  </tr>
                ))}
                {filteredRentals.length === 0 && (
                  <tr><td colSpan="5" className="text-center muted" style={{ padding: '2rem' }}>No rentals found matching "{search}"</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'inventory' && (
        <div className="owner-panel">
          <div className="owner-chart-head">
            <h2>Inventory details</h2>
            <p>Track your full stocks and current availability.</p>
          </div>
          <div className="admin-table-scroll">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Full Stock</th>
                  <th>Available Now</th>
                  <th>On Rent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const onRent = Math.max(0, (item.totalStock || item.quantityAvailable) - item.quantityAvailable);
                  const statusClass = item.quantityAvailable === 0 ? 'cancelled' : item.quantityAvailable < 3 ? 'pending' : 'confirmed';
                  const statusText = item.quantityAvailable === 0 ? 'Out of Stock' : item.quantityAvailable < 3 ? 'Low Stock' : 'In Stock';
                  
                  return (
                    <tr key={item.id}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.category}</td>
                      <td>{item.totalStock || item.quantityAvailable}</td>
                      <td>{item.quantityAvailable}</td>
                      <td>{onRent}</td>
                      <td><span className={`status-badge ${statusClass}`}>{statusText}</span></td>
                    </tr>
                  );
                })}
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
              <label className="admin-field">
                <span>Total Inventory (Own)</span>
                <input 
                  type="number" 
                  value={form.totalStock} 
                  onChange={e => setForm(f => ({...f, totalStock: e.target.value, quantityAvailable: e.target.value}))} 
                  required 
                />
              </label>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="primary" disabled={saving}>{editingId ? 'Save changes' : 'Add item'}</button>
              {editingId && <button type="button" className="ghost" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
          <div className="admin-table-scroll admin-items-table">
            <table className="admin-data-table">
              <thead><tr><th>Name</th><th>Category</th><th>Rate</th><th>Stock</th><th /></tr></thead>
              <tbody>
                {equipment.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{money.format(Number(item.dailyRate))}</td>
                    <td>{item.quantityAvailable}</td>
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
          <div className="owner-chart-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>Earnings history</h2>
              <p>Performance trends for {chartType === 'daily' ? 'the current month' : 'the last quarter'}.</p>
            </div>
            <div className="owner-tabs" style={{ marginBottom: 0 }}>
              <button className={`owner-tab ${chartType === 'daily' ? 'owner-tab--on' : ''}`} onClick={() => setChartType('daily')}>Daily</button>
              <button className={`owner-tab ${chartType === 'monthly' ? 'owner-tab--on' : ''}`} onClick={() => setChartType('monthly')}>Monthly</button>
            </div>
          </div>
          <AdminEarningsChart data={chartSeries} />

          <div className="admin-charts-grid">
             <div className="owner-panel inner-panel">
                <div className="owner-chart-head">
                   <h3>Category Popularity</h3>
                   <p>Revenue distribution by equipment type.</p>
                </div>
                <AdminCategoryChart data={dashboard.categoryStats} />
             </div>
             <div className="owner-panel inner-panel">
                <div className="owner-chart-head">
                   <h3>Top Performers</h3>
                   <p>Most frequently rented items.</p>
                </div>
                <AdminTopItemsChart data={dashboard.mostRentedItems} />
             </div>
          </div>
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

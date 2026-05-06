import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createRental, fetchMyRentals } from '../api/rentalsApi'
import { fetchEquipment } from '../api/equipmentApi'
import { fetchMe, changePasswordRequest, updateProfileRequest } from '../api/authApi'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../auth/CartContext'
import ThemeToggle from '../components/ThemeToggle'
import logoImg from '../assets/logo.png'


function defaultEndDate() {
  const d = new Date()
  d.setDate(d.getDate() + 2)
  return d.toISOString().slice(0, 10)
}

function defaultStartDate() {
  return new Date().toISOString().slice(0, 10)
}

function PasswordChangeForm() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState({ type: '', msg: '' })
  const [saving, setSaving] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', msg: 'New passwords do not match' })
      return
    }
    setSaving(true)
    setStatus({ type: '', msg: '' })
    try {
      await changePasswordRequest({ oldPassword, newPassword })
      setStatus({ type: 'success', msg: 'Password changed successfully!' })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setStatus({ type: 'error', msg: err.message || 'Failed to change password' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="password-form" onSubmit={handlePasswordChange}>
      {status.msg && <p className={`banner ${status.type}`}>{status.msg}</p>}
      <label className="admin-field">
        <span>Current Password</span>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
      </label>
      <label className="admin-field">
        <span>New Password</span>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </label>
      <label className="admin-field">
        <span>Confirm New Password</span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </label>
      <button type="submit" className="primary" disabled={saving}>
        {saving ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}

export default function UserApp() {
  const { user, logout, login } = useAuth()
  const { cart, addToCart, updateQty, removeLine, clearCart, cartCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('')
  const [view, setView] = useState('catalog')
  const [eventPath, setEventPath] = useState(null) // 'wedding' or 'birthday'

  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(defaultEndDate)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [myRentals, setMyRentals] = useState([])
  const [loadingRentals, setLoadingRentals] = useState(false)
  const [orderResult, setOrderResult] = useState(null)

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ fullName: '', phoneNumber: '', address: '' })
  const [profileSaving, setProfileSaving] = useState(false)

  // Custom Modal State
  const [confirmModal, setConfirmModal] = useState({ visible: false, item: null })

  useEffect(() => {
    if (location.pathname === '/checkout') {
      setView('checkout')
    } else if (user && !eventPath) {
      setView('path-selection')
    } else {
      setView('catalog')
    }
  }, [location.pathname, user, eventPath])

  useEffect(() => {
    if (user) {
      setCustomerName(user.fullName || '')
      setCustomerEmail(user.email || '')
      setCustomerPhone(user.phoneNumber || '')
      setProfileForm({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || ''
      })
    }
  }, [user])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchEquipment(category || undefined, startDate, endDate)
      setEquipment(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [category, startDate, endDate])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (view === 'profile' && user) {
      setLoadingRentals(true)
      fetchMyRentals()
        .then(setMyRentals)
        .catch(err => console.error("Error fetching rentals:", err))
        .finally(() => setLoadingRentals(false))
    }
  }, [view, user])

  const categories = useMemo(() => {
    const s = new Set(equipment.map((e) => e.category).filter(Boolean))
    return [...s].sort()
  }, [equipment])

  const goCatalog = () => {
    navigate('/')
    setOrderResult(null)
    setEventPath(null) // Reset path when going back to full catalog via logo
  }

  const goCheckout = () => {
    navigate('/checkout')
  }

  const filteredEquipment = useMemo(() => {
    let list = equipment;

    // 1. Path Filter (Explicit & Tag-based)
    if (eventPath === 'wedding') {
      list = list.filter(item => {
        const match = (item.description || '').match(/::path:(\w+)::/)
        const path = match ? match[1] : (item.applicablePath || 'both')
        return path === 'wedding' || path === 'both'
      });
    } else if (eventPath === 'birthday') {
      list = list.filter(item => {
        const match = (item.description || '').match(/::path:(\w+)::/)
        const path = match ? match[1] : (item.applicablePath || 'both')
        return path === 'birthday' || path === 'both'
      });
    }

    // 2. Category Filter
    if (category) {
      list = list.filter(item => item.category === category);
    }

    return list;
  }, [equipment, eventPath, category]);

  const availableCategories = useMemo(() => {
    let cats = [];
    if (eventPath === 'wedding') {
      cats = ['Furniture', 'Decorations', 'Lighting', 'Audio', 'Catering', 'Outdoor', 'Extras'];
    } else if (eventPath === 'birthday') {
      cats = ['Furniture', 'Decorations', 'Lighting', 'Audio', 'Catering', 'Outdoor', 'Extras'];
    } else {
      cats = Array.from(new Set(equipment.map(e => e.category).filter(Boolean)));
    }
    return cats.sort();
  }, [equipment, eventPath]);

  const estimatedTotal = useMemo(() => {
    if (!startDate || !endDate || cart.length === 0) return null
    const s = new Date(startDate)
    const e = new Date(endDate)
    if (e < s) return null
    const days = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1
    return cart.reduce((sum, c) => {
      const rate = Number(c.dailyRate)
      return sum + rate * days * c.quantity
    }, 0)
  }, [cart, startDate, endDate])

  const submitOrder = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setOrderResult(null)
    try {
      const lines = cart.map((c) => ({
        equipmentId: c.equipmentId,
        quantity: c.quantity,
        startDate,
        endDate,
      }))
      const order = await createRental({
        customerName,
        customerEmail,
        customerPhone: customerPhone || undefined,
        notes: notes || undefined,
        lines,
      })
      setOrderResult(order)
      clearCart()
    } catch (err) {
      setOrderResult({ error: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    try {
      await updateProfileRequest(profileForm)
      // Re-fetch user data to update the global auth context
      const updatedUser = await fetchMe()
      if (login) login(updatedUser) // Update the auth context user
      setIsEditingProfile(false)
      alert('Profile updated successfully!')
    } catch (err) {
      alert('Failed to update profile: ' + err.message)
    } finally {
      setProfileSaving(false)
    }
  }

  const handleAddToCartConfirm = (item) => {
    setConfirmModal({ visible: true, item })
  }

  const confirmAddToCart = () => {
    if (confirmModal.item) {
      addToCart(confirmModal.item)
      setConfirmModal({ visible: false, item: null })
      navigate('/checkout')
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <button type="button" className="brand" onClick={goCatalog}>
            <img src={logoImg} alt="EventRentLK Logo" className="brand-logo-img" />
            <span className="brand-text">
              <span className="brand-name">EventRentLK</span>
              <span className="brand-tagline">Celebrate More, Spend Less</span>
            </span>
          </button>
          <nav className="nav">
            <button
              type="button"
              className={view === 'catalog' ? 'active' : ''}
              onClick={goCatalog}
            >
              Catalog
            </button>
            <button
              type="button"
              className={view === 'checkout' ? 'active' : ''}
              onClick={goCheckout}
            >
              Cart
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </button>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="nav-link-button">
                Admin
              </Link>
            )}
            {!user && (
              <>
                <Link to="/login" className="nav-link-button">
                  Sign in
                </Link>
                <Link to="/register" className="nav-link-button primary-outline">
                  Register
                </Link>
              </>
            )}
            {user && (
              <>
                <button
                  type="button"
                  className="nav-user-btn"
                  onClick={() => setView('profile')}
                  title="View Profile"
                >
                  <span className="small">{user.fullName}</span>
                </button>
                <button type="button" className="ghost small" onClick={logout}>
                  Sign out
                </button>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {view === 'path-selection' && (
        <div className="path-selection-overlay">
          <div className="path-selection-content">
            <h1 className="path-title">Welcome, {user?.fullName}!</h1>
            <p className="path-subtitle">What's the occasion for your celebration?</p>
            <div className="path-cards">
              <button
                type="button"
                className="path-card wedding-card"
                onClick={() => {
                  setEventPath('wedding')
                  setView('catalog')
                }}
              >
                <div className="path-card-overlay">
                  <h2>Wedding</h2>
                  <p>Elegant decor, lighting, and essentials for your big day.</p>
                </div>
              </button>
              <button
                type="button"
                className="path-card birthday-card"
                onClick={() => {
                  setEventPath('birthday')
                  setView('catalog')
                }}
              >
                <div className="path-card-overlay">
                  <h2>Birthday Party</h2>
                  <p>Fun, vibrant, and essential gear for the perfect party.</p>
                </div>
              </button>
            </div>
            <button type="button" className="ghost" onClick={() => setView('catalog')}>
              Skip for now, show all items
            </button>
          </div>
        </div>
      )}

      <main className="main">
        {view === 'catalog' && (
          <section className="catalog">
            <div className={`hero ${eventPath || 'default'}`}>
              <h1>
                {eventPath === 'wedding' && "Your Dream Wedding Awaits"}
                {eventPath === 'birthday' && "The Ultimate Birthday Bash"}
                {!eventPath && "The Perfect Wedding & Birthday Essentials"}
              </h1>
              <p>
                {eventPath === 'wedding' && "Find every elegant detail to make your union unforgettable. Premium wedding rentals delivered locally."}
                {eventPath === 'birthday' && "From neon lights to party gear — everything you need for the party of the century."}
                {!eventPath && "From elegant decor to party essentials — reserve your items today. Celebrate more while spending less with EventRentLK."}
              </p>
              {eventPath && (
                <button type="button" className="ghost-nav-btn small" onClick={() => setView('path-selection')}>
                  Change Event Type
                </button>
              )}
            </div>

            <div className="toolbar">
              <div className="category-tabs">
                <button
                  className={`tab-btn ${!category ? 'active' : ''}`}
                  onClick={() => setCategory('')}
                >
                  All Items
                </button>
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    className={`tab-btn ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="banner error">{error}</p>}
            {loading && <p className="muted">Loading catalog…</p>}

            {!loading && !error && (
              <ul className="grid">
                {filteredEquipment.length === 0 && (
                  <p className="muted no-results">No items found specifically for {eventPath}. Try another category or check the full catalog.</p>
                )}
                {filteredEquipment.map((item) => (
                  <li key={item.id} className="card">
                    <div
                      className="card-image"
                      style={{ backgroundImage: `url(${item.imageUrl || ''})` }}
                    >
                      <div className="card-path-badge">
                        {(() => {
                          const match = (item.description || '').match(/::path:(\w+)::/)
                          const path = match ? match[1] : (item.applicablePath || 'both')
                          if (path === 'wedding') return 'Wedding Only'
                          if (path === 'birthday') return 'Party Only'
                          return 'Essential (Both)'
                        })()}
                      </div>
                    </div>
                    <div className="card-body">
                      <p className="card-cat">{item.category}</p>
                      <h2>{item.name}</h2>
                      <p className="card-desc">
                        {(item.description || '').replace(/::path:\w+::/, '').trim()}
                      </p>
                      <div className="card-footer">
                        <span className="price">
                          ${Number(item.dailyRate).toFixed(2)}
                          <small>/day</small>
                        </span>
                        <span className={`stock ${item.quantityAvailable === 0 ? 'out' : ''}`}>
                          {item.quantityAvailable === 0 ? (
                            <span>
                              Sold out 
                              {item.nextAvailableDate && (
                                <span className="next-date"> (Back on {item.nextAvailableDate})</span>
                              )}
                            </span>
                          ) : (
                            <span>
                              {item.quantityAvailable} available
                              {item.missingStockCount > 0 && item.nextAvailableDate && (
                                <span className="next-date"> ({item.missingStockCount} more back on {item.nextAvailableDate})</span>
                              )}
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          className="primary"
                          onClick={() => handleAddToCartConfirm(item)}
                          disabled={item.quantityAvailable < 1}
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {view === 'checkout' && (
          <section className="checkout">
            <h1>Checkout</h1>

            {cart.length === 0 && !orderResult?.id && (
              <p className="muted">
                Your cart is empty. Browse the catalog to add equipment.
              </p>
            )}

            {cart.length > 0 && (
              <>
                <ul className="cart-lines">
                  {cart.map((c) => {
                    // Find the "live" version of this item from our fetched equipment list
                    const liveItem = equipment.find(eq => eq.id === c.equipmentId);
                    const isOverbooked = liveItem && c.quantity > liveItem.quantityAvailable;

                    return (
                      <li key={c.equipmentId} className={isOverbooked ? 'overbooked-line' : ''}>
                        <div>
                          <strong>{c.name}</strong>
                          <span className="muted">
                            {' '}
                            ${Number(c.dailyRate).toFixed(2)}/day
                          </span>
                          {liveItem && (
                            <div className={`availability-tag ${liveItem.quantityAvailable === 0 ? 'out' : ''}`}>
                              {liveItem.quantityAvailable === 0 ? (
                                <span>
                                  Sold out for these dates. 
                                  {liveItem.nextAvailableDate && (
                                    <> Back on <strong>{liveItem.nextAvailableDate}</strong>!</>
                                  )}
                                </span>
                              ) : (
                                <span>
                                  Availability: <strong>{liveItem.quantityAvailable}</strong>
                                  {liveItem.missingStockCount > 0 && liveItem.nextAvailableDate && (
                                    <span className="next-date"> ({liveItem.missingStockCount} more back on {liveItem.nextAvailableDate})</span>
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                          {isOverbooked && (
                            <p className="error-text tiny">⚠️ Not enough stock for these dates!</p>
                          )}
                        </div>
                        <div className="line-actions">
                          <input
                            type="number"
                            min={1}
                            value={c.quantity}
                            onChange={(e) =>
                              updateQty(
                                c.equipmentId,
                                parseInt(e.target.value, 10) || 1
                              )
                            }
                          />
                          <button
                            type="button"
                            className="ghost small"
                            onClick={() => removeLine(c.equipmentId)}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <form className="checkout-form" onSubmit={submitOrder}>
                  <h2>Rental period</h2>
                  <div className="row">
                    <label>
                      Start
                      <input
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          setStartDate(newStart);
                          if (endDate && newStart > endDate) {
                            setEndDate(newStart);
                          }
                        }}
                        required
                      />
                    </label>
                    <label>
                      End
                      <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                  {estimatedTotal != null && (
                    <div className="cart-financials">
                      <p className="estimate">
                        Estimated total:{' '}
                        <strong>${estimatedTotal.toFixed(2)}</strong>
                        <span className="muted"> (before taxes & fees)</span>
                      </p>
                      <p className="advance-notice">
                        Advance Payment (60%):{' '}
                        <strong className="text-ok">${(estimatedTotal * 0.6).toFixed(2)}</strong>
                      </p>
                      <p className="remainder-notice small muted">
                        Remaining Balance: ${(estimatedTotal * 0.4).toFixed(2)}
                      </p>
                    </div>
                  )}

                  <h2>Contact</h2>
                  <label>
                    Name
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Phone <span className="muted">(optional)</span>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </label>
                  <label>
                    Notes <span className="muted">(optional)</span>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </label>

                  <button
                    type="submit"
                    className="primary wide"
                    disabled={submitting}
                  >
                    {submitting ? 'Placing request…' : 'Submit rental request'}
                  </button>
                </form>
              </>
            )}

            {orderResult?.error && (
              <p className="banner error">{orderResult.error}</p>
            )}
            {orderResult?.id && (
              <div className="success">
                <h2>Request received</h2>
                <p>
                  Order <strong>#{orderResult.id}</strong> — we will confirm
                  availability by email.
                </p>
                <p className="muted">
                  Total: ${Number(orderResult.total).toFixed(2)}
                </p>
              </div>
            )}
          </section>
        )}
        {view === 'profile' && (
          <section className="profile-section">
            <div className="profile-card">
              <header className="profile-header">
                <button type="button" className="ghost small" onClick={() => setView('catalog')}>
                  ← Back to Catalog
                </button>
                <h1>Account Profile</h1>
              </header>

              <div className="profile-grid">
                <div className="profile-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Personal Information</h3>
                    {!isEditingProfile && (
                      <button type="button" className="ghost small" onClick={() => setIsEditingProfile(true)}>Edit</button>
                    )}
                  </div>

                  {!isEditingProfile ? (
                    <>
                      <div className="info-group">
                        <label>Full Name</label>
                        <p>{user.fullName}</p>
                      </div>
                      <div className="info-group">
                        <label>Email Address</label>
                        <p>{user.email}</p>
                      </div>
                      <div className="info-group">
                        <label>Phone Number</label>
                        <p>{user.phoneNumber || 'Not provided'}</p>
                      </div>
                      <div className="info-group">
                        <label>Address</label>
                        <p>{user.address || 'Not provided'}</p>
                      </div>
                    </>
                  ) : (
                    <form className="profile-edit-form" onSubmit={handleUpdateProfile}>
                      <label className="admin-field">
                        <span>Full Name</span>
                        <input 
                          value={profileForm.fullName} 
                          onChange={e => setProfileForm(f => ({...f, fullName: e.target.value}))} 
                          required 
                        />
                      </label>
                      <label className="admin-field">
                        <span>Phone Number</span>
                        <input 
                          value={profileForm.phoneNumber} 
                          onChange={e => setProfileForm(f => ({...f, phoneNumber: e.target.value}))} 
                        />
                      </label>
                      <label className="admin-field">
                        <span>Address</span>
                        <textarea 
                          value={profileForm.address} 
                          onChange={e => setProfileForm(f => ({...f, address: e.target.value}))} 
                          rows={2}
                        />
                      </label>
                      <div className="form-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="primary small" disabled={profileSaving}>
                          {profileSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" className="ghost small" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="profile-actions">
                  <h3>Security</h3>
                  <PasswordChangeForm />
                </div>
              </div>

              <hr className="profile-hr" />

              <div className="profile-history">
                <h3>Rental History</h3>
                {loadingRentals && <p className="muted">Loading rentals...</p>}
                {!loadingRentals && myRentals.length === 0 && (
                  <p className="muted">No rental records found.</p>
                )}
                {!loadingRentals && myRentals.length > 0 && (
                  <div className="admin-table-scroll">
                    <table className="admin-data-table profile-rentals-table">
                      <thead>
                        <tr>
                          <th>Dates</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Advance</th>
                          <th>Remainder</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myRentals.map(rental => (
                          <tr key={rental.id}>
                            <td className="small">
                              <div className="date-range">
                                <span>{rental.startDate}</span>
                                <span className="muted">to</span>
                                <span>{rental.endDate}</span>
                              </div>
                            </td>
                            <td>
                              <div className="rental-items-summ">
                                {rental.lines.map(l => (
                                  <div key={l.equipmentId} className="tiny">
                                    {l.quantity}x {l.equipmentName}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="font-bold">${Number(rental.total).toFixed(2)}</td>
                            <td className="text-ok">${Number(rental.advancePayment || 0).toFixed(2)}</td>
                            <td className="text-warn">
                              ${(Number(rental.total) - Number(rental.advancePayment || 0)).toFixed(2)}
                            </td>
                            <td>
                              <span className={`status-badge ${rental.status?.toLowerCase().replace('_', '-')}`}>
                                {rental.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* CUSTOM ADD TO CART CONFIRMATION POPUP */}
      {confirmModal.visible && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="modal-icon-box">🛒</div>
            <h3>Add to Cart?</h3>
            <p>Would you like to add <strong>{confirmModal.item?.name}</strong> to your cart and proceed to checkout?</p>
            <div className="modal-actions">
              <button 
                type="button" 
                className="modal-btn-yes" 
                onClick={confirmAddToCart}
              >
                Yes, Go to Cart
              </button>
              <button 
                type="button" 
                className="modal-btn-no" 
                onClick={() => setConfirmModal({ visible: false, item: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>© {new Date().getFullYear()} EventRentLK — Premium Event Rentals in Sri Lanka</p>
      </footer>
    </div>
  )
}

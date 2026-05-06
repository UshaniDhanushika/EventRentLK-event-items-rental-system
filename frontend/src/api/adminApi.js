import { http } from './httpClient'

export function fetchAdminSummary() {
  return http('/api/admin/summary')
}

export function fetchAdminDashboard() {
  return http('/api/admin/dashboard')
}

export function fetchAdminUsers() {
  return http('/api/admin/users')
}

export function fetchAdminEquipment(startDate, endDate) {
  let q = ''
  if (startDate) q += (q ? '&' : '?') + `startDate=${startDate}`
  if (endDate) q += (q ? '&' : '?') + `endDate=${endDate}`
  return http(`/api/admin/equipment${q}`)
}

export function createAdminEquipment(body) {
  return http('/api/admin/equipment', { method: 'POST', body: JSON.stringify(body) })
}

export function updateAdminEquipment(id, body) {
  return http(`/api/admin/equipment/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteAdminEquipment(id) {
  return http(`/api/admin/equipment/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function confirmRental(orderId) {
  return http(`/api/admin/rentals/${encodeURIComponent(orderId)}/confirm`, { method: 'POST' })
}

export function completeRental(orderId) {
  return http(`/api/admin/rentals/${encodeURIComponent(orderId)}/return`, { method: 'POST' })
}

export function fetchAllRentals() {
  return http('/api/rentals')
}

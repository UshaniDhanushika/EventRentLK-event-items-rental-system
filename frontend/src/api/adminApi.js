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

export function fetchAdminEquipment() {
  return http('/api/admin/equipment')
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

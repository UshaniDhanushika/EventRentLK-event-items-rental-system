import { http } from './httpClient'

export function fetchEquipment(category, startDate, endDate) {
  let q = category ? `category=${encodeURIComponent(category)}` : ''
  if (startDate) q += (q ? '&' : '') + `startDate=${startDate}`
  if (endDate) q += (q ? '&' : '') + `endDate=${endDate}`
  return http(`/api/equipment${q ? '?' + q : ''}`)
}

export function fetchAvailability(id, startDate, endDate) {
  return http(`/api/equipment/${id}/availability?startDate=${startDate}&endDate=${endDate}`)
}

import { http } from './httpClient'

export function fetchEquipment(category) {
  const q = category ? `?category=${encodeURIComponent(category)}` : ''
  return http(`/api/equipment${q}`)
}

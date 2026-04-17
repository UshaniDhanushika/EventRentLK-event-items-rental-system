import { http } from './httpClient'

export function createRental(body) {
  return http('/api/rentals', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function fetchRentals() {
  return http('/api/rentals')
}

export function fetchMyRentals() {
  return http('/api/rentals/my-rentals')
}

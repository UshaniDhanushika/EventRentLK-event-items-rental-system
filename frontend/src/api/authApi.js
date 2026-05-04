import { http } from './httpClient'

export function loginRequest(body) {
  return http('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function registerRequest(body) {
  return http('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function fetchMe() {
  return http('/api/auth/me')
}

export function changePasswordRequest(body) {
  return http('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateProfileRequest(body) {
  return http('/api/auth/update-profile', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

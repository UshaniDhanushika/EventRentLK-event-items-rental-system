import { getToken } from '../auth/authStorage'

const base = import.meta.env.VITE_API_URL ?? ''

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text()
    let msg = text
    try {
      const j = JSON.parse(text)
      msg = j.message || j.error || text
    } catch {
      /* use text */
    }
    throw new Error(msg || res.statusText)
  }
  const ct = res.headers.get('content-type')
  if (ct && ct.includes('application/json')) {
    return res.json()
  }
  return res.text()
}

export function http(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  if (
    options.body != null &&
    !(options.body instanceof FormData) &&
    !headers['Content-Type']
  ) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return fetch(`${base}${path}`, { ...options, headers }).then(handleResponse)
}

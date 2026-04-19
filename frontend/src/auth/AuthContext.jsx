import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { fetchMe, loginRequest, registerRequest } from '../api/authApi'
import { clearToken, getToken, setToken } from './authStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setUser(null)
      return
    }
    try {
      const profile = await fetchMe()
      setUser(profile)
    } catch {
      clearToken()
      setUser(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await refreshMe()
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [refreshMe])

  const login = useCallback(async (email, password) => {
    const res = await loginRequest({ email, password })
    setToken(res.token)
    setUser({
      email: res.email,
      fullName: res.fullName,
      role: res.role,
    })
    return res
  }, [])

  const register = useCallback(async (fullName, email, password, address, phoneNumber) => {
    const res = await registerRequest({ fullName, email, password, address, phoneNumber })
    setToken(res.token)
    setUser({
      email: res.email,
      fullName: res.fullName,
      role: res.role,
    })
    return res
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshMe,
    }),
    [user, loading, login, register, logout, refreshMe]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

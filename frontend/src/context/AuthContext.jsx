import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const AuthContext = createContext(null)

/**
 * AuthProvider — React Context for global auth state.
 * Stores: user object, JWT token, loading flag.
 * Methods: login, logout, updateUser.
 * Persists token in localStorage (retrieved on mount).
 */
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(() => localStorage.getItem('ll_token'))
  const [loading, setLoading] = useState(true)

  /* Fetch profile on mount if token exists */
  const fetchMe = useCallback(async (tkn) => {
    if (!tkn) { setLoading(false); return }
    try {
      const res  = await fetch(`${API}/profile/me`, {
        headers: { Authorization: `Bearer ${tkn}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        localStorage.removeItem('ll_token')
        setToken(null)
      }
    } catch {
      /* server offline — keep token but clear user */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMe(token) }, [token, fetchMe])

  const login = (userData, jwt) => {
    localStorage.setItem('ll_token', jwt)
    setToken(jwt)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('ll_token')
    setToken(null)
    setUser(null)
  }

  const updateUser = (updated) => setUser(u => ({ ...u, ...updated }))

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export { API }

import { createContext, useState, useEffect, useContext } from 'react'
import { login as apiLogin } from '../api/api'

// Default context value
const defaultContextValue = {
  user: null,
  isAuthenticated: false,
  loading: false,
  login: async () => ({ success: false, error: 'Not initialized' }),
  logout: () => {}
}

const AuthContext = createContext(defaultContextValue)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context || context === defaultContextValue) {
    return defaultContextValue
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)

  // Check if user is stored in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await apiLogin(email, password)
      const { user: userData, token } = response

      if (userData && userData.id && token) {
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', token)
        setUser(userData)
        setIsAuthenticated(true)
        setLoading(false)
        return { success: true, user: userData }
      }

      setLoading(false)
      return { success: false, error: 'Invalid response from server' }
    } catch (error) {
      setLoading(false)
      console.error('Login error:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed. Please try again.',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token') // Remove if exists
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}



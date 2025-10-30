import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api' // Import the main api instance

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('kellyflo-token')
      if (token) {
        // Set the token in axios headers for this request
        const response = await api.get('/auth/user')
        setUser(response.data)
        setIsAuthenticated(true)
        setError(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // If token is invalid, clear it
      if (error.response?.status === 401) {
        localStorage.removeItem('kellyflo-token')
        delete api.defaults.headers.common['Authorization']
      }
      setError('Authentication failed. Please login again.')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.post('/auth/login', credentials)
      const { user, token } = response.data
      
      // Store token and set auth header
      localStorage.setItem('kellyflo-token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser(user)
      setIsAuthenticated(true)
      setError(null)
      
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.post('/auth/register', userData)
      const { user, token } = response.data
      
      // Store token and set auth header
      localStorage.setItem('kellyflo-token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser(user)
      setIsAuthenticated(true)
      setError(null)
      
      return response
    } catch (error) {
      // Handle Laravel validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
        // Format validation errors for display
        const formattedErrors = Object.values(validationErrors).flat().join(', ')
        setError(formattedErrors)
      } else {
        const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
        setError(errorMessage)
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Only call logout API if we have a token
      const token = localStorage.getItem('kellyflo-token')
      if (token) {
        await api.post('/auth/logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local state regardless of API call success
      localStorage.removeItem('kellyflo-token')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      setIsAuthenticated(false)
      setError(null)
    }
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    checkAuth // Expose checkAuth for manual re-authentication
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
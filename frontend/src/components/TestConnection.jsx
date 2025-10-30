import React, { useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const TestConnection = () => {
  const [status, setStatus] = useState('testing')
  const [user, setUser] = useState(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test API connection
      const response = await authAPI.getUser()
      setUser(response.data.user)
      setStatus('connected')
    } catch (error) {
      setStatus('failed')
      console.error('Connection test failed:', error)
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Connection Test</h3>
      <div className={`inline-block px-3 py-1 rounded-full text-sm ${
        status === 'connected' ? 'bg-green-100 text-green-800' :
        status === 'failed' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        Status: {status}
      </div>
      {user && (
        <div className="mt-2">
          <p>User: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>
      )}
    </div>
  )
}

export default TestConnection;
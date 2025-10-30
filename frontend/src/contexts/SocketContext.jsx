import React, { createContext, useContext, useEffect, useState } from 'react'
import io from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('kellyflo-token')
      const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8000'
      
      const newSocket = io(WS_URL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      })

      newSocket.on('connect', () => {
        console.log('✅ Connected to WebSocket server')
      })

      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from WebSocket server')
      })

      newSocket.on('error', (error) => {
        console.error('WebSocket error:', error)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    } else {
      // Close socket if user logs out
      if (socket) {
        socket.close()
        setSocket(null)
      }
    }
  }, [isAuthenticated, user])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}
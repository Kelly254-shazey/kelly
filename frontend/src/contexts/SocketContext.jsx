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
    // Only attempt to connect when user is authenticated and an explicit WS URL is provided.
    const WS_URL = import.meta.env.VITE_WS_URL

    if (!WS_URL) {
      // No websocket configured; avoid noisy 404 handshake attempts.
      if (socket) {
        socket.close()
        setSocket(null)
      }
      return
    }

    if (isAuthenticated && user) {
      const token = localStorage.getItem('kellyflo-token')

      let newSocket
      try {
        newSocket = io(WS_URL, {
          auth: { token },
          transports: ['websocket', 'polling']
        })
      } catch (err) {
        console.error('Failed to initialize socket.io client:', err)
        return
      }

      // Handle common socket lifecycle events.
      newSocket.on('connect', () => {
        console.log('✅ Connected to WebSocket server')
      })

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from WebSocket server', reason)
      })

      // When handshake or server-side auth fails, socket.io emits connect_error.
      newSocket.on('connect_error', (error) => {
        console.error('Socket connect_error:', error)
        // If the server responded with an unexpected HTTP status (like 404),
        // close the socket to prevent repeated handshake attempts.
        try {
          newSocket.close()
        } catch (e) {
          // ignore
        }
        setSocket(null)
      })

      newSocket.on('error', (error) => {
        console.error('WebSocket error:', error)
      })

      setSocket(newSocket)

      return () => {
        try {
          newSocket && newSocket.close()
        } catch (e) {
          // ignore
        }
        setSocket(null)
      }
    } else {
      // Close socket if user logs out or is not authenticated
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
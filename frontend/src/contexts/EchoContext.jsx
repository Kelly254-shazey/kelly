import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

// NOTE: This file requires the following frontend packages to be installed:
// npm install laravel-echo pusher-js

let Echo = null
let Pusher = null

// Async function to load optional dependencies
const loadDependencies = async () => {
  try {
    const [echoModule, pusherModule] = await Promise.all([
      import('laravel-echo'),
      import('pusher-js')
    ])
    Echo = echoModule.default || echoModule
    Pusher = pusherModule.default || pusherModule
  } catch (e) {
    // ignore if not available at development time
  }
}

// Load dependencies on module initialization
loadDependencies()

const EchoContext = createContext()

export const useEcho = () => {
  const ctx = useContext(EchoContext)
  return ctx
}

export const EchoProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [echo, setEcho] = useState(null)

  useEffect(() => {
    const WS_ENABLED = import.meta.env.VITE_ENABLE_WS === 'true'
    const WS_DRIVER = (import.meta.env.VITE_WS_DRIVER || 'socketio')

    if (!WS_ENABLED || WS_DRIVER !== 'echo') {
      return
    }

    if (!Echo || !Pusher) {
      console.warn('Echo or Pusher not installed. Run: npm install laravel-echo pusher-js')
      return
    }

    if (!isAuthenticated) return

    // Attach Pusher to the window for Echo to use
    try {
      window.Pusher = Pusher
      const echoInstance = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        wsHost: import.meta.env.VITE_PUSHER_HOST || window.location.hostname,
        wsPort: parseInt(import.meta.env.VITE_PUSHER_PORT || 6001, 10),
        forceTLS: import.meta.env.VITE_PUSHER_FORCE_TLS === 'true',
        encrypted: import.meta.env.VITE_PUSHER_FORCE_TLS === 'true',
        // Disable stats/cluster auto-detection in dev local setups
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/broadcasting/auth',
        auth: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('kellyflo-token')}`
          }
        }
      })

      setEcho(echoInstance)

      return () => {
        try {
          echoInstance.disconnect()
        } catch (e) {
          // ignore
        }
        setEcho(null)
      }
    } catch (e) {
      console.error('Failed to initialize Echo:', e)
    }
  }, [isAuthenticated])

  // Helper: subscribe to a private call channel and forward events via a callback
  const subscribeToCall = (callId, handler) => {
    if (!echo || !callId) return null
    try {
      const channel = echo.private(`call.${callId}`)
      // Listen for both CallEvent and WebRTCSignalEvent payload structure
      channel.listen('.App\\Events\\CallEvent', (e) => {
        if (handler) handler(e)
      })
      channel.listen('.App\\Events\\WebRTCSignalEvent', (e) => {
        if (handler) handler(e)
      })
      return channel
    } catch (e) {
      console.error('Echo subscribeToCall failed:', e)
      return null
    }
  }

  const unsubscribeFromChannel = (channel) => {
    if (!channel || !echo) return
    try {
      // stopListening removes event listeners; leaveChannel disconnects the subscription
      channel.stopListening()
      echo.leaveChannel(channel.name)
    } catch (e) {
      // ignore
    }
  }

  return (
    <EchoContext.Provider value={{ echo, subscribeToCall, unsubscribeFromChannel }}>
      {children}
    </EchoContext.Provider>
  )
}

export default EchoContext

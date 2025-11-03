import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSocket } from './SocketContext'
import { useEcho } from './EchoContext'
import { useAuth } from './AuthContext'

const CallContext = createContext()

export const useCall = () => {
  const context = useContext(CallContext)
  if (!context) {
    throw new Error('useCall must be used within a CallProvider')
  }
  return context
}

export const CallProvider = ({ children }) => {
  const [incomingCall, setIncomingCall] = useState(null)
  const [activeCall, setActiveCall] = useState(null)
  const [callHistory, setCallHistory] = useState([])
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  const socket = useSocket()
  const { echo, subscribeToCall, unsubscribeFromChannel } = useEcho() || {}
  const { user } = useAuth()

  useEffect(() => {
    if (socket && user) {
      setupSocketListeners()
    }

    // If Echo is available, set up an echo subscription for active/ incoming calls
    let echoChannel = null
    if (echo && user) {
      // If we already have an incomingCall with call_id, subscribe
      const callId = incomingCall?.call_id || activeCall?.call_id
      if (callId) {
        echoChannel = subscribeToCall(callId, (evt) => {
          // evt contains { event, payload }
          if (!evt || !evt.event) return
          const name = evt.event
          const payload = evt.payload
          // Reuse same handlers as socket
          if (name === 'initiated') {
            setIncomingCall(payload.call)
            playRingtone()
          } else if (name === 'accepted') {
            setActiveCall(payload.call)
            setIncomingCall(null)
            stopRingtone()
            setIsCallModalOpen(true)
          } else if (name === 'rejected') {
            setIncomingCall(null)
            stopRingtone()
            showNotification('Call rejected', 'error')
          } else if (name === 'ended') {
            setActiveCall(null)
            setIncomingCall(null)
            setIsCallModalOpen(false)
            stopRingtone()
            if (payload.call) {
              setCallHistory(prev => [payload.call, ...prev.slice(0, 49)])
            }
          } else if (name === 'participant_joined') {
            if (activeCall && activeCall.id === payload.call_id) {
              setActiveCall(prev => ({
                ...prev,
                participants: [...(prev.participants || []), payload.participant]
              }))
            }
          } else if (name === 'participant_left') {
            if (activeCall && activeCall.id === payload.call_id) {
              setActiveCall(prev => ({
                ...prev,
                participants: prev.participants?.filter(p => p.user_id !== payload.user_id) || []
              }))
            }
          }
        })
      }
    }
  }, [socket, user])

  const setupSocketListeners = () => {
    // Listen for incoming calls
    socket.on('call.initiated', (data) => {
      setIncomingCall(data.call)
      // Play ringtone
      playRingtone()
    })

    // Listen for call acceptance
    socket.on('call.accepted', (data) => {
      setActiveCall(data.call)
      setIncomingCall(null)
      stopRingtone()
      setIsCallModalOpen(true)
    })

    // Listen for call rejection
    socket.on('call.rejected', (data) => {
      setIncomingCall(null)
      stopRingtone()
      showNotification('Call rejected', 'error')
    })

    // Listen for call ending
    socket.on('call.ended', (data) => {
      setActiveCall(null)
      setIncomingCall(null)
      setIsCallModalOpen(false)
      stopRingtone()
      
      // Add to call history
      if (data.call) {
        setCallHistory(prev => [data.call, ...prev.slice(0, 49)])
      }
    })

    // Listen for participant updates
    socket.on('call.participant_joined', (data) => {
      if (activeCall && activeCall.id === data.call_id) {
        setActiveCall(prev => ({
          ...prev,
          participants: [...(prev.participants || []), data.participant]
        }))
      }
    })

    socket.on('call.participant_left', (data) => {
      if (activeCall && activeCall.id === data.call_id) {
        setActiveCall(prev => ({
          ...prev,
          participants: prev.participants?.filter(p => p.user_id !== data.user_id) || []
        }))
      }
    })

    return () => {
      if (socket) {
        socket.off('call.initiated')
        socket.off('call.accepted')
        socket.off('call.rejected')
        socket.off('call.ended')
        socket.off('call.participant_joined')
        socket.off('call.participant_left')
      }

      if (echoChannel) {
        try { unsubscribeFromChannel(echoChannel) } catch (e) { /* ignore */ }
      }
    }
  }

  const playRingtone = () => {
    // In a real app, you'd play an actual ringtone
    console.log('Playing ringtone...')
  }

  const stopRingtone = () => {
    console.log('Stopping ringtone...')
  }

  const showNotification = (message, type = 'info') => {
    // You can integrate with a notification system here
    console.log(`Notification (${type}): ${message}`)
  }

  const acceptCall = async (callId) => {
    try {
      const response = await fetch(`/api/calls/${callId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kellyflo-token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        socket.emit('accept_call', { call_id: callId })
      } else {
        const error = await response.json()
        showNotification(error.message || 'Failed to accept call', 'error')
      }
    } catch (error) {
      console.error('Error accepting call:', error)
      showNotification('Failed to accept call', 'error')
    }
  }

  const rejectCall = async (callId) => {
    try {
      const response = await fetch(`/api/calls/${callId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kellyflo-token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        socket.emit('reject_call', { call_id: callId })
        setIncomingCall(null)
        stopRingtone()
      }
    } catch (error) {
      console.error('Error rejecting call:', error)
      showNotification('Failed to reject call', 'error')
    }
  }

  const endCall = async (callId) => {
    try {
      const response = await fetch(`/api/calls/${callId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kellyflo-token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        socket.emit('end_call', { call_id: callId })
        setActiveCall(null)
        setIsCallModalOpen(false)
      }
    } catch (error) {
      console.error('Error ending call:', error)
      showNotification('Failed to end call', 'error')
    }
  }

  const initiateCall = async (receiverId, callType = 'video') => {
    try {
      const response = await fetch('/api/calls/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kellyflo-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiver_id: receiverId,
          call_type: callType
        })
      })

      if (response.ok) {
        const data = await response.json()
        setActiveCall(data.call)
        setIsCallModalOpen(true)
        return data.call
      } else {
        const error = await response.json()
        showNotification(error.message || 'Failed to initiate call', 'error')
        return null
      }
    } catch (error) {
      console.error('Error initiating call:', error)
      showNotification('Failed to initiate call', 'error')
      return null
    }
  }

  const initiateConference = async (participantIds, callType = 'video') => {
    try {
      const response = await fetch('/api/calls/conference', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kellyflo-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participant_ids: participantIds,
          call_type: callType
        })
      })

      if (response.ok) {
        const data = await response.json()
        setActiveCall(data.call)
        setIsCallModalOpen(true)
        return data.call
      } else {
        const error = await response.json()
        showNotification(error.message || 'Failed to initiate conference', 'error')
        return null
      }
    } catch (error) {
      console.error('Error initiating conference:', error)
      showNotification('Failed to initiate conference', 'error')
      return null
    }
  }

  const fetchCallHistory = async () => {
    try {
      const response = await fetch('/api/calls/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kellyflo-token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCallHistory(data.calls)
        return data.calls
      }
    } catch (error) {
      console.error('Error fetching call history:', error)
      return []
    }
  }

  const closeCallModal = () => {
    setIsCallModalOpen(false)
    if (activeCall) {
      endCall(activeCall.id)
    }
  }

  const value = {
    // State
    incomingCall,
    activeCall,
    callHistory,
    isCallModalOpen,
    
    // Actions
    acceptCall,
    rejectCall,
    endCall,
    initiateCall,
    initiateConference,
    fetchCallHistory,
    closeCallModal,
    
    // Utility
    showNotification
  }

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  )
}
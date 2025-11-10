import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, Users, Heart, MessageCircle, Share, MoreVertical, Radio } from 'lucide-react'
import { streamingAPI } from '../../services/api'
import { useSocket } from '../../contexts/SocketContext'

const LiveStream = () => {
  const { streamId } = useParams()
  const navigate = useNavigate()
  const [streams, setStreams] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentStream, setCurrentStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const videoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const socket = useSocket()

  useEffect(() => {
    fetchStreams()
  }, [])

  // Handle direct stream access via URL
  useEffect(() => {
    if (streamId && !currentStream) {
      fetchStreamById(streamId)
    } else if (streamId && currentStream && !isStreaming) {
      // Initialize viewer connection when stream is loaded
      initializeViewerConnection(currentStream)
    }
  }, [streamId, currentStream, isStreaming])

  useEffect(() => {
    if (socket) {
      socket.on('stream_started', (stream) => {
        setStreams(prev => [stream, ...prev])
      })

      socket.on('stream_ended', (streamId) => {
        setStreams(prev => prev.filter(s => s.id !== streamId))
        if (currentStream?.id === streamId) {
          setCurrentStream(null)
        }
      })

      socket.on('viewer_count_update', ({ streamId, viewer_count }) => {
        setStreams(prev => prev.map(stream =>
          stream.id === streamId ? { ...stream, viewer_count } : stream
        ))
        if (currentStream?.id === streamId) {
          setCurrentStream(prev => ({ ...prev, viewer_count }))
        }
      })

      // WebRTC signaling events
      socket.on('stream_offer', async ({ streamId, offer, from }) => {
        if (peerConnectionRef.current && currentStream?.id === streamId) {
          try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))
            const answer = await peerConnectionRef.current.createAnswer()
            await peerConnectionRef.current.setLocalDescription(answer)

            socket.emit('stream_answer', {
              streamId,
              answer,
              to: from
            })
          } catch (error) {
            console.error('Error handling stream offer:', error)
          }
        }
      })

      socket.on('stream_answer', async ({ answer }) => {
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))
          } catch (error) {
            console.error('Error handling stream answer:', error)
          }
        }
      })

      socket.on('ice_candidate', async ({ candidate }) => {
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
          } catch (error) {
            console.error('Error adding ICE candidate:', error)
          }
        }
      })

      return () => {
        socket.off('stream_started')
        socket.off('stream_ended')
        socket.off('viewer_count_update')
        socket.off('stream_offer')
        socket.off('stream_answer')
        socket.off('ice_candidate')
      }
    }
  }, [socket, currentStream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop any active streams
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
      if (remoteVideoRef.current?.srcObject) {
        remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
    }
  }, [])

  const fetchStreams = async () => {
    try {
      const response = await streamingAPI.getStreams()
      setStreams(response.data.streams)
    } catch (error) {
      console.error('Error fetching streams:', error)
    }
  }

  const fetchStreamById = async (id) => {
    try {
      const response = await streamingAPI.getStream(id)
      setCurrentStream(response.data.stream)
    } catch (error) {
      console.error('Error fetching stream:', error)
    }
  }

  const startStream = async () => {
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Create WebRTC peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      })

      peerConnectionRef.current = peerConnection

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream)
      })

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice_candidate', {
            streamId: newStream.id,
            candidate: event.candidate
          })
        }
      }

      const response = await streamingAPI.createStream({
        title: 'My Live Stream',
        description: 'Join me for an amazing live session!'
      })

      const newStream = response.data.stream
      setCurrentStream(newStream)
      setIsStreaming(true)

      // Notify via socket
      if (socket) {
        socket.emit('start_stream', newStream)
      }

    } catch (error) {
      console.error('Error starting stream:', error)
      alert('Failed to start stream. Please check your camera and microphone permissions.')
    }
  }

  const endStream = async () => {
    if (!currentStream) return

    try {
      await streamingAPI.endStream(currentStream.id)
      
      // Stop media stream
      const stream = videoRef.current?.srcObject
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      if (socket) {
        socket.emit('end_stream', currentStream.id)
      }

      setIsStreaming(false)
      setCurrentStream(null)
    } catch (error) {
      console.error('Error ending stream:', error)
    }
  }

  const joinStream = (stream) => {
    // Navigate to unique stream URL
    navigate(`/live/${stream.id}`)
  }

  const initializeViewerConnection = async (stream) => {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      })

      peerConnectionRef.current = peerConnection

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
          setRemoteStream(event.streams[0])
        }
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice_candidate', {
            streamId: stream.id,
            candidate: event.candidate
          })
        }
      }

      // Create offer and send to broadcaster via socket
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      if (socket) {
        socket.emit('join_stream', {
          streamId: stream.id,
          offer: offer
        })
      }

    } catch (error) {
      console.error('Error initializing viewer connection:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Streaming</h1>
          <p className="text-gray-600 dark:text-gray-400">Watch and broadcast live videos</p>
        </div>
        
        {!isStreaming ? (
          <button
            onClick={startStream}
            className="btn-primary flex items-center space-x-2 bg-red-600 hover:bg-red-700"
          >
            <Radio className="h-4 w-4" />
            <span>Go Live</span>
          </button>
        ) : (
          <button
            onClick={endStream}
            className="btn-primary flex items-center space-x-2 bg-red-600 hover:bg-red-700"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>End Stream</span>
          </button>
        )}
      </div>

      {/* Current Stream or Stream List */}
      {currentStream ? (
        <StreamViewer 
          stream={currentStream} 
          isOwnStream={isStreaming}
          videoRef={videoRef}
          remoteVideoRef={remoteVideoRef}
          onBack={() => {
            if (streamId) {
              navigate('/live')
            } else {
              setCurrentStream(null)
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <StreamCard
              key={stream.id}
              stream={stream}
              onJoin={() => joinStream(stream)}
            />
          ))}
        </div>
      )}

      {streams.length === 0 && !isStreaming && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Radio className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No live streams</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Be the first to start a live stream!</p>
          <button onClick={startStream} className="btn-primary">
            Start Your First Stream
          </button>
        </div>
      )}

      {/* Streaming Preview (hidden when not streaming) */}
      {isStreaming && (
        <div className="fixed bottom-4 right-4 w-64 h-48 bg-black rounded-lg shadow-lg border-2 border-red-500 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 flex items-center space-x-1 text-white text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>LIVE</span>
            <span>{currentStream?.viewer_count || 0} viewers</span>
          </div>
        </div>
      )}
    </div>
  )
}

const StreamCard = ({ stream, onJoin }) => {
  return (
    <div className="card group cursor-pointer transform hover:scale-105 transition-transform duration-200">
      <div className="relative">
        <img
          src={stream.thumbnail || 'https://picsum.photos/800/450?random=1'}
          onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxpdmUgU3RyZWFtPC90ZXh0Pjwvc3ZnPg==' }}
          alt={stream.title}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
        <div className="absolute top-2 left-2 flex items-center space-x-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>LIVE</span>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center space-x-1 text-white text-sm">
          <Users className="h-4 w-4" />
          <span>{stream.viewer_count} watching</span>
        </div>
        <button
          onClick={onJoin}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200"
        >
          <div className="bg-white bg-opacity-90 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-200">
            <Play className="h-6 w-6 text-gray-900" />
          </div>
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
          {stream.title}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {stream.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <img
              src={stream.user?.avatar || '/default-avatar.png'}
              onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyNCIgZmlsbD0iI2RkZCIvPjxjaXJjbGUgY3g9IjI0IiBjeT0iMTgiIHI9IjEwIiBmaWxsPSIjOTk5Ii8+PHBhdGggZD0iTTQwIDI4YzAtNi42LTUuNC0xMi0xMi0xMnMtMTIgNS40LTEyIDEyIiBmaWxsPSIjOTk5Ii8+PC9zdmc+' }}
              alt={stream.user?.name || 'Streamer'}
              className="w-6 h-6 rounded-full"
            />
            <span>{stream.user?.name || 'Unknown User'}</span>
          </div>
          <span>{stream.category}</span>
        </div>
      </div>
    </div>
  )
}

const StreamViewer = ({ stream, isOwnStream, onBack, videoRef, remoteVideoRef }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [reactions, setReactions] = useState([])
  const socket = useSocket()

  // Early return if stream is not available
  if (!stream) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Radio className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Loading stream...</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (socket) {
      socket.emit('join_stream', stream.id)

      socket.on('stream_message', (message) => {
        setMessages(prev => [...prev, message])
      })

      socket.on('stream_reaction', (reaction) => {
        setReactions(prev => [...prev, { ...reaction, id: Date.now() }])
        setTimeout(() => {
          setReactions(prev => prev.filter(r => r.id !== reaction.id))
        }, 3000)
      })

      return () => {
        socket.off('stream_message')
        socket.off('stream_reaction')
      }
    }
  }, [socket, stream.id])

  const sendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message = {
      stream_id: stream.id,
      content: newMessage,
      user: { name: 'You', avatar: '/default-avatar.png' }
    }

    if (socket) {
      socket.emit('send_stream_message', message)
    }

    setMessages(prev => [...prev, { ...message, id: Date.now() }])
    setNewMessage('')
  }

  const sendReaction = (reaction) => {
    if (socket) {
      socket.emit('send_stream_reaction', {
        stream_id: stream.id,
        type: reaction
      })
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Video Player */}
      <div className="flex-1">
        <div className="bg-black rounded-xl overflow-hidden aspect-video relative">
          {isOwnStream ? (
            // Show own stream (broadcaster view)
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            // Show remote stream (viewer view)
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          {/* Stream Info Overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 bg-black bg-opacity-50 rounded-full px-3 py-1 text-white">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span>LIVE</span>
              <Users className="h-4 w-4" />
              <span>{stream.viewer_count || 0} viewers</span>
            </div>
            
            <button
              onClick={onBack}
              className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full hover:bg-opacity-70 transition-colors"
            >
              Back to streams
            </button>
          </div>

          {/* Reactions */}
          {reactions.map((reaction) => (
            <div
              key={reaction.id}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 80 + 10}%`,
                bottom: '20%'
              }}
            >
              {reaction.type === 'heart' && (
                <Heart className="h-8 w-8 text-red-500 fill-red-500" />
              )}
              {reaction.type === 'like' && (
                <div className="text-2xl">👍</div>
              )}
            </div>
          ))}
        </div>

        {/* Stream Details */}
        <div className="mt-4 card">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {stream.title || 'Untitled Stream'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {stream.description || 'No description available'}
          </p>
          <div className="flex items-center space-x-4">
            <img
              src={stream.user?.avatar || '/default-avatar.png'}
              alt={stream.user?.name || 'Streamer'}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {stream.user?.name || 'Unknown User'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stream.category || 'General'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-full lg:w-80 flex flex-col">
        <div className="card flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Live Chat</h3>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.map((message) => (
              <div key={message.id} className="flex space-x-3">
                <img
                  src={message.user.avatar}
                  alt={message.user.name}
                  className="w-6 h-6 rounded-full flex-shrink-0"
                />
                <div>
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {message.user.name}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 ml-2">
                      {message.content}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Reactions */}
          {!isOwnStream && (
            <div className="flex justify-between mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {['heart', 'like', 'fire', 'clap'].map((reaction) => (
                <button
                  key={reaction}
                  onClick={() => sendReaction(reaction)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors"
                >
                  {reaction === 'heart' && <Heart className="h-5 w-5 text-red-500" />}
                  {reaction === 'like' && <span>👍</span>}
                  {reaction === 'fire' && <span>🔥</span>}
                  {reaction === 'clap' && <span>👏</span>}
                </button>
              ))}
            </div>
          )}

          {/* Message Input */}
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              id="livestream-message"
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 input-field text-sm"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 bg-royal-blue text-white rounded-lg text-sm font-medium hover:bg-royal-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LiveStream;
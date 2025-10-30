import React, { useState, useEffect, useRef } from 'react'
import { Search, MoreVertical, Phone, Video, Smile, Paperclip, Send } from 'lucide-react'
import { useSocket } from '../../contexts/SocketContext'
import { messagesAPI } from '../../services/api'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import CallButton from '../../components/VideoCall/CallButton';


const Messages = () => {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const socket = useSocket()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (socket && activeConversation) {
      socket.emit('join_conversation', activeConversation.id)
      
      socket.on('new_message', (message) => {
        if (message.conversation_id === activeConversation.id) {
          setMessages(prev => [...prev, message])
        }
      })

      return () => {
        socket.off('new_message')
      }
    }
  }, [socket, activeConversation])

  const fetchConversations = async () => {
    try {
      const response = await messagesAPI.getConversations()
      setConversations(response.data.conversations)
      if (response.data.conversations.length > 0) {
        setActiveConversation(response.data.conversations[0])
        fetchMessages(response.data.conversations[0].id)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      const response = await messagesAPI.getMessages(conversationId)
      setMessages(response.data.messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation) return

    try {
      const message = {
        conversation_id: activeConversation.id,
        content: newMessage,
        temporary_id: Date.now()
      }

      // Optimistically add message
      setMessages(prev => [...prev, {
        ...message,
        id: message.temporary_id,
        user: { name: 'You', avatar: '/default-avatar.png' },
        created_at: new Date().toISOString(),
        is_sending: true
      }])

      setNewMessage('')

      // Send via socket
      if (socket) {
        socket.emit('send_message', message)
      }

      // Also send via API for persistence
      await messagesAPI.sendMessage(message)

    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-royal-blue"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => {
                setActiveConversation(conversation)
                fetchMessages(conversation.id)
              }}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                activeConversation?.id === conversation.id
                  ? 'bg-royal-blue/10 border-r-2 border-royal-blue'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={conversation.other_user.avatar || '/default-avatar.png'}
                    alt={conversation.other_user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  {conversation.is_online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {conversation.other_user.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {conversation.last_message_time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {conversation.last_message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}

            <div className="flex items-center space-x-2">
  <CallButton user={activeConversation.other_user} type="video" />
  <CallButton user={activeConversation.other_user} type="audio" />
</div>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={activeConversation.other_user.avatar || '/default-avatar.png'}
                  alt={activeConversation.other_user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {activeConversation.other_user.name}
                  </h3>
                  <p className="text-sm text-green-500">
                    {activeConversation.is_online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <Video className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.is_own
                        ? 'bg-royal-blue text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                    } ${message.is_sending ? 'opacity-70' : ''}`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.is_own ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {message.is_sending && ' • Sending...'}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <button type="button" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button type="button" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  <Smile className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-royal-blue"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-royal-blue text-white rounded-full hover:bg-royal-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages;
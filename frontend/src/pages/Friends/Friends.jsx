import React, { useState } from 'react'
import { Users, UserPlus, UserMinus, Check, X, Clock, Search, MessageCircle, Mail, MapPin, Briefcase, Calendar } from 'lucide-react'

const Friends = ({ onNavigateToMessages }) => {
  // All users in the database with additional details
  const [allUsers] = useState([
    { id: 1, name: 'Sarah Johnson', avatar: '👩', mutualFriends: 12, status: 'online', bio: 'Software Engineer | Coffee lover ☕', location: 'San Francisco, CA', job: 'Senior Developer at Tech Corp' },
    { id: 2, name: 'Mike Chen', avatar: '👨', mutualFriends: 8, status: 'offline', bio: 'Digital Marketing Specialist', location: 'New York, NY', job: 'Marketing Manager' },
    { id: 3, name: 'Emily Davis', avatar: '👩‍🦰', mutualFriends: 15, status: 'online', bio: 'Designer & Creative Director', location: 'Los Angeles, CA', job: 'Creative Director at Design Studio' },
    { id: 4, name: 'Alex Rodriguez', avatar: '🧑', mutualFriends: 5, status: 'online', bio: 'Fitness enthusiast 💪', location: 'Miami, FL', job: 'Personal Trainer' },
    { id: 5, name: 'Jessica Park', avatar: '👩‍🦱', mutualFriends: 3, status: 'offline', bio: 'Travel blogger ✈️', location: 'Seattle, WA', job: 'Content Creator' },
    { id: 6, name: 'David Kim', avatar: '👨‍💼', mutualFriends: 7, status: 'online', bio: 'Entrepreneur & Investor', location: 'Austin, TX', job: 'CEO at StartupHub' },
    { id: 7, name: 'Lisa Anderson', avatar: '👩‍💻', mutualFriends: 10, status: 'online', bio: 'Full-stack developer', location: 'Boston, MA', job: 'Lead Developer' },
    { id: 8, name: 'Tom Wilson', avatar: '👨‍🎨', mutualFriends: 6, status: 'offline', bio: 'Artist & Illustrator 🎨', location: 'Portland, OR', job: 'Freelance Artist' },
    { id: 9, name: 'Maria Garcia', avatar: '👩‍🔬', mutualFriends: 9, status: 'online', bio: 'Research Scientist', location: 'San Diego, CA', job: 'Senior Researcher' },
    { id: 10, name: 'James Brown', avatar: '👨‍🏫', mutualFriends: 4, status: 'offline', bio: 'Teacher & Mentor', location: 'Chicago, IL', job: 'High School Teacher' },
    { id: 11, name: 'Sophie Turner', avatar: '👩‍🎤', mutualFriends: 11, status: 'online', bio: 'Music producer 🎵', location: 'Nashville, TN', job: 'Music Producer' },
    { id: 12, name: 'Ryan Lee', avatar: '👨‍⚕️', mutualFriends: 8, status: 'online', bio: 'Healthcare professional', location: 'Denver, CO', job: 'Physician' },
  ])

  const [friends, setFriends] = useState([1, 2, 3])
  const [receivedRequests, setReceivedRequests] = useState([4, 5])
  const [sentRequests, setSentRequests] = useState([6])
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageText, setMessageText] = useState('')

  const getUser = (id) => allUsers.find(u => u.id === id)
  const getFriends = () => friends.map(id => getUser(id)).filter(Boolean)
  const getReceivedRequests = () => receivedRequests.map(id => getUser(id)).filter(Boolean)
  const getSentRequests = () => sentRequests.map(id => getUser(id)).filter(Boolean)
  
  const getAvailableUsers = () => {
    const unavailableIds = [...friends, ...receivedRequests, ...sentRequests]
    return allUsers.filter(u => !unavailableIds.includes(u.id))
  }

  const filterUsers = (users) => {
    if (!searchQuery.trim()) return users
    return users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const handleAcceptRequest = (userId) => {
    setFriends([...friends, userId])
    setReceivedRequests(receivedRequests.filter(id => id !== userId))
  }

  const handleRejectRequest = (userId) => {
    setReceivedRequests(receivedRequests.filter(id => id !== userId))
  }

  const handleSendRequest = (userId) => {
    setSentRequests([...sentRequests, userId])
  }

  const handleCancelRequest = (userId) => {
    setSentRequests(sentRequests.filter(id => id !== userId))
  }

  const handleRemoveFriend = (userId) => {
    const user = getUser(userId)
    if (user && window.confirm(`Remove ${user.name} from your friends?`)) {
      setFriends(friends.filter(id => id !== userId))
    }
  }

  const handleAvatarClick = (user) => {
    setSelectedUser(user)
  }

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Call parent navigation function with user data and message
      if (onNavigateToMessages) {
        onNavigateToMessages({
          selectedUser: selectedUser,
          initialMessage: messageText
        })
      }
      setMessageText('')
      setShowMessageModal(false)
      setSelectedUser(null)
    }
  }

  const openMessageModal = (user) => {
    // Check if user is a friend before allowing messaging
    if (friends.includes(user.id)) {
      setSelectedUser(user)
      setShowMessageModal(true)
    } else {
      // If not friends, just navigate to messages without pre-filled text
      if (onNavigateToMessages) {
        onNavigateToMessages({
          selectedUser: user
        })
      }
    }
  }

  const quickMessageFriend = (user) => {
    // Quick navigation to messages for friends
    if (onNavigateToMessages) {
      onNavigateToMessages({
        selectedUser: user
      })
    }
  }

  const tabs = [
    { id: 'all', label: 'All Users', count: getAvailableUsers().length },
    { id: 'friends', label: 'Friends', count: friends.length },
    { id: 'requests', label: 'Requests', count: receivedRequests.length },
    { id: 'sent', label: 'Sent', count: sentRequests.length },
  ]

  const UserCard = ({ user, actions }) => (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => handleAvatarClick(user)}
          className="text-4xl hover:scale-110 transition-transform cursor-pointer"
        >
          {user.avatar}
        </button>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{user.mutualFriends} mutual friends</span>
            <span>•</span>
            <span className={`flex items-center ${user.status === 'online' ? 'text-green-600' : 'text-gray-500'}`}>
              <span className={`w-2 h-2 rounded-full mr-1 ${user.status === 'online' ? 'bg-green-600' : 'bg-gray-400'}`}></span>
              {user.status}
            </span>
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        {actions}
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Friends</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Connect with people</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'all' && (
            <div className="space-y-3">
              {filterUsers(getAvailableUsers()).length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No users found matching your search' : 'No available users to connect with'}
                </div>
              ) : (
                filterUsers(getAvailableUsers()).map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    actions={
                      <button
                        onClick={() => handleSendRequest(user.id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Add Friend</span>
                      </button>
                    }
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="space-y-3">
              {filterUsers(getFriends()).length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No friends found matching your search' : 'No friends yet. Check out all users to connect with people!'}
                </div>
              ) : (
                filterUsers(getFriends()).map(friend => (
                  <UserCard
                    key={friend.id}
                    user={friend}
                    actions={
                      <>
                        <button
                          onClick={() => quickMessageFriend(friend)}
                          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>Message</span>
                        </button>
                        <button
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <UserMinus className="h-4 w-4" />
                          <span>Remove</span>
                        </button>
                      </>
                    }
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-3">
              {filterUsers(getReceivedRequests()).length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No requests found matching your search' : 'No pending friend requests'}
                </div>
              ) : (
                filterUsers(getReceivedRequests()).map(request => (
                  <UserCard
                    key={request.id}
                    user={request}
                    actions={
                      <>
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <Check className="h-4 w-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Decline</span>
                        </button>
                      </>
                    }
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div className="space-y-3">
              {filterUsers(getSentRequests()).length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No sent requests found matching your search' : 'No pending sent requests'}
                </div>
              ) : (
                filterUsers(getSentRequests()).map(request => (
                  <UserCard
                    key={request.id}
                    user={request}
                    actions={
                      <button
                        onClick={() => handleCancelRequest(request.id)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        Cancel Request
                      </button>
                    }
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Details Modal */}
      {selectedUser && !showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex flex-col items-center">
                <div className="text-6xl mb-4">{selectedUser.avatar}</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedUser.name}</h2>
                <div className={`flex items-center mb-4 ${selectedUser.status === 'online' ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${selectedUser.status === 'online' ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                  <span className="text-sm capitalize">{selectedUser.status}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start space-x-3 text-gray-700 dark:text-gray-300">
                  <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{selectedUser.bio}</p>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <Briefcase className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{selectedUser.job}</p>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <MapPin className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{selectedUser.location}</p>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <Users className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{selectedUser.mutualFriends} mutual friends</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => openMessageModal(selectedUser)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Send Message</span>
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => { setShowMessageModal(false); setMessageText(''); }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-4xl">{selectedUser.avatar}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Send message to {selectedUser.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.status}</p>
                </div>
              </div>

              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Send Message</span>
                </button>
                <button
                  onClick={() => { setShowMessageModal(false); setMessageText(''); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Friends
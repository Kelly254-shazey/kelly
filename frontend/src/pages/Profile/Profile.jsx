import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Camera, MapPin, Calendar, Users, Edit3, Bookmark, Grid, Play, Heart, MessageCircle, Share2, MoreHorizontal, Video, Phone, Mail } from 'lucide-react'
import { profileAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import CallButton from '../../components/VideoCall/CallButton'


const Profile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('posts')
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    county: '',
    avatar: null,
    cover_photo: null
  })

  useEffect(() => {
    fetchUserProfile()
  }, [userId])

  const fetchUserProfile = async () => {
    setLoading(true)
    try {
      const res = await profileAPI.getProfile(userId)
      const payload = res?.data ?? {}
      const u = payload.user
      if (u) {
        setUser({
          id: u.id,
          name: u.name,
          username: u.username || u.email,
          email: u.email,
          avatar: u.avatar || '/default-avatar.png',
          cover_photo: u.cover_photo || '/default-cover.svg',
          bio: u.bio || '',
          location: u.county || '',
          joined_date: u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
          followers_count: u.followers_count ?? 0,
          following_count: u.following_count ?? 0,
          is_following: payload.is_following ?? false,
          is_own_profile: payload.is_own_profile ?? (!userId || userId === currentUser.id),
          friendship_status: payload.friendship_status
        })
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Error fetching profile', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!user) return
    try {
      if (user.is_following) {
        await profileAPI.unfollow(user.id)
        setUser(prev => ({ ...prev, is_following: false, followers_count: (prev.followers_count || 1) - 1 }))
      } else {
        await profileAPI.follow(user.id)
        setUser(prev => ({ ...prev, is_following: true, followers_count: (prev.followers_count || 0) + 1 }))
      }
    } catch (err) {
      console.error('Error following/unfollowing', err)
    }
  }

  const handleMessageUser = (userToMessage) => {
    navigate('/messages', { 
      state: { 
        selectedUser: {
          id: userToMessage.id,
          name: userToMessage.name,
          avatar: userToMessage.avatar,
          username: userToMessage.username,
          status: 'online'
        }
      } 
    })
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setEditForm({
      name: user.name || '',
      bio: user.bio || '',
      county: user.location || '',
      avatar: null,
      cover_photo: null
    })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({
      name: '',
      bio: '',
      county: '',
      avatar: null,
      cover_photo: null
    })
  }

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData()
      formData.append('name', editForm.name)
      formData.append('bio', editForm.bio)
      formData.append('county', editForm.county)
      
      if (editForm.avatar) {
        formData.append('avatar', editForm.avatar)
      }
      if (editForm.cover_photo) {
        formData.append('cover_photo', editForm.cover_photo)
      }

      const res = await profileAPI.updateProfile(formData)
      setUser(prev => ({
        ...prev,
        name: res.data.user.name,
        bio: res.data.user.bio,
        location: res.data.user.county,
        avatar: res.data.user.avatar || prev.avatar,
        cover_photo: res.data.user.cover_photo || prev.cover_photo
      }))
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating profile', err)
    }
  }

  const handleCreatePost = () => {
    // Navigate to home/feed and trigger create post modal
    navigate('/', { state: { openCreatePost: true } })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile not found</h3>
        <p className="text-gray-500 dark:text-gray-400">The profile could not be loaded. Try refreshing or check your network connection.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-8">
      {/* Cover Photo Section */}
      <div className="relative h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-b-2xl overflow-hidden shadow-lg">
        <img
          src={user.cover_photo}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {user.is_own_profile && (
          <button className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-md">
            <Camera className="h-4 w-4" />
            <span className="font-medium">Edit Cover Photo</span>
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
            <div className="flex relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-24 w-24 sm:h-32 sm:w-32 rounded-full ring-4 ring-white dark:ring-gray-800 bg-white dark:bg-gray-800 object-cover"
              />
              {user.is_own_profile && (
                <button className="absolute bottom-0 right-0 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
              <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{user.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
              </div>
              <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                {user.is_own_profile ? (
                  <>
                    <button onClick={handleEditClick} className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                    <button onClick={handleCreatePost} className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Create Post
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleFollow} className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                      {user.is_following ? 'Following' : '+ Follow'}
                    </button>
                    <button 
                      onClick={() => handleMessageUser(user)}
                      className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </button>
                    <CallButton user={user} type="video" />
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="hidden sm:block md:hidden mt-6 min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{user.name}</h1>
          </div>
        </div>
      </div>

      {/* Profile Info Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{user.followers_count}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{user.following_count}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              {user.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {user.joined_date}</span>
              </div>
            </div>
          </div>
          {user.bio && (
            <div className="mt-3 text-gray-700 dark:text-gray-300 text-sm">
              {user.bio}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{editForm.bio.length}/500 characters</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={editForm.county}
                    onChange={(e) => setEditForm(prev => ({ ...prev, county: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your location"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.files[0] }))}
                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditForm(prev => ({ ...prev, cover_photo: e.target.files[0] }))}
                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button onClick={handleCancelEdit} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">
                  Cancel
                </button>
                <button onClick={handleSaveProfile} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {[
              { id: 'posts', label: 'Posts', icon: Grid },
              { id: 'reels', label: 'Reels', icon: Video },
              { id: 'friends', label: 'Friends', icon: Users },
              ...(user.is_own_profile ? [{ id: 'saved', label: 'Saved', icon: Bookmark }] : [])
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {activeTab === 'posts' && <PostsTab userId={user.id} isOwnProfile={user.is_own_profile} />}
        {activeTab === 'reels' && <ReelsTab userId={user.id} isOwnProfile={user.is_own_profile} />}
        {activeTab === 'saved' && <SavedTab />}
        {activeTab === 'friends' && <FriendsTab userId={user.id} onMessageUser={handleMessageUser} />}
      </div>
    </div>
  )
}

// Enhanced Posts Tab with real post structure
const PostsTab = ({ userId, isOwnProfile }) => {
  const navigate = useNavigate()
  
  // Mock posts - replace with actual API call
  const mockPosts = [
    {
      id: 1,
      content: 'Beautiful sunset today! 🌅',
      image: '/default-cover.svg',
      likes: 234,
      comments: 12,
      shares: 5,
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      content: 'Working on something exciting...',
      image: null,
      likes: 89,
      comments: 7,
      shares: 2,
      timestamp: '1 day ago'
    },
    {
      id: 3,
      content: 'Weekend vibes ✨',
      image: '/default-cover.svg',
      likes: 456,
      comments: 23,
      shares: 8,
      timestamp: '3 days ago'
    }
  ]

  if (mockPosts.length === 0) {
    return (
      <div className="text-center py-16">
        <Grid className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {isOwnProfile ? "Share your first post!" : "No posts to show"}
        </p>
        {isOwnProfile && (
          <button 
            onClick={() => navigate('/', { state: { openCreatePost: true } })}
            className="btn-primary"
          >
            Create Post
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {mockPosts.map((post) => (
        <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4">
            <p className="text-gray-900 dark:text-white mb-3">{post.content}</p>
            {post.image && (
              <img src={post.image} alt="Post" className="w-full rounded-lg mb-3" />
            )}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button className="flex items-center space-x-2 hover:text-blue-600">
                <Heart className="h-5 w-5" />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-blue-600">
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-blue-600">
                <Share2 className="h-5 w-5" />
                <span>{post.shares}</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Enhanced Reels Tab
const ReelsTab = ({ userId, isOwnProfile }) => {
  const navigate = useNavigate()
  
  const mockReels = [
    { id: 1, thumbnail: '/default-cover.svg', views: '12K' },
    { id: 2, thumbnail: '/default-cover.svg', views: '8.5K' },
    { id: 3, thumbnail: '/default-cover.svg', views: '23K' }
  ]

  if (mockReels.length === 0) {
    return (
      <div className="text-center py-16">
        <Video className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No reels yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {isOwnProfile ? "Create your first reel!" : "No reels to show"}
        </p>
        {isOwnProfile && (
          <button 
            onClick={() => navigate('/reels', { state: { openCreate: true } })}
            className="btn-primary"
          >
            Create Reel
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {mockReels.map((reel) => (
        <div 
          key={reel.id} 
          className="relative aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
          onClick={() => navigate(`/reels/${reel.id}`)}
        >
          <img
            src={reel.thumbnail}
            alt="Reel"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 text-white flex items-center space-x-1">
            <Play className="h-4 w-4 fill-white" />
            <span className="text-sm font-semibold">{reel.views}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// Enhanced Saved Tab
const SavedTab = () => {
  const navigate = useNavigate()
  
  return (
    <div className="text-center py-16">
      <Bookmark className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved items</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        Save posts and reels to view them later
      </p>
      <button 
        onClick={() => navigate('/')}
        className="btn-secondary"
      >
        Explore Feed
      </button>
    </div>
  )
}

// Enhanced Friends Tab
const FriendsTab = ({ userId, onMessageUser }) => {
  const navigate = useNavigate()
  
  // Mock friends - replace with actual API call
  const mockFriends = [
    { id: 1, name: 'Sarah Johnson', avatar: '/default-avatar.png', username: 'sarahj', mutualFriends: 12, status: 'online' },
    { id: 2, name: 'Mike Chen', avatar: '/default-avatar.png', username: 'mikechen', mutualFriends: 8, status: 'offline' },
    { id: 3, name: 'Emily Davis', avatar: '/default-avatar.png', username: 'emilyd', mutualFriends: 15, status: 'online' },
    { id: 4, name: 'Alex Rodriguez', avatar: '/default-avatar.png', username: 'alexr', mutualFriends: 5, status: 'offline' },
    { id: 5, name: 'Jessica Park', avatar: '/default-avatar.png', username: 'jessicap', mutualFriends: 3, status: 'online' },
    { id: 6, name: 'David Kim', avatar: '/default-avatar.png', username: 'davidk', mutualFriends: 7, status: 'online' }
  ]

  if (mockFriends.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No friends yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Start connecting with people
        </p>
        <button 
          onClick={() => navigate('/friends')}
          className="btn-primary"
        >
          Find Friends
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Friends ({mockFriends.length})
        </h3>
        <button 
          onClick={() => navigate('/friends')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          See All Friends
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockFriends.map((friend) => (
          <div 
            key={friend.id} 
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-square relative cursor-pointer" onClick={() => navigate(`/profile/${friend.id}`)}>
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h4 
                className="font-semibold text-gray-900 dark:text-white mb-1 cursor-pointer hover:text-blue-600"
                onClick={() => navigate(`/profile/${friend.id}`)}
              >
                {friend.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                {friend.mutualFriends} mutual friends
              </p>
              <div className="flex space-x-2">
                <button 
                  onClick={() => onMessageUser(friend)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Message</span>
                </button>
                <button 
                  onClick={() => navigate(`/profile/${friend.id}`)}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Profile;
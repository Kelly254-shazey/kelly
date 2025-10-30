import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Camera, MapPin, Calendar, Users, Edit3, Bookmark, Grid, Play } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import CallButton from '../../components/VideoCall/CallButton';


const Profile = () => {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('posts')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [userId])

  const fetchUserProfile = async () => {
    // Simulate API call
    setTimeout(() => {
      setUser({
        id: userId || currentUser.id,
        name: 'Kelly Flo',
        username: 'kellyflo',
        avatar: '/default-avatar.png',
        cover_photo: '/default-cover.jpg',
        bio: 'Digital creator | Love connecting with amazing people | Always learning and growing 🌟',
        location: 'Nairobi, Kenya',
        joined_date: '2024-01-15',
        followers_count: 1247,
        following_count: 563,
        is_following: false,
        is_own_profile: !userId || userId === currentUser.id
      })
      setLoading(false)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover Photo */}
      <div className="relative h-64 bg-gradient-romantic rounded-xl overflow-hidden mb-6">
        <img
          src={user.cover_photo}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {user.is_own_profile && (
          <button className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:shadow-lg transition-shadow">
            <Camera className="h-4 w-4" />
            <span>Edit Cover</span>
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="relative -mt-20 px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800"
              />
              {user.is_own_profile && (
                <button className="absolute bottom-2 right-2 bg-royal-blue text-white p-2 rounded-full hover:bg-royal-blue/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* User Details */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
              <p className="text-gray-700 dark:text-gray-300 max-w-md">{user.bio}</p>
              
              <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {user.joined_date}</span>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-gray-900 dark:text-white">{user.followers_count}</span>
                  <span className="text-gray-500 dark:text-gray-400">Followers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-gray-900 dark:text-white">{user.following_count}</span>
                  <span className="text-gray-500 dark:text-gray-400">Following</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!user.is_own_profile && (
  <div className="flex space-x-3">
    <CallButton user={user} type="video" />
    <button className="btn-secondary">Message</button>
  </div>
)}
          <div className="mt-4 md:mt-0 flex space-x-3">
            {user.is_own_profile ? (
              <>
                <button className="btn-secondary flex items-center space-x-2">
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
                <button className="btn-primary">Create Post</button>
              </>
            ) : (
              <>
                <button className="btn-primary">
                  {user.is_following ? 'Following' : 'Follow'}
                </button>
                <button className="btn-secondary">Message</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'posts', label: 'Posts', icon: Grid },
            { id: 'reels', label: 'Reels', icon: Play },
            { id: 'saved', label: 'Saved', icon: Bookmark },
            { id: 'friends', label: 'Friends', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-royal-blue text-royal-blue'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'posts' && <PostsTab userId={user.id} />}
        {activeTab === 'reels' && <ReelsTab userId={user.id} />}
        {activeTab === 'saved' && <SavedTab />}
        {activeTab === 'friends' && <FriendsTab userId={user.id} />}
      </div>
    </div>
  )
}

// Tab Components
const PostsTab = ({ userId }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3, 4, 5, 6].map((post) => (
      <div key={post} className="bg-gray-100 dark:bg-gray-700 aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
        <img
          src="/default-cover.jpg"
          alt="Post"
          className="w-full h-full object-cover"
        />
      </div>
    ))}
  </div>
)

const ReelsTab = ({ userId }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3].map((reel) => (
      <div key={reel} className="relative cursor-pointer group">
        <div className="aspect-[9/16] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          <img
            src="/default-cover.jpg"
            alt="Reel"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-2 left-2 text-white flex items-center space-x-1">
          <Play className="h-4 w-4" />
          <span className="text-sm">1.2K</span>
        </div>
      </div>
    ))}
  </div>
)

const SavedTab = () => (
  <div className="text-center py-12">
    <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved items</h3>
    <p className="text-gray-500 dark:text-gray-400">Save posts, reels, and more to see them here.</p>
  </div>
)

const FriendsTab = ({ userId }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3, 4, 5, 6].map((friend) => (
      <div key={friend} className="card p-4 text-center">
        <img
          src="/default-avatar.png"
          alt="Friend"
          className="w-16 h-16 rounded-full mx-auto mb-3"
        />
        <h4 className="font-semibold text-gray-900 dark:text-white">Friend Name</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">12 mutual friends</p>
        <button className="w-full btn-secondary py-2 text-sm">Message</button>
      </div>
    ))}
  </div>
)

export default Profile;
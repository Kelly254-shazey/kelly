import React, { useEffect, useState } from 'react'
import { communityAPI } from '../../services/api'
import { Users, Plus, Calendar, MessageCircle } from 'lucide-react'

const Communities = () => {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCommunities()
  }, [])

  const fetchCommunities = async () => {
    try {
      setLoading(true)
      const res = await communityAPI.getCommunities()
      // Backend returns { communities: paginated }
      const payload = res.data.communities || res.data
      const list = payload.data || payload
      setCommunities(list || [])
    } catch (err) {
      console.error('Failed to load communities', err)
    } finally {
      setLoading(false)
    }
  }

  const join = async (id) => {
    try {
      await communityAPI.joinCommunity(id)
      setCommunities(prev => prev.map(c => c.id === id ? { ...c, is_member: true } : c))
    } catch (err) {
      console.error('Join failed', err)
    }
  }

  const leave = async (id) => {
    try {
      await communityAPI.leaveCommunity(id)
      setCommunities(prev => prev.map(c => c.id === id ? { ...c, is_member: false } : c))
    } catch (err) {
      console.error('Leave failed', err)
    }
  }

  const fallbackImg = (e) => { e.target.src = 'https://via.placeholder.com/600x320?text=Community' }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communities</h1>
          <p className="text-gray-600 dark:text-gray-400">Join communities that share your interests</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Community</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div>Loading...</div>
        ) : (
          communities.map((community) => (
            <div key={community.id} className="card group cursor-pointer">
              <img
                src={community.image || '/default-community.jpg'}
                onError={fallbackImg}
                alt={community.name}
                className="w-full h-32 object-cover rounded-t-lg mb-4"
              />

              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-royal-blue transition-colors">
                {community.name}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {community.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{community.members_count ?? community.members ?? 0} members</span>
                </div>
              </div>

              {community.is_member ? (
                <div className="flex space-x-2">
                  <button className="flex-1 btn-secondary py-2 text-sm">
                    <MessageCircle className="h-4 w-4 mr-1 inline" />
                    Chat
                  </button>
                  <button className="flex-1 btn-primary py-2 text-sm" onClick={() => leave(community.id)}>
                    <Calendar className="h-4 w-4 mr-1 inline" />
                    Leave
                  </button>
                </div>
              ) : (
                <button className="w-full btn-primary py-2 text-sm" onClick={() => join(community.id)}>
                  Join Community
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Communities;
import React from 'react'
import { Users, Plus, Calendar, MessageCircle } from 'lucide-react'

const Communities = () => {
  const communities = [
    {
      id: 1,
      name: 'Nairobi Tech Enthusiasts',
      members: 1247,
      image: '/default-community.jpg',
      description: 'For tech lovers in Nairobi to share ideas and opportunities',
      isMember: true
    },
    {
      id: 2,
      name: 'Kenya Entrepreneurs',
      members: 856,
      image: '/default-community.jpg',
      description: 'Network with fellow entrepreneurs across Kenya',
      isMember: false
    },
    // Add more communities...
  ]

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
        {communities.map((community) => (
          <div key={community.id} className="card group cursor-pointer">
            <img
              src={community.image}
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
                <span>{community.members} members</span>
              </div>
            </div>

            {community.isMember ? (
              <div className="flex space-x-2">
                <button className="flex-1 btn-secondary py-2 text-sm">
                  <MessageCircle className="h-4 w-4 mr-1 inline" />
                  Chat
                </button>
                <button className="flex-1 btn-primary py-2 text-sm">
                  <Calendar className="h-4 w-4 mr-1 inline" />
                  Events
                </button>
              </div>
            ) : (
              <button className="w-full btn-primary py-2 text-sm">
                Join Community
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Communities;
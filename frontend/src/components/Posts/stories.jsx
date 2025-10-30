import React from 'react'
import { Plus } from 'lucide-react'

const Stories = () => {
  const stories = [
    { id: 1, user: { name: 'You', avatar: '/default-avatar.png' }, isCreate: true },
    { id: 2, user: { name: 'Sarah', avatar: '/default-avatar.png' }, hasNew: true },
    { id: 3, user: { name: 'Mike', avatar: '/default-avatar.png' }, hasNew: true },
    { id: 4, user: { name: 'Emma', avatar: '/default-avatar.png' }, hasNew: false },
    { id: 5, user: { name: 'John', avatar: '/default-avatar.png' }, hasNew: false },
    { id: 6, user: { name: 'Lisa', avatar: '/default-avatar.png' }, hasNew: true },
  ]

  return (
    <div className="card p-4">
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {stories.map((story) => (
          <div
            key={story.id}
            className="flex-shrink-0 w-24 text-center cursor-pointer transform hover:scale-105 transition-transform duration-200"
          >
            <div
              className={`w-16 h-16 mx-auto rounded-full p-0.5 mb-2 ${
                story.hasNew
                  ? 'bg-gradient-romantic'
                  : story.isCreate
                  ? 'border-2 border-dashed border-gray-300 dark:border-gray-600'
                  : 'border-2 border-gray-300 dark:border-gray-600'
              }`}
            >
              <div
                className={`w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center ${
                  !story.isCreate && 'border-4 border-white dark:border-gray-800'
                }`}
              >
                {story.isCreate ? (
                  <Plus className="h-6 w-6 text-gray-400" />
                ) : (
                  <img
                    src={story.user.avatar}
                    alt={story.user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                )}
              </div>
            </div>
            <p
              className={`text-xs font-medium ${
                story.isCreate
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {story.isCreate ? 'Create Story' : story.user.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Stories;
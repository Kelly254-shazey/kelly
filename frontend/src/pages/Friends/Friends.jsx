import React from 'react'
import { Users } from 'lucide-react'

const Friends = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-royal-blue flex items-center justify-center text-white">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Friends</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300">This page will show your friends, friend requests, and suggestions. For now this is a stub to match the navigation.</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border rounded">Sample Friend Card</div>
          <div className="p-4 border rounded">Sample Friend Card</div>
        </div>
      </div>
    </div>
  )
}

export default Friends

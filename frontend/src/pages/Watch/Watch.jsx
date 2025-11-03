import React from 'react'
import { Video } from 'lucide-react'

const Watch = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-romantic flex items-center justify-center text-white">
            <Video className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Watch</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300">Video hub — shows recommended clips and live streams. This is a placeholder page for the Watch section.</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded" />
          <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded" />
          <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  )
}

export default Watch

import React, { useState, useRef } from 'react'
import { X, Image, Video, MapPin, Smile, Globe } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { postsAPI } from '../../services/api'
import { VISIBILITY_OPTIONS } from '../../utils/constants'

const CreatePost = ({ onClose, onSubmit }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [media, setMedia] = useState(null)
  const [visibility, setVisibility] = useState('public')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && !media) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('visibility', visibility)
      if (media) {
        formData.append('media', media)
      }

      const response = await postsAPI.create(formData)
      onSubmit(response.data.post)
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMediaSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setMedia(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Post</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={user?.avatar || '/default-avatar.png'}
              alt={user?.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="text-xs border-none bg-transparent text-gray-500 dark:text-gray-400 focus:outline-none"
              >
                {VISIBILITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-32 resize-none border-none focus:outline-none text-lg text-gray-900 dark:text-white bg-transparent placeholder-gray-500"
          />

          {media && (
            <div className="mt-4 relative">
              <img
                src={URL.createObjectURL(media)}
                alt="Post media"
                className="w-full rounded-lg max-h-96 object-cover"
              />
              <button
                type="button"
                onClick={() => setMedia(null)}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mt-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Add to your post</span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
              >
                <Image className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
              >
                <Video className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition-colors"
              >
                <Smile className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              >
                <MapPin className="h-5 w-5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaSelect}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            disabled={(!content.trim() && !media) || loading}
            className="w-full mt-4 bg-royal-blue text-white py-3 rounded-lg font-semibold hover:bg-royal-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreatePost;
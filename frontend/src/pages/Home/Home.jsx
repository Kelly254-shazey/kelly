import React, { useState, useEffect } from 'react'
import { Plus, Image, Video, Smile, MapPin } from 'lucide-react'
import CreatePost from '../../components/Posts/CreatePost'
import Post from '../../components/Posts/Post'
import Stories from '../../components/Posts/Stories'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { postsAPI } from '../../services/api'

const Home = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await postsAPI.getFeed()
      // API returns a paginated object: { posts: { data: [...] , ... } }
      // we only need the array of posts for the feed
      setPosts(response.data.posts?.data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts])
    setShowCreatePost(false)
  }

  const handleLike = async (postId) => {
    try {
      await postsAPI.like(postId)
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + 1, is_liked: true }
          : post
      ))
    } catch (error) {
      console.error('Error liking post:', error)
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Stories Section */}
      <Stories />

      {/* Create Post Card */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <img
            src="/default-avatar.png"
            alt="Your profile"
            className="w-10 h-10 rounded-full border-2 border-lavender"
          />
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex-1 text-left px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            What's on your mind?
          </button>
        </div>

        <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-royal-blue transition-colors px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Video className="h-5 w-5 text-red-500" />
            <span>Live Video</span>
          </button>

          <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Image className="h-5 w-5 text-green-500" />
            <span>Photo/Video</span>
          </button>

          <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-yellow-500 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Smile className="h-5 w-5 text-yellow-500" />
            <span>Feeling/Activity</span>
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={(postId, comment) => {
              // Handle comment
            }}
          />
        ))}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleNewPost}
        />
      )}
    </div>
  )
}

export default Home;
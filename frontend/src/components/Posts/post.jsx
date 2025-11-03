import React, { useState } from 'react'
import { Heart, MessageCircle, Share, MoreHorizontal, ThumbsUp, Globe } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const Post = ({ post, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')

  const handleLike = () => {
    if (!post.is_liked) {
      onLike(post.id)
    }
  }

  const handleComment = (e) => {
    e.preventDefault()
    if (commentText.trim()) {
      onComment(post.id, commentText)
      setCommentText('')
    }
  }

  const handleShare = async () => {
    if (onShare) {
      onShare(post.id)
    } else if (navigator.share) {
      // Fallback to native share if handler not provided
      try {
        await navigator.share({
          title: post.user.name,
          text: post.content || '',
          url: window.location.href + `#/post/${post.id}`
        })
      } catch (err) {
        console.error('Share failed', err)
      }
    } else {
      // Copy link fallback
      try {
        await navigator.clipboard.writeText(window.location.href + `#/post/${post.id}`)
        alert('Link copied to clipboard')
      } catch (err) {
        console.error('Copy failed', err)
      }
    }
  }

  return (
    <div className="card">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.user.avatar || '/default-avatar.png'}
            alt={post.user.name}
            className="w-10 h-10 rounded-full border-2 border-lavender"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{post.user.name}</h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
              <span>•</span>
              <span className="flex items-center">
                <Globe className="h-3 w-3 mr-1" />
                {post.visibility}
              </span>
            </div>
          </div>
        </div>

        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          <MoreHorizontal className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Post Content */}
      {post.content && (
        <p className="text-gray-900 dark:text-white mb-4 whitespace-pre-wrap">{post.content}</p>
      )}

      {/* Post Media */}
      {post.media_url && (
        <div className="mb-4 rounded-lg overflow-hidden">
          {post.media_type === 'image' ? (
            <img
              src={post.media_url}
              alt="Post media"
              className="w-full max-h-96 object-cover"
            />
          ) : (
            <video
              src={post.media_url}
              controls
              className="w-full max-h-96"
            />
          )}
        </div>
      )}

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <ThumbsUp className="h-4 w-4 text-white bg-royal-blue rounded-full p-0.5" />
            <span>{post.likes_count}</span>
          </div>
          <span>{post.comments_count} comments</span>
          <span>{post.shares_count} shares</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex border-t border-b border-gray-200 dark:border-gray-700 py-2">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-colors ${
            post.is_liked 
              ? 'text-royal-blue bg-blue-50 dark:bg-blue-900/20' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <ThumbsUp className="h-5 w-5" />
          <span>Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Comment</span>
        </button>

        <button onClick={handleShare} className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Share className="h-5 w-5" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 space-y-4">
          {/* Comment Input */}
          <form onSubmit={handleComment} className="flex space-x-3">
            <img
              src="/default-avatar.png"
              alt="Your avatar"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal-blue"
              />
              <button
                type="submit"
                className="px-4 bg-royal-blue text-white rounded-full text-sm font-medium hover:bg-royal-blue/90 transition-colors"
              >
                Post
              </button>
            </div>
          </form>

          {/* Comments List */}
          {post.comments?.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <img
                src={comment.user.avatar || '/default-avatar.png'}
                alt={comment.user.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {comment.user.name}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
                <div className="flex items-center space-x-4 mt-1 px-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatDistanceToNow(new Date(comment.created_at))} ago</span>
                  <button className="hover:text-royal-blue">Like</button>
                  <button className="hover:text-royal-blue">Reply</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Post;
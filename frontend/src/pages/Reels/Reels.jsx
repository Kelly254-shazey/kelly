import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share, MoreHorizontal, Music, Bookmark, Plus } from 'lucide-react'

const Reels = () => {
  const [reels, setReels] = useState([])
  const [currentReelIndex, setCurrentReelIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)

  useEffect(() => {
    // Mock reels data
    const mockReels = [
      {
        id: 1,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        user: { name: '_nasiek.u', avatar: 'https://i.pravatar.cc/150?img=1' },
        likes: 168200,
        comments: 641,
        shares: 3337,
        bookmarks: 3550,
        caption: 'Fununu zinasemaje👀😅 dc: @colloblue_udc #fypシ゚ #nasieku #justcallmeklaus #theclusterke',
        music: 'Rumours - Dufla & Iyanii',
        duration: 40
      },
      {
        id: 2,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        user: { name: 'mike.cooks', avatar: 'https://i.pravatar.cc/150?img=2' },
        likes: 89200,
        comments: 234,
        shares: 512,
        bookmarks: 1240,
        caption: 'Quick and easy pasta recipe! 🍝 #cooking #recipe #foodtok',
        music: 'Cooking Vibes - Mike Cooks',
        duration: 30
      },
    ]
    setReels(mockReels)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e) => {
      touchEndY.current = e.changedTouches[0].clientY
      handleSwipe()
    }

    const handleWheel = (e) => {
      e.preventDefault()
      if (e.deltaY > 0) {
        nextReel()
      } else {
        prevReel()
      }
    }

    const handleSwipe = () => {
      const diff = touchStartY.current - touchEndY.current
      const minSwipeDistance = 50

      if (Math.abs(diff) > minSwipeDistance) {
        if (diff > 0) {
          nextReel()
        } else {
          prevReel()
        }
      }
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('wheel', handleWheel)
    }
  }, [currentReelIndex, reels.length])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        nextReel()
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        prevReel()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [reels.length])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleReelClick = (index) => {
    setCurrentReelIndex(index)
    setIsPlaying(true)
  }

  const nextReel = () => {
    setCurrentReelIndex((prev) => (prev + 1) % reels.length)
    setIsPlaying(true)
    setLiked(false)
    setBookmarked(false)
  }

  const prevReel = () => {
    setCurrentReelIndex((prev) => (prev - 1 + reels.length) % reels.length)
    setIsPlaying(true)
    setLiked(false)
    setBookmarked(false)
  }

  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M'
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K'
    }
    return count.toString()
  }

  const currentReel = reels[currentReelIndex]

  if (reels.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No reels available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div ref={containerRef} className="relative w-full h-full max-w-[calc(100vh*9/16)] bg-black overflow-hidden">
        {/* Reel Video */}
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            src={currentReel?.video_url}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="w-full h-full object-cover"
            onClick={togglePlay}
          />
          
          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
              <button
                onClick={togglePlay}
                className="p-4 bg-white bg-opacity-20 rounded-full text-white backdrop-blur-sm"
              >
                <Play className="h-16 w-16" fill="white" />
              </button>
            </div>
          )}

          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/40 to-transparent">
            <h1 className="text-white font-semibold text-lg">Reels</h1>
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white p-2 hover:bg-white/10 rounded-full transition">
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <button className="text-white p-2 hover:bg-white/10 rounded-full transition">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Right Action Bar */}
          {currentReel && (
            <div className="absolute right-3 bottom-20 flex flex-col items-center gap-5">
              {/* User Avatar with Follow */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                  <img
                    src={currentReel.user.avatar}
                    alt={currentReel.user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-black hover:bg-red-600 transition">
                  <Plus className="h-4 w-4 text-white" strokeWidth={3} />
                </button>
              </div>

              {/* Like Button */}
              <button 
                onClick={() => setLiked(!liked)}
                className="flex flex-col items-center gap-1 text-white group"
              >
                <div className="relative">
                  <Heart 
                    className={`h-8 w-8 transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : 'group-hover:scale-110'}`}
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-xs font-semibold">
                  {formatCount(currentReel.likes + (liked ? 1 : 0))}
                </span>
              </button>
              
              {/* Comment Button */}
              <button className="flex flex-col items-center gap-1 text-white group">
                <MessageCircle className="h-8 w-8 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                <span className="text-xs font-semibold">{formatCount(currentReel.comments)}</span>
              </button>

              {/* Bookmark Button */}
              <button 
                onClick={() => setBookmarked(!bookmarked)}
                className="flex flex-col items-center gap-1 text-white group"
              >
                <Bookmark 
                  className={`h-7 w-7 transition-all ${bookmarked ? 'fill-yellow-400 text-yellow-400 scale-110' : 'group-hover:scale-110'}`}
                  strokeWidth={1.5}
                />
                <span className="text-xs font-semibold">
                  {formatCount(currentReel.bookmarks + (bookmarked ? 1 : 0))}
                </span>
              </button>
              
              {/* Share Button */}
              <button className="flex flex-col items-center gap-1 text-white group">
                <Share className="h-7 w-7 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                <span className="text-xs font-semibold">{formatCount(currentReel.shares)}</span>
              </button>

              {/* Music Disc */}
              <button className="mt-2 w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-gray-800 animate-spin-slow">
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="h-4 w-4 text-white" />
                </div>
              </button>
            </div>
          )}

          {/* Bottom Info */}
          {currentReel && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 via-black/40 to-transparent">
              <div className="max-w-[calc(100%-80px)]">
                {/* Username and Follow */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white font-semibold text-base">@{currentReel.user.name}</span>
                  <button className="px-4 py-1 bg-transparent border border-white text-white text-sm font-semibold rounded hover:bg-white hover:text-black transition">
                    Follow
                  </button>
                </div>
                
                {/* Caption */}
                <p className="text-white text-sm mb-3 line-clamp-2">
                  {currentReel.caption}
                </p>
                
                {/* Music */}
                <div className="flex items-center gap-2 text-white text-sm">
                  <Music className="h-4 w-4" />
                  <span className="truncate">{currentReel.music}</span>
                </div>
              </div>
            </div>
          )}

          {/* Progress Indicators */}
          <div className="absolute top-20 right-2 flex flex-col gap-1">
            {reels.map((_, index) => (
              <button
                key={index}
                onClick={() => handleReelClick(index)}
                className={`rounded-full transition-all ${
                  index === currentReelIndex
                    ? 'bg-white w-1.5 h-8'
                    : 'bg-white/50 w-1.5 h-1.5 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reels;
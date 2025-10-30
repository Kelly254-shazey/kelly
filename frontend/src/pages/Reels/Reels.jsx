import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share, MoreHorizontal, Music } from 'lucide-react'

const Reels = () => {
  const [reels, setReels] = useState([])
  const [currentReelIndex, setCurrentReelIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    // Mock reels data
    const mockReels = [
      {
        id: 1,
        video_url: '/sample-reel-1.mp4',
        user: { name: 'Sarah Beauty', avatar: '/default-avatar.png' },
        likes: 1247,
        comments: 89,
        shares: 45,
        caption: 'Morning routine vibes ☀️ #skincare #morningroutine',
        music: 'Original Sound - Sarah Beauty',
        duration: 15
      },
      {
        id: 2,
        video_url: '/sample-reel-2.mp4',
        user: { name: 'Mike Cooks', avatar: '/default-avatar.png' },
        likes: 892,
        comments: 34,
        shares: 12,
        caption: 'Quick and easy pasta recipe! 🍝 #cooking #recipe',
        music: 'Cooking Vibes - Mike Cooks',
        duration: 30
      },
      // Add more reels...
    ]
    setReels(mockReels)
  }, [])

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
    <div className="max-w-md mx-auto h-screen bg-black relative overflow-hidden">
      {/* Reel Video */}
      <div className="relative h-full flex items-center justify-center">
        <video
          ref={videoRef}
          src={currentReel?.video_url}
          autoPlay
          muted={isMuted}
          loop
          className="w-full h-full object-cover"
          onClick={togglePlay}
        />
        
        {/* Video Controls Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="p-4 bg-black bg-opacity-50 rounded-full text-white opacity-0 hover:opacity-100 transition-opacity"
          >
            {isPlaying ? (
              <Pause className="h-12 w-12" />
            ) : (
              <Play className="h-12 w-12" />
            )}
          </button>
        </div>

        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <h1 className="text-white font-bold text-xl">Reels</h1>
          <button className="text-white p-2">
            <MoreHorizontal className="h-6 w-6" />
          </button>
        </div>

        {/* Reel Info Sidebar */}
        {currentReel && (
          <div className="absolute right-4 bottom-20 flex flex-col items-end space-y-4">
            {/* User Avatar */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden mb-1">
                <img
                  src={currentReel.user.avatar}
                  alt={currentReel.user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center space-y-4">
              <button className="flex flex-col items-center text-white">
                <Heart className="h-8 w-8" />
                <span className="text-xs">{currentReel.likes}</span>
              </button>
              
              <button className="flex flex-col items-center text-white">
                <MessageCircle className="h-8 w-8" />
                <span className="text-xs">{currentReel.comments}</span>
              </button>
              
              <button className="flex flex-col items-center text-white">
                <Share className="h-8 w-8" />
                <span className="text-xs">{currentReel.shares}</span>
              </button>

              <button onClick={toggleMute} className="text-white">
                {isMuted ? (
                  <VolumeX className="h-8 w-8" />
                ) : (
                  <Volume2 className="h-8 w-8" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Reel Caption */}
        {currentReel && (
          <div className="absolute bottom-4 left-4 right-20 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold">{currentReel.user.name}</span>
              <button className="text-sm bg-royal-blue px-2 py-1 rounded">Follow</button>
            </div>
            
            <p className="text-sm mb-2">{currentReel.caption}</p>
            
            <div className="flex items-center space-x-2 text-sm">
              <Music className="h-3 w-3" />
              <span>{currentReel.music}</span>
            </div>
          </div>
        )}
      </div>

      {/* Reel Navigation Dots */}
      <div className="absolute top-20 right-4 flex flex-col space-y-2">
        {reels.map((_, index) => (
          <button
            key={index}
            onClick={() => handleReelClick(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentReelIndex
                ? 'bg-white h-8'
                : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default Reels;
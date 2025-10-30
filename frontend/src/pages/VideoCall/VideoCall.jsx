import React, { useState, useRef } from 'react'
import { Phone, Video, Mic, MicOff, VideoOff, Users, PhoneOff } from 'lucide-react'

const VideoCall = () => {
  const [isInCall, setIsInCall] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      
      setIsInCall(true)
    } catch (error) {
      console.error('Error accessing media devices:', error)
      alert('Unable to access camera and microphone. Please check permissions.')
    }
  }

  const endCall = () => {
    const stream = localVideoRef.current?.srcObject
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    setIsInCall(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Calls</h1>
        <p className="text-gray-600 dark:text-gray-400">Connect with friends and family through video calls</p>
      </div>

      {!isInCall ? (
        <div className="card text-center p-8">
          <div className="w-24 h-24 bg-gradient-romantic rounded-full flex items-center justify-center mx-auto mb-6">
            <Video className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Start a Video Call
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Invite friends to join your video call or start a quick call with your contacts
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>New Call</span>
            </button>
            
            <button 
              onClick={startCall}
              className="btn-secondary flex items-center space-x-2"
            >
              <Phone className="h-4 w-4" />
              <span>Quick Test Call</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            className="w-full h-full object-cover"
          />
          
          {/* Local Video Preview */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
          </div>

          {/* Call Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full ${
                isMuted 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } transition-colors`}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>
            
            <button
              onClick={endCall}
              className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
            
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-4 rounded-full ${
                isVideoOff 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } transition-colors`}
            >
              {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </button>
          </div>

          {/* Call Info */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-full">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>00:45</span>
              <Users className="h-4 w-4" />
              <span>2 participants</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Calls */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Calls</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((call) => (
            <div key={call} className="card p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="/default-avatar.png"
                  alt="Contact"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Sarah Johnson</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Phone className="h-3 w-3" />
                    <span>Yesterday, 3:45 PM</span>
                    <span>•</span>
                    <span>15 minutes</span>
                  </div>
                </div>
              </div>
              <button className="btn-primary py-2 px-4 text-sm">
                Call Again
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VideoCall;
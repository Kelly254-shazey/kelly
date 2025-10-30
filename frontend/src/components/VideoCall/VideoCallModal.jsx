import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Video, VideoOff, Phone, Users, DollarSign } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

const VideoCallModal = ({ call, onClose, isIncoming = false }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState([]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const socket = useSocket();
  const { user } = useAuth();

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  };

  useEffect(() => {
    if (call) {
      initializeCall();
    }
    return () => {
      cleanupCall();
    };
  }, [call]);

  useEffect(() => {
    let interval;
    if (callStatus === 'ongoing') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const initializeCall = async () => {
    try {
      // Initialize WebRTC
      await setupMediaDevices();
      await createPeerConnection();
      
      if (!isIncoming) {
        // Create and send offer
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit('send_signal', {
          call_id: call.call_id,
          signal: offer,
          type: 'offer'
        });
      }

      setupSocketListeners();
    } catch (error) {
      console.error('Error initializing call:', error);
      setCallStatus('failed');
    }
  };

  const setupMediaDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const createPeerConnection = async () => {
    peerConnection.current = new RTCPeerConnection(configuration);

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream);
      });
    }

    // Handle incoming stream
    peerConnection.current.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // Handle ICE candidates
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('send_signal', {
          call_id: call.call_id,
          signal: event.candidate,
          type: 'candidate'
        });
      }
    };
  };

  const setupSocketListeners = () => {
    socket.on('signal.offer', handleOffer);
    socket.on('signal.answer', handleAnswer);
    socket.on('signal.candidate', handleCandidate);
    socket.on('call.accepted', handleCallAccepted);
    socket.on('call.ended', handleCallEnded);
    socket.on('call.rejected', handleCallRejected);
    socket.on('audio_toggled', handleAudioToggled);
    socket.on('video_toggled', handleVideoToggled);
  };

  const handleOffer = async (data) => {
    await peerConnection.current.setRemoteDescription(data.signal);
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    
    socket.emit('send_signal', {
      call_id: call.call_id,
      signal: answer,
      type: 'answer'
    });
  };

  const handleAnswer = async (data) => {
    await peerConnection.current.setRemoteDescription(data.signal);
    setCallStatus('ongoing');
  };

  const handleCandidate = async (data) => {
    await peerConnection.current.addIceCandidate(data.signal);
  };

  const handleCallAccepted = () => {
    setCallStatus('ongoing');
  };

  const handleCallEnded = () => {
    setCallStatus('ended');
    setTimeout(() => onClose(), 2000);
  };

  const handleCallRejected = () => {
    setCallStatus('rejected');
    setTimeout(() => onClose(), 2000);
  };

  const handleAudioToggled = (data) => {
    // Update participant audio state
    setParticipants(prev => prev.map(p => 
      p.user_id === data.user_id ? { ...p, is_muted: data.is_muted } : p
    ));
  };

  const handleVideoToggled = (data) => {
    // Update participant video state
    setParticipants(prev => prev.map(p => 
      p.user_id === data.user_id ? { ...p, is_video_off: data.is_video_off } : p
    ));
  };

  const acceptCall = () => {
    socket.emit('accept_call', { call_id: call.call_id });
    setCallStatus('ongoing');
  };

  const rejectCall = () => {
    socket.emit('reject_call', { call_id: call.call_id });
    onClose();
  };

  const endCall = () => {
    socket.emit('end_call', { call_id: call.call_id });
    cleanupCall();
    onClose();
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
      socket.emit('toggle_audio', { call_id: call.call_id });
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
      socket.emit('toggle_video', { call_id: call.call_id });
    }
  };

  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    // Remove socket listeners
    if (socket) {
      socket.off('signal.offer');
      socket.off('signal.answer');
      socket.off('signal.candidate');
      socket.off('call.accepted');
      socket.off('call.ended');
      socket.off('call.rejected');
      socket.off('audio_toggled');
      socket.off('video_toggled');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Call Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              callStatus === 'ongoing' ? 'bg-green-500' : 
              callStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {call.call_type === 'conference' ? 'Conference Call' : 
                 `${call.call_type.charAt(0).toUpperCase() + call.call_type.slice(1)} Call`}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {callStatus === 'ongoing' ? formatDuration(callDuration) : 
                 callStatus === 'connecting' ? 'Connecting...' : callStatus}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden m-4">
          {/* Remote Video */}
          {remoteStream && (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          {/* Local Video Preview */}
          {localStream && (
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Call Info Overlay */}
          {!remoteStream && callStatus !== 'ongoing' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-semibold mb-2">
                  {call.receiver?.name || 'Calling...'}
                </h4>
                <p className="text-gray-300">
                  {isIncoming ? 'Incoming call' : 'Waiting for answer...'}
                </p>
              </div>
            </div>
          )}

          {/* Cost Display for Premium Calls */}
          {call.call_type === 'premium' && callStatus === 'ongoing' && (
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">${(callDuration * 0.10 / 60).toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-4">
            {isIncoming && callStatus === 'connecting' ? (
              <>
                <button
                  onClick={acceptCall}
                  className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                >
                  <Phone className="h-6 w-6" />
                </button>
                <button
                  onClick={rejectCall}
                  className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleAudio}
                  className={`p-4 rounded-full ${
                    isMuted 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  } hover:opacity-90 transition-colors`}
                >
                  {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </button>
                
                <button
                  onClick={endCall}
                  className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Phone className="h-6 w-6" />
                </button>
                
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full ${
                    isVideoOff 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  } hover:opacity-90 transition-colors`}
                >
                  {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
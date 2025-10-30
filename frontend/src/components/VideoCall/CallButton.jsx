import React, { useState } from 'react';
import { Phone, Video, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import VideoCallModal from './VideoCallModal';

const CallButton = ({ user, type = 'video', isConference = false, participants = [] }) => {
  const [showCallModal, setShowCallModal] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const { user: currentUser } = useAuth();

  const initiateCall = async (callType = 'video') => {
    try {
      const endpoint = isConference ? '/api/calls/conference' : '/api/calls/initiate';
      const payload = isConference 
        ? { participant_ids: participants, call_type: callType }
        : { receiver_id: user.id, call_type: callType };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kellyflo-token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentCall(data.call);
        setShowCallModal(true);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to initiate call');
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      alert('Failed to initiate call');
    }
  };

  const callOptions = [
    { type: 'video', label: 'Video Call', icon: Video, color: 'bg-blue-500' },
    { type: 'audio', label: 'Voice Call', icon: Phone, color: 'bg-green-500' },
    { type: 'premium', label: 'Premium HD', icon: DollarSign, color: 'bg-purple-500', cost: 'HD Quality' }
  ];

  return (
    <>
      <div className="relative group">
        <button
          onClick={() => initiateCall(type)}
          className="flex items-center space-x-2 bg-royal-blue text-white px-4 py-2 rounded-full hover:bg-royal-blue/90 transition-colors"
        >
          {isConference ? (
            <Users className="h-4 w-4" />
          ) : type === 'audio' ? (
            <Phone className="h-4 w-4" />
          ) : (
            <Video className="h-4 w-4" />
          )}
          <span>{isConference ? 'Start Conference' : 'Call'}</span>
        </button>

        {/* Call Options Dropdown */}
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 min-w-48 z-10">
          {callOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => initiateCall(option.type)}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className={`p-2 rounded-full ${option.color} text-white`}>
                <option.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {option.label}
                </p>
                {option.cost && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {option.cost}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {showCallModal && currentCall && (
        <VideoCallModal
          call={currentCall}
          onClose={() => {
            setShowCallModal(false);
            setCurrentCall(null);
          }}
        />
      )}
    </>
  );
};

export default CallButton;
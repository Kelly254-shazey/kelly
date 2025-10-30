import React from 'react';
import { Phone, Video, X } from 'lucide-react';
import VideoCallModal from './VideoCallModal';

const IncomingCallNotification = ({ call, onAccept, onReject }) => {
  if (!call) return null;

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm z-50 animate-in slide-in-from-right">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-romantic rounded-full flex items-center justify-center">
          {call.call_type === 'audio' ? (
            <Phone className="h-6 w-6 text-white" />
          ) : (
            <Video className="h-6 w-6 text-white" />
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {call.initiator.name}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Incoming {call.call_type} call
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onAccept}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            <Phone className="h-4 w-4" />
          </button>
          <button
            onClick={onReject}
            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallNotification;
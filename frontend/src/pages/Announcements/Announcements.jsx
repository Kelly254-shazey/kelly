import React from 'react'
import { Megaphone, Calendar, MapPin, Users } from 'lucide-react'

const Announcements = () => {
  const announcements = [
    {
      id: 1,
      title: 'Platform Maintenance Notice',
      content: 'KellyFlo Connect will undergo scheduled maintenance on Saturday, 10th February 2024 from 2:00 AM to 6:00 AM EAT. Some features may be temporarily unavailable during this period.',
      author: 'Admin Team',
      date: '2024-02-08',
      priority: 'high',
      category: 'system'
    },
    {
      id: 2,
      title: 'New Feature: Live Streaming',
      content: 'We\'re excited to announce that Live Streaming is now available to all users! Go live and share your moments in real-time with your friends and followers.',
      author: 'Product Team',
      date: '2024-02-05',
      priority: 'medium',
      category: 'feature'
    },
    // Add more announcements...
  ]

  const events = [
    {
      id: 1,
      title: 'Valentine\'s Day Virtual Party',
      date: '2024-02-14',
      time: '8:00 PM EAT',
      location: 'Virtual Event',
      attendees: 247,
      image: '/default-event.jpg'
    },
    // Add more events...
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements & Events</h1>
          <p className="text-gray-600 dark:text-gray-400">Stay updated with platform news and upcoming events</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Megaphone className="h-5 w-5 text-royal-blue" />
            <span>Latest Announcements</span>
          </h2>

          {announcements.map((announcement) => (
            <div key={announcement.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {announcement.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  announcement.priority === 'high' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {announcement.priority}
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {announcement.content}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>By {announcement.author}</span>
                <span>{announcement.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Events */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-pink-rose" />
            <span>Upcoming Events</span>
          </h2>

          {events.map((event) => (
            <div key={event.id} className="card group cursor-pointer">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-royal-blue transition-colors">
                {event.title}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{event.date} at {event.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{event.attendees} attending</span>
                </div>
              </div>

              <button className="w-full mt-3 btn-primary py-2 text-sm">
                Interested
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Announcements;
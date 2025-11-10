import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { X, Home, Users, Video, MessageCircle, ShoppingCart, Grid, Zap } from 'lucide-react'

export default function MobileSideMenu({ open, onClose, user }) {
  const panelRef = useRef(null)
  const { logout } = useAuth()

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleKey)
      // focus the panel for a11y
      setTimeout(() => panelRef.current?.focus(), 50)
    }
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return (
    <aside
      aria-hidden={!open}
      className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="h-full flex flex-col" tabIndex={-1} ref={panelRef}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-romantic text-white flex items-center justify-center font-bold">
              {user?.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'U'}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || 'You'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">@{user?.username || 'username'}</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <nav className="p-3 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <Link to="/" onClick={onClose} className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <Home className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="text-sm text-gray-900 dark:text-white">Home</span>
              </Link>
            </li>
            <li>
              <Link to="/friends" onClick={onClose} className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <Users className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="text-sm text-gray-900 dark:text-white">Friends</span>
              </Link>
            </li>
            <li>
              <Link to="/watch" onClick={onClose} className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <Video className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="text-sm text-gray-900 dark:text-white">Watch</span>
              </Link>
            </li>
            <li>
              <Link to="/messages" onClick={onClose} className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <MessageCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="text-sm text-gray-900 dark:text-white">Messages</span>
              </Link>
            </li>
            <li>
              <Link to="/marketplace" onClick={onClose} className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <ShoppingCart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="text-sm text-gray-900 dark:text-white">Marketplace</span>
              </Link>
            </li>
            <li>
              <Link to="/communities" onClick={onClose} className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <Grid className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="text-sm text-gray-900 dark:text-white">Communities</span>
              </Link>
            </li>
            <li>
              <Link to="/live" onClick={onClose} className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <Zap className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="text-sm text-gray-900 dark:text-white">Live</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-3 border-t border-gray-100 dark:border-gray-700">
          <Link to={`/profile/${user?.id}`} onClick={onClose} className="w-full block text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            View profile
          </Link>
          <button onClick={() => { logout(); onClose(); }} className="w-full text-left px-3 py-2 mt-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600">
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}

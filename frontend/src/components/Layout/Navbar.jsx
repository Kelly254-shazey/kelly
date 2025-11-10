import React, { useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Bell, MessageCircle, Video, Menu, X, Sun, Moon, Home, Users, ShoppingCart, Grid, PlusSquare } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import MobileSideMenu from './MobileSideMenu'

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const notifications = [
    { id: 1, text: 'Sarah liked your post', time: '5 min ago', read: false },
    { id: 2, text: 'Mike sent you a message', time: '10 min ago', read: false },
    { id: 3, text: 'Your post got 15 likes', time: '1 hour ago', read: true },
  ]
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Search */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              className="sm:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-romantic rounded-full flex items-center justify-center text-white font-bold">KF</div>
              <span className="hidden sm:block font-semibold text-lg text-gray-900 dark:text-white">KellyFlo</span>
            </Link>

            <div className="hidden sm:block w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  id="navbar-search"
                  type="text"
                  placeholder="Search KellyFlo Connect"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Center: Primary nav (Facebook-style icons) */}
          <div className="flex-1 flex justify-center">
            <div className="hidden sm:flex space-x-6">
              <div className="flex items-center space-x-6">
                  {/* Center nav: show on all sizes (mobile parity) */}
                  <div className="flex items-center space-x-4 sm:space-x-6 overflow-x-auto">
                    {/* Home (exact match) */}
                    {(() => {
                      const isActive = location.pathname === '/'
                      return (
                        <Link
                          to="/"
                          aria-current={isActive ? 'page' : undefined}
                          className={`p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                        >
                          <Home className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-700 dark:text-gray-200'}`} />
                        </Link>
                      )
                    })()}

                    {/* Friends (group match) */}
                    {(() => {
                      const isActive = location.pathname.startsWith('/friends')
                      return (
                        <Link
                          to="/friends"
                          aria-current={isActive ? 'page' : undefined}
                          className={`p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                        >
                          <Users className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-700 dark:text-gray-200'}`} />
                        </Link>
                      )
                    })()}

                    {/* Watch (group match) */}
                    {(() => {
                      const isActive = location.pathname.startsWith('/watch')
                      return (
                        <Link
                          to="/watch"
                          aria-current={isActive ? 'page' : undefined}
                          className={`p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                        >
                          <Video className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-700 dark:text-gray-200'}`} />
                        </Link>
                      )
                    })()}

                    {/* Messages (group match) */}
                    {(() => {
                      const isActive = location.pathname.startsWith('/messages')
                      return (
                        <Link
                          to="/messages"
                          aria-current={isActive ? 'page' : undefined}
                          className={`p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                        >
                          <MessageCircle className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-700 dark:text-gray-200'}`} />
                        </Link>
                      )
                    })()}

                    {/* Reels/Marketplace (group match) */}
                    {(() => {
                      const isActive = location.pathname.startsWith('/reels') || location.pathname.startsWith('/marketplace')
                      return (
                        <Link
                          to="/reels"
                          aria-current={isActive ? 'page' : undefined}
                          className={`p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                        >
                          <ShoppingCart className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-700 dark:text-gray-200'}`} />
                        </Link>
                      )
                    })()}
                  </div>
              </div>
            </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <PlusSquare className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>

            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <MessageCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="absolute -top-1 -right-1 bg-royal-blue text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  5
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}>
                        <p className="text-sm text-gray-900 dark:text-white">{notification.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center">
                    <button className="text-royal-blue text-sm font-medium hover:underline">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <img
                  src={user?.avatar || '/default-avatar.png'}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover border-2 border-royal-blue"
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-2">
                    <Link to={`/profile/${user?.id}`} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Profile</Link>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Settings</button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Wallet</button>
                    {user?.role === 'admin' || user?.role === 'super_admin' ? (
                      <Link to="/admin" className="w-full block text-left px-3 py-2 text-sm text-royal-blue hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Admin Dashboard</Link>
                    ) : null}
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile side menu component */}
      <MobileSideMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} user={user} />
    </nav>
  )
}

export default Navbar;
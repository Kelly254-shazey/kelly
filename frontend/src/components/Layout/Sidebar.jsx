import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  User, 
  MessageCircle, 
  ShoppingBag, 
  Video, 
  Users, 
  Phone, 
  Megaphone, 
  PlaySquare,
  Settings,
  Shield
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()

  const menuItems = [
    { icon: Home, label: 'Home', path: '/', notification: 0 },
    { icon: User, label: 'Profile', path: '/profile', notification: 0 },
    { icon: MessageCircle, label: 'Messages', path: '/messages', notification: 3 },
    { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace', notification: 0 },
    { icon: Video, label: 'Live Stream', path: '/live', notification: 0 },
    { icon: Users, label: 'Communities', path: '/communities', notification: 2 },
    { icon: Phone, label: 'Video Call', path: '/video-call', notification: 0 },
    { icon: Megaphone, label: 'Announcements', path: '/announcements', notification: 1 },
    { icon: PlaySquare, label: 'Reels', path: '/reels', notification: 0 },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 hidden lg:block">
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-romantic rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="text-xl font-bold bg-gradient-romantic bg-clip-text text-transparent">
            KellyFlo Connect
          </span>
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Where Hearts Meet, Minds Grow.
        </p>
      </div>

      <nav className="mt-6 px-4 overflow-y-auto h-[calc(100vh-150px)]">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-gradient-romantic text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.notification > 0 && (
                    <span className="ml-auto bg-pink-rose text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.notification}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}

          {/* Admin Link */}
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <li>
              <Link
                to="/admin"
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === '/admin'
                    ? 'bg-royal-blue text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Shield className="h-5 w-5" />
                <span className="font-medium">Admin</span>
              </Link>
            </li>
          )}
        </ul>

        {/* Quick Actions */}
        <div className="mt-8 p-4 bg-gradient-romantic rounded-xl text-white">
          <h3 className="font-semibold text-sm mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left text-xs p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              Create Post
            </button>
            <button className="w-full text-left text-xs p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              Go Live
            </button>
            <button className="w-full text-left text-xs p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              Sell Item
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Sidebar;
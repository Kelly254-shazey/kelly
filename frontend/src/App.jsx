import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Context Providers
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { SocketProvider } from './contexts/SocketContext'
import { EchoProvider } from './contexts/EchoContext'
import { CallProvider } from './contexts/CallContext'

// Layout Components
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/Layout/ProtectedRoute'

// Auth Pages
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'

// Main Pages
import Home from './pages/Home/Home'
import Profile from './pages/Profile/Profile'
import Messages from './pages/Messages/Messages'
import Marketplace from './pages/Marketplace/Marketplace'
import LiveStream from './pages/LiveStream/LiveStream'
import Communities from './pages/Communities/Communities'
import VideoCall from './pages/VideoCall/VideoCall'
import Announcements from './pages/Announcements/Announcements'
import Reels from './pages/Reels/Reels'
import AdminDashboard from './pages/Admin/Dashboard'
import AdminRoles from './pages/Admin/Roles'
import Friends from './pages/Friends/Friends'
import Watch from './pages/Watch/Watch'

// Video Call Components
import IncomingCallNotification from './components/VideoCall/IncomingCallNotification'
import VideoCallModal from './components/VideoCall/VideoCallModal'

// Hooks
import { useAuth } from './contexts/AuthContext'
import { useCall } from './contexts/CallContext'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EchoProvider>
          <SocketProvider>
            <CallProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppContent />
            </Router>
            </CallProvider>
          </SocketProvider>
        </EchoProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

// Separate component to use hooks
function AppContent() {
  const { isAuthenticated, loading } = useAuth()
  const { incomingCall, activeCall, acceptCall, rejectCall } = useCall()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-romantic">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading KellyFlo Connect...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-charcoal transition-colors duration-300">
      {/* Global Call Notifications */}
      <CallNotifications 
        incomingCall={incomingCall}
        activeCall={activeCall}
        onAccept={acceptCall}
        onReject={rejectCall}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile/:userId?" 
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <Layout>
                <Messages />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/marketplace" 
          element={
            <ProtectedRoute>
              <Layout>
                <Marketplace />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/live" 
          element={
            <ProtectedRoute>
              <Layout>
                <LiveStream />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/live/:streamId" 
          element={
            <ProtectedRoute>
              <Layout>
                <LiveStream />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/friends"
          element={
            <ProtectedRoute>
              <Layout>
                <Friends />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route 
          path="/watch"
          element={
            <ProtectedRoute>
              <Layout>
                <Watch />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route 
          path="/communities" 
          element={
            <ProtectedRoute>
              <Layout>
                <Communities />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/video-call" 
          element={
            <ProtectedRoute>
              <Layout>
                <VideoCall />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/announcements" 
          element={
            <ProtectedRoute>
              <Layout>
                <Announcements />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/reels" 
          element={
            <ProtectedRoute>
              <Layout>
                <Reels />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/roles" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <Layout>
                <AdminRoles />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* 404 Page */}
        <Route 
          path="*" 
          element={
            <ProtectedRoute>
              <Layout>
                <NotFoundPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  )
}

// Call Notifications Component
function CallNotifications({ incomingCall, activeCall, onAccept, onReject }) {
  return (
    <>
      {/* Incoming Call Notification */}
      {incomingCall && !activeCall && (
        <IncomingCallNotification
          call={incomingCall}
          onAccept={() => onAccept(incomingCall.id)}
          onReject={() => onReject(incomingCall.id)}
        />
      )}

      {/* Active Call Modal */}
      {activeCall && (
        <VideoCallModal
          call={activeCall}
          onClose={() => onReject(activeCall.id)}
        />
      )}
    </>
  )
}

// Public Route Component (redirects to home if already authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    window.location.href = '/'
    return null
  }

  return children
}

// 404 Page Component
function NotFoundPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="w-32 h-32 bg-gradient-romantic rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-white">404</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="btn-secondary px-6 py-3"
          >
            Go Back
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary px-6 py-3"
          >
            Go Home
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <QuickLink href="/" title="Home" description="Back to your feed" />
          <QuickLink href="/messages" title="Messages" description="Check your conversations" />
          <QuickLink href="/marketplace" title="Marketplace" description="Browse products" />
          <QuickLink href="/profile" title="Profile" description="View your profile" />
        </div>
      </div>
    </div>
  )
}

// Quick Link Component for 404 page
function QuickLink({ href, title, description }) {
  return (
    <a
      href={href}
      className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
    >
      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-royal-blue transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {description}
      </p>
    </a>
  )
}

export default App;
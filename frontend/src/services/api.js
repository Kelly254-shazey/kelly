import axios from 'axios'

// Change this line - your Laravel backend runs on port 8000, not 8888
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for Sanctum
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kellyflo-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kellyflo-token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API service functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getUser: () => api.get('/auth/user'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

export const postsAPI = {
  getFeed: (page = 1) => api.get(`/posts/feed?page=${page}`),
  create: (data) => api.post('/posts', data),
  like: (postId) => api.post(`/posts/${postId}/like`),
  unlike: (postId) => api.post(`/posts/${postId}/unlike`),
  comment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  share: (postId) => api.post(`/posts/${postId}/share`),
  delete: (postId) => api.delete(`/posts/${postId}`),
  sponsor: (postId, duration) => api.post(`/posts/${postId}/sponsor`, { duration }),
}

export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId) => api.get(`/messages/${conversationId}`),
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (conversationId) => api.put(`/messages/${conversationId}/read`),
  startTyping: (conversationId) => api.post(`/messages/${conversationId}/typing/start`),
  stopTyping: (conversationId) => api.post(`/messages/${conversationId}/typing/stop`),
  addReaction: (messageId, reaction) => api.post(`/messages/${messageId}/reaction`, { reaction }),
  removeReaction: (messageId) => api.delete(`/messages/${messageId}/reaction`),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  searchMessages: (query, conversationId = null) => api.get('/messages/search', { 
    params: { query, conversation_id: conversationId } 
  }),
  createGroup: (data) => api.post('/messages/group/create', data),
  leaveConversation: (conversationId) => api.post(`/messages/conversation/${conversationId}/leave`),
}

export const marketplaceAPI = {
  getProducts: (params = {}) => api.get('/marketplace/products', { params }),
  createProduct: (data) => api.post('/marketplace/products', data),
  purchase: (productId, data) => api.post(`/marketplace/products/${productId}/purchase`, data),
  confirmPurchase: (orderId) => api.post(`/marketplace/orders/${orderId}/confirm`),
}

export const profileAPI = {
  getProfile: (userId = null) => api.get(userId ? `/profile/${userId}` : '/profile'),
  updateProfile: (data) => api.put('/profile', data),
  follow: (userId) => api.post(`/users/${userId}/follow`),
  unfollow: (userId) => api.post(`/users/${userId}/unfollow`),
  sendFriendRequest: (userId) => api.post(`/users/${userId}/friend-request`),
  acceptFriendRequest: (userId) => api.post(`/friend-requests/${userId}/accept`),
  rejectFriendRequest: (userId) => api.post(`/friend-requests/${userId}/reject`),
  getFriends: () => api.get('/friends'),
}

export const storiesAPI = {
  getStories: () => api.get('/stories'),
  createStory: (data) => api.post('/stories', data),
  viewStory: (storyId) => api.post(`/stories/${storyId}/view`),
  deleteStory: (storyId) => api.delete(`/stories/${storyId}`),
}

export const callsAPI = {
  initiateCall: (data) => api.post('/calls/initiate', data),
  initiateConference: (data) => api.post('/calls/conference', data),
  acceptCall: (callId) => api.post(`/calls/${callId}/accept`),
  rejectCall: (callId) => api.post(`/calls/${callId}/reject`),
  endCall: (callId) => api.post(`/calls/${callId}/end`),
  sendSignal: (callId, signalData) => api.post(`/calls/${callId}/signal`, signalData),
  toggleAudio: (callId) => api.post(`/calls/${callId}/toggle-audio`),
  toggleVideo: (callId) => api.post(`/calls/${callId}/toggle-video`),
  getCallHistory: () => api.get('/calls/history'),
  purchaseCredits: (data) => api.post('/calls/purchase-credits', data),
}

export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  deposit: (data) => api.post('/wallet/deposit', data),
  withdraw: (data) => api.post('/wallet/withdraw', data),
}

export const adsAPI = {
  getAds: (placement) => api.get(`/ads?placement=${placement}`),
  recordClick: (adId) => api.post('/ads/click', { ad_id: adId }),
}

export const streamingAPI = {
  createStream: (data) => api.post('/stream/start', data),
  getStreams: () => api.get('/streams'),
  endStream: (streamId) => api.post(`/stream/${streamId}/end`),
  joinStream: (streamId) => api.post(`/stream/${streamId}/join`),
  sendStreamMessage: (streamId, data) => api.post(`/stream/${streamId}/message`, data),
}

export const aiAPI = {
  getFriendSuggestions: () => api.get('/ai/friend-suggestions'),
  summarizeConversation: (conversationId) => api.post('/ai/summarize-conversation', { conversation_id: conversationId }),
  getCaptionSuggestions: (context) => api.post('/ai/caption-suggestions', { context }),
}

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (page = 1) => api.get(`/admin/users?page=${page}`),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  getAdRevenue: (params = {}) => api.get('/admin/ad-revenue', { params }),
}

export default api;
import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Smile, Paperclip, Send } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { messagesAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import CallButton from '../../components/VideoCall/CallButton'; 
import { useAuth } from '../../contexts/AuthContext'; // Import needed for current user
import { useLocation } from 'react-router-dom';

const Messages = () => {
    // --- State Management ---
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false); 

    // --- Hooks ---
    const socket = useSocket();
    const messagesEndRef = useRef(null);
    const location = useLocation();
    const { selectedUser, initialMessage } = location.state || {};
    const { user } = useAuth(); // CRITICAL: Get current authenticated user details

    // Helper to get the other user in the active conversation
    const otherUser = activeConversation?.users.find(u => u.id !== user?.id);

    // --- Handlers ---

    const fetchMessages = async (conversationId) => {
        // Prevent fetching messages for temporary conversations
        if (String(conversationId).startsWith('temp-')) {
             setMessages([]);
             return;
        }
        try {
            const response = await messagesAPI.getMessages(conversationId);
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
        }
    };
    
    const handleConversationSelect = (conversation) => {
        setActiveConversation(conversation);
        fetchMessages(conversation.id);
        setNewMessage(''); 
    }

    const fetchConversations = async () => {
        try {
            const response = await messagesAPI.getConversations();
            const fetchedConversations = response.data.conversations;
            setConversations(fetchedConversations);
            
            // Auto-select the first conversation if no external user is selected
            if (!selectedUser && fetchedConversations.length > 0) {
                handleConversationSelect(fetchedConversations[0]);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Effects ---

    // 1. Initial Data Fetch
    useEffect(() => {
        if (user?.id) {
            fetchConversations();
        }
    }, [user?.id]); 

    // 2. Handle External Conversation/User Selection (Referral Logic) - FACEBOOK/WHATSAPP FEATURE
    useEffect(() => {
        if (selectedUser && user?.id && conversations.length > 0) {
            
            // Check if a conversation with this user already exists
            const existingConv = conversations.find(c => 
                c.users.some(u => u.id === selectedUser.id) &&
                c.users.some(u => u.id === user.id)
            );

            if (existingConv) {
                // Existing Conversation found: Load it
                handleConversationSelect(existingConv);
            } else {
                // New Conversation needed: Create temporary UI
                const newConv = {
                    id: `temp-${selectedUser.id}`, 
                    users: [user, selectedUser],
                    other_user: selectedUser, 
                    last_message: initialMessage || 'Start a new conversation',
                    last_message_time: '',
                    is_online: selectedUser.is_online || false,
                };
                
                // Add the new conversation to the list (so it shows up in the sidebar)
                setConversations(prev => [
                    newConv, 
                    // Filter out any older temporary convs for the same user if they exist
                    ...prev.filter(c => c.id !== `temp-${selectedUser.id}` && (c.other_user?.id !== selectedUser.id))
                ]);
                
                // Open the temporary conversation
                handleConversationSelect(newConv);
            }
            
            if (initialMessage) {
                setNewMessage(initialMessage);
            }
        }
    }, [selectedUser, initialMessage, conversations.length, user?.id]);


    // 3. Socket Connection & Messaging Listener
    useEffect(() => {
        if (!socket || !activeConversation || !user) return;
        
        const conversationId = activeConversation.id;
        
        // Join room only if it's a persisted conversation
        if (!String(conversationId).startsWith('temp-')) {
            socket.emit('join_conversation', conversationId);
        }

        const handleNewMessage = (message) => {
            // Check if the message belongs to the current active conversation
            if (message.conversation_id === activeConversation.id) {
                setMessages(prev => {
                    // 1. CONFIRMATION: Replace the optimistic message with the confirmed one
                    const isConfirmation = prev.some(m => m.temporary_id === message.temporary_id);
                    
                    if (isConfirmation) {
                        return prev.map(m => 
                            m.temporary_id === message.temporary_id ? { ...message, is_sending: false } : m
                        );
                    }
                    // 2. NEW MESSAGE: Message from the other party
                    return [...prev, message];
                });
            }
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, activeConversation, user]);

    // 4. Auto-Scroll to Bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    // --- Send Message Logic ---
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || isSending) return;

        const temporary_id = Date.now();
        const content = newMessage.trim();

        // 1. Optimistically Add Message (Immediate UI Update)
        setMessages(prev => [...prev, {
            id: temporary_id,
            conversation_id: activeConversation.id,
            content: content,
            user: { id: user.id, name: 'You', avatar: user.avatar || '/default-avatar.png' },
            created_at: new Date().toISOString(),
            is_own: true,
            is_sending: true,
            temporary_id: temporary_id
        }]);

        setNewMessage('');
        setIsSending(true);

        try {
            // Determine if this is the first message in a new conversation
            const isNewConversation = String(activeConversation.id).startsWith('temp-');
            
            const payload = {
                // If temporary, send null/undefined to signal creation; otherwise, send the real ID
                conversation_id: isNewConversation ? null : activeConversation.id,
                // The recipient is the other user (critical for new conversations)
                recipient_id: otherUser?.id || selectedUser?.id, 
                content: content,
                temporary_id: temporary_id, 
            };

            // 2. Persist Message via API
            const response = await messagesAPI.sendMessage(payload);
            const persistedMessage = response.data.message;
            const newConversation = response.data.conversation; 

            // 3. Update UI with persisted data
            setMessages(prev => 
                prev.map(m => m.id === temporary_id ? { ...persistedMessage, is_own: true, is_sending: false } : m)
            );

            // Handle new conversation creation logic
            if (isNewConversation && newConversation) {
                // Update active conversation and list with real ID
                setConversations(prev => prev.map(c => c.id === activeConversation.id ? newConversation : c));
                setActiveConversation(newConversation);
                
                // Join the new socket room with the real ID
                socket.emit('join_conversation', newConversation.id);
            }
            
            // 4. Send via Socket (For Real-Time Update on other client)
            if (socket) {
                socket.emit('send_message', persistedMessage);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            // Revert optimistic UI on failure
            setMessages(prev => prev.filter(m => m.id !== temporary_id));
            alert('Failed to send message. Please try again.');
        } finally {
            setIsSending(false);
        }
    };


    // --- Render ---

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            
            {/* Conversations List */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
                    <div className="relative mt-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            id="messages-search"
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-royal-blue"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            onClick={() => handleConversationSelect(conversation)}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                                activeConversation?.id === conversation.id
                                    ? 'bg-royal-blue/10 border-r-2 border-royal-blue'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <img
                                        src={conversation.other_user?.avatar || '/default-avatar.png'}
                                        alt={conversation.other_user?.name || 'User'}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    {conversation.is_online && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                            {conversation.other_user?.name || 'New Chat'}
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {conversation.last_message_time}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        {conversation.last_message || 'Start a conversation'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {activeConversation && otherUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={otherUser.avatar || '/default-avatar.png'}
                                    alt={otherUser.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {otherUser.name}
                                    </h3>
                                    <p className="text-sm text-green-500">
                                        {activeConversation.is_online ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Call Buttons and More */}
                            <div className="flex items-center space-x-2">
                                <CallButton user={otherUser} type="audio" />
                                <CallButton user={otherUser} type="video" />
                                
                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id || message.temporary_id} 
                                    className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                            message.is_own
                                                ? 'bg-royal-blue text-white rounded-br-none'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                                        } ${message.is_sending ? 'opacity-70' : ''}`}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                        <p
                                            className={`text-xs mt-1 ${
                                                message.is_own ? 'text-blue-100' : 'text-gray-500'
                                            }`}
                                        >
                                            {new Date(message.created_at).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                            {message.is_sending && ' • Sending...'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                                <button type="button" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                    <Paperclip className="h-5 w-5" />
                                </button>
                                <button type="button" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                    <Smile className="h-5 w-5" />
                                </button>
                                <input
                                    id="message-input"
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-royal-blue"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || isSending}
                                    className="p-2 bg-royal-blue text-white rounded-full hover:bg-royal-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        Select a conversation to start messaging
                    </div>
                )}
            </div>
        </div>
    );
}

export default Messages;
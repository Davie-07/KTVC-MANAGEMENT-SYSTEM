import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import './Tuchat.css';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  course: string;
  role: string;
  isOnline: boolean;
  isFriend: boolean;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  receiver: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  content: string;
  isRead: boolean;
  timestamp: string;
}

interface ConversationUser extends User {
  lastMessage?: Message;
}

const Tuchat: React.FC = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'messages'>('friends');
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<ConversationUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update online status when component mounts/unmounts
  useEffect(() => {
    const updateOnlineStatus = async (isOnline: boolean) => {
      try {
        await fetch(`${API_ENDPOINTS.AUTH}/online-status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ isOnline })
        });
      } catch (err) {
        console.error('Failed to update online status:', err);
      }
    };

    // Set online when component mounts
    updateOnlineStatus(true);

    // Set offline when component unmounts or page unloads
    const handleBeforeUnload = () => updateOnlineStatus(false);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      updateOnlineStatus(false);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [token]);

  // Real-time user status polling
  useEffect(() => {
    if (!token) return;

    const pollUserStatus = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.MESSAGES}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (err) {
        console.error('Error polling user status:', err);
      }
    };

    // Poll every 10 seconds for real-time status updates
    const interval = setInterval(pollUserStatus, 10000);
    pollUserStatus(); // Initial fetch

    return () => clearInterval(interval);
  }, [token]);

  // Fetch all users for friends tab
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from:', `${API_ENDPOINTS.MESSAGES}/users`);
      const response = await fetch(`${API_ENDPOINTS.MESSAGES}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Users response status:', response.status);
      
      if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
      
      const data = await response.json();
      console.log('Fetched users data:', data);
      
      // Additional safety check - filter out any null users
      const validUsers = data.filter((user: any) => user && user._id && (user.firstName || user.lastName));
      console.log('Valid users after filtering:', validUsers.length);
      
      setUsers(validUsers);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch conversations for messages tab
  const fetchConversations = async () => {
    try {
      setLoading(true);
      console.log('Fetching conversations from:', `${API_ENDPOINTS.MESSAGES}/conversations`);
      const response = await fetch(`${API_ENDPOINTS.MESSAGES}/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Conversations response status:', response.status);
      
      if (!response.ok) throw new Error(`Failed to fetch conversations: ${response.status}`);
      
      const data = await response.json();
      console.log('Fetched conversations data:', data);
      
      // Additional safety check - filter out any null users
      const validConversations = data.filter((user: any) => user && user._id && (user.firstName || user.lastName));
      console.log('Valid conversations after filtering:', validConversations.length);
      
      setConversations(validConversations);
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages between current user and selected user
  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.MESSAGES}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', err);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!selectedUser || !newMessage.trim()) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.MESSAGES}/${selectedUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const sentMessage = await response.json();
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  // Handle user selection
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    fetchMessages(user._id);
  };

  // Handle tab change
  const handleTabChange = (tab: 'friends' | 'messages') => {
    setActiveTab(tab);
    setSelectedUser(null);
    setMessages([]);
    if (tab === 'friends') {
      fetchUsers();
    } else {
      fetchConversations();
    }
  };

  // Auto-refresh messages every 5 seconds when a user is selected
  useEffect(() => {
    if (!selectedUser) return;

    const interval = setInterval(() => {
      fetchMessages(selectedUser._id);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedUser, token]);

  // Auto-refresh users/conversations every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'friends') {
        fetchUsers();
      } else {
        fetchConversations();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTab, token]);

  // Initial load
  useEffect(() => {
    if (activeTab === 'friends') {
      fetchUsers();
    } else {
      fetchConversations();
    }
  }, [activeTab, token]);

  // Handle Enter key to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentUser = (message: Message) => {
    return message.sender._id === user?.id;
  };

  // Don't render if user is not loaded
  if (!user) {
    return (
      <div className="tuchat-container">
        <div className="loading">Loading Tuchat...</div>
      </div>
    );
  }

  return (
    <div className="tuchat-container">
      <div className="tuchat-header">
        <h2>💬 Tuchat</h2>
        <div className="tuchat-tabs">
          <button 
            className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => handleTabChange('friends')}
          >
            👥 Friends
          </button>
          <button 
            className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => handleTabChange('messages')}
          >
            💌 Messages
          </button>
        </div>
      </div>

      <div className="tuchat-content">
        <div className="users-list">
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
                             {activeTab === 'friends' && (
                 <div className="users-grid">
                   {users
                     .filter(user => user && user._id && (user.firstName || user.lastName)) // Additional safety filter
                     .map(user => (
                       <div 
                         key={user._id}
                         className={`user-card ${selectedUser?._id === user._id ? 'selected' : ''}`}
                         onClick={() => handleUserSelect(user)}
                       >
                         <div className="user-avatar">
                           {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || 'S'}
                           <div className={`online-status ${user?.isOnline ? 'online' : 'offline'}`}></div>
                         </div>
                         <div className="user-info">
                           <div className="user-name">{user?.firstName || 'Unknown'} {user?.lastName || 'User'}</div>
                           <div className="user-course">{user?.course || 'No Course'}</div>
                           <div className="user-role">{user?.role || 'User'}</div>
                           <div className="friend-status">
                             {user?.isFriend ? '👥 Friend' : '👤 User'}
                           </div>
                         </div>
                       </div>
                     ))}
                 </div>
               )}

                             {activeTab === 'messages' && (
                 <div className="conversations-list">
                   {conversations
                     .filter(user => user && user._id && (user.firstName || user.lastName)) // Additional safety filter
                     .map(user => (
                       <div 
                         key={user._id}
                         className={`conversation-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
                         onClick={() => handleUserSelect(user)}
                       >
                         <div className="user-avatar">
                           {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || 'S'}
                           <div className={`online-status ${user?.isOnline ? 'online' : 'offline'}`}></div>
                         </div>
                         <div className="conversation-info">
                           <div className="user-name">{user?.firstName || 'Unknown'} {user?.lastName || 'User'}</div>
                           <div className="last-message">
                             {user?.lastMessage ? (
                               <>
                                 <span className="message-preview">
                                   {user.lastMessage.content.length > 30 
                                     ? user.lastMessage.content.substring(0, 30) + '...' 
                                     : user.lastMessage.content
                                   }
                                 </span>
                                 <span className="message-time">
                                   {formatTime(user.lastMessage.timestamp)}
                                 </span>
                               </>
                             ) : (
                               <span className="no-messages">No messages yet</span>
                             )}
                           </div>
                         </div>
                       </div>
                     ))}
                 </div>
               )}
            </>
          )}
        </div>

        <div className="chat-area">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <div className="selected-user-info">
                  <div className="user-avatar">
                    {selectedUser?.firstName?.charAt(0) || 'U'}{selectedUser?.lastName?.charAt(0) || 'S'}
                    <div className={`online-status ${selectedUser?.isOnline ? 'online' : 'offline'}`}></div>
                  </div>
                  <div>
                    <div className="user-name">{selectedUser?.firstName || 'Unknown'} {selectedUser?.lastName || 'User'}</div>
                    <div className="user-status">
                      {selectedUser?.isOnline ? '🟢 Online' : '🔴 Offline'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {messages.map(message => (
                  <div 
                    key={message._id}
                    className={`message ${isCurrentUser(message) ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      {message.content}
                    </div>
                    <div className="message-meta">
                      <span className="message-time">{formatTime(message.timestamp)}</span>
                      {isCurrentUser(message) && (
                        <span className="message-status">
                          {message.isRead ? '✅✅' : '✅'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="message-input">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows={3}
                />
                <button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="send-button"
                >
                  📤 Send
                </button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">💬</div>
              <h3>Select a user to start chatting</h3>
              <p>Choose someone from the {activeTab === 'friends' ? 'friends' : 'conversations'} list to begin messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tuchat; 
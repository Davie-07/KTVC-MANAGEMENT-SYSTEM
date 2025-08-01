import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

interface Message {
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  createdAt: string;
  unreadBy?: string[];
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading] = useState(false);
  const [marking] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    fetch(`${API_ENDPOINTS.MESSAGES_USER}/${user.id}`)
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching conversations:', err));
  }, [user]);

  const unseenMessages = user ? messages.filter(m => m.unreadBy && m.unreadBy.includes(user.id)) : [];

  const markAsRead = async (messageId: string) => {
    if (!user) return;
    
    try {
      await fetch(`${API_ENDPOINTS.MESSAGES_READ}/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Refresh conversations
      fetch(`${API_ENDPOINTS.MESSAGES_USER}/${user.id}`)
        .then(res => res.json())
        .then(data => setMessages(Array.isArray(data) ? data : []))
        .catch(err => console.error('Error refreshing conversations:', err));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return (
    <div style={{background:'#23232b',color:'#fff',borderRadius:12,padding:'1rem',minHeight:180,boxShadow:'0 2px 12px #0002'}}>
      <h3>Messages</h3>
      {unseenMessages.length > 0 && (
        <div style={{background:'#2563eb',color:'#fff',padding:'0.7rem',borderRadius:8,marginBottom:'1rem',fontWeight:600}}>
          You have {unseenMessages.length} new message{unseenMessages.length > 1 ? 's' : ''}!
        </div>
      )}
      {loading ? (
        <p>Loading messages...</p>
      ) : messages.length === 0 ? (
        <p>No messages.</p>
      ) : (
        <ul style={{paddingLeft:0,listStyle:'none'}}>
          {messages.map(m => {
            const isUnseen = user && m.unreadBy && m.unreadBy.includes(user.id);
            return (
              <li key={m._id} style={{marginBottom:'0.7rem',background:isUnseen ? '#1e293b' : '#18181b',borderRadius:8,padding:'0.7rem',border:isUnseen ? '2px solid #2563eb' : undefined}}>
                <span style={{fontWeight:600}}>{user && m.sender === user.id ? 'You' : m.sender}:</span> {m.content}<br/>
                <span style={{fontSize:'0.85em',color:'#60a5fa'}}>{new Date(m.createdAt).toLocaleString()}</span>
                {isUnseen && (
                  <button onClick={() => markAsRead(m._id)} disabled={marking === m._id} style={{marginLeft:12,background:'#22c55e',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer'}}>
                    {marking === m._id ? 'Marking...' : 'Dismiss'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Messages; 
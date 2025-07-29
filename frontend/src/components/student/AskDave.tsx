import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ChatMessage {
  from: 'user' | 'dave';
  text: string;
}

const AskDave: React.FC = () => {
  const { user, token } = useAuth();
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendQuestion = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setChat(prev => [...prev, { from: 'user', text: userMessage }]);
    setLoading(true);
    setInput('');

    try {
      const res = await fetch('http://localhost:5000/api/ask-dave', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          question: userMessage, 
          userId: user?.id 
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const answer = data.answer || 'Sorry, I could not answer that.';
      
      setChat(prev => [...prev, { from: 'dave', text: answer }]);
    } catch (error) {
      console.error('Error asking Dave:', error);
      setChat(prev => [...prev, { 
        from: 'dave', 
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment or contact support if the issue persists." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  const clearChat = () => {
    setChat([]);
  };

  return (
    <div style={{
      background: '#23232b',
      color: '#fff',
      borderRadius: 12,
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 2px 12px #0002',
      maxWidth: 600
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0 }}>🤖 Ask Dave (AI Assistant)</h3>
        {chat.length > 0 && (
          <button 
            onClick={clearChat}
            style={{
              background: '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '0.3rem 0.8rem',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Clear Chat
          </button>
        )}
      </div>
      
      <div style={{
        maxHeight: 300,
        overflowY: 'auto',
        marginBottom: '1rem',
        background: '#18181b',
        padding: '0.7rem',
        borderRadius: 6,
        border: '1px solid #444'
      }}>
        {chat.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af' }}>
            <p style={{ margin: '0 0 0.5rem 0' }}>👋 Hi! I'm Dave, your AI study assistant.</p>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Ask me about your courses, assignments, study tips, or any academic questions!
            </p>
          </div>
        ) : (
          chat.map((msg, idx) => (
            <div key={idx} style={{
              marginBottom: '0.7rem',
              textAlign: msg.from === 'user' ? 'right' : 'left'
            }}>
              <div style={{
                background: msg.from === 'user' ? '#2563eb' : '#22c55e',
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: 6,
                display: 'inline-block',
                maxWidth: '80%',
                wordWrap: 'break-word'
              }}>
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: 6,
            border: '1px solid #444',
            background: '#23232b',
            color: '#fff'
          }} 
          placeholder="Type your question..." 
          disabled={loading}
        />
        <button 
          onClick={sendQuestion} 
          disabled={loading || !input.trim()} 
          style={{
            background: loading ? '#6b7280' : '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '0.5rem 1.5rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Asking...' : 'Ask'}
        </button>
      </div>
      
      {loading && (
        <div style={{
          marginTop: '0.7rem',
          color: '#60a5fa',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>🤔</span>
          <span>Dave is thinking...</span>
        </div>
      )}
    </div>
  );
};

export default AskDave; 
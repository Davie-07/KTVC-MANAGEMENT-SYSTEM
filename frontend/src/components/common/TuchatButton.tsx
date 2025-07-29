import React, { useState, useEffect } from 'react';
import Tuchat from './Tuchat';
import { useAuth } from '../../context/AuthContext';
import './TuchatButton.css';

interface TuchatButtonProps {
  onClick?: () => void;
  isVisible?: boolean;
}

const TuchatButton: React.FC<TuchatButtonProps> = ({ onClick, isVisible = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { token } = useAuth();

  // Fetch unread message count
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messages/unread/count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Update unread count when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Reset count when chat is opened
      setUnreadCount(0);
    } else {
      // Fetch count when chat is closed
      fetchUnreadCount();
    }
  }, [isOpen, token]);

  // Fetch initial count and set up interval
  useEffect(() => {
    fetchUnreadCount();
    
    // Update count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [token]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (onClick) onClick();
  };

  if (!isVisible) return null;

  return (
    <>
      <button 
        className="tuchat-floating-button"
        onClick={handleToggle}
        aria-label="Open Tuchat"
      >
        💬 Tuchat
        {unreadCount > 0 && (
          <span className="unread-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="tuchat-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="tuchat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tuchat-modal-header">
              <h2>💬 Tuchat</h2>
              <button 
                className="tuchat-close-button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Tuchat"
              >
                ×
              </button>
            </div>
            <div className="tuchat-modal-content">
              <Tuchat />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TuchatButton; 
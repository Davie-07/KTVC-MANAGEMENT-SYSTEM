import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

const StudentNotificationPanel: React.FC = () => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!token) return;
    
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/student/${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
          setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every 5 seconds
    const interval = setInterval(fetchNotifications, 5000);
    
    return () => clearInterval(interval);
  }, [token, user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.MARK_NOTIFICATION_READ}/${notificationId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.DELETE_NOTIFICATION}/${notificationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        setUnreadCount(prev => {
          const notification = notifications.find(n => n._id === notificationId);
          return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (loading) {
    return <div className="notification-panel">Loading notifications...</div>;
  }

  return (
    <div className="notification-panel">
      <button 
        className="notification-bell"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      
      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>🔔 Notifications ({unreadCount} unread)</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read">
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification._id} 
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification._id)}
                >
                  {!notification.isRead && <div className="unread-indicator"></div>}
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <small>{new Date(notification.createdAt).toLocaleString()}</small>
                  </div>
                  <div className="notification-actions">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className="delete-btn"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0.2rem'
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentNotificationPanel; 
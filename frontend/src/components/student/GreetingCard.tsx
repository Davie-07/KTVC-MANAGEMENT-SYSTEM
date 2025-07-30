import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

const quotes = [
  'Success is not the key to happiness. Happiness is the key to success.',
  'The future belongs to those who believe in the beauty of their dreams.',
  'Do not wait to strike till the iron is hot; but make it hot by striking.',
  'The only way to do great work is to love what you do.',
  'Opportunities don\'t happen, you create them.',
  'Don\'t watch the clock; do what it does. Keep going.',
  'The harder you work for something, the greater you\'ll feel when you achieve it.'
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

const GreetingCard: React.FC = () => {
  const { user, token } = useAuth();
  const greeting = getGreeting();
  const name = user ? user.firstName : 'Student';
  const quote = quotes[new Date().getDay() % quotes.length];

  const [todaysClasses, setTodaysClasses] = useState<number | null>(null);
  const [loading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    fetch(`${API_ENDPOINTS.STUDENT_CLASSES}/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTodaysClasses(data.length))
      .catch(err => console.error('Error fetching today\'s classes:', err));
  }, [user, token]);

  return (
    <div className="greeting-card">
      <div className="greeting-header">
        <div className="greeting-icon">🎓</div>
        <div className="greeting-text">
          <h2 className="greeting-title">{greeting}, {name}!</h2>
          <p className="greeting-subtitle">Ready to conquer today's challenges?</p>
        </div>
      </div>
      
      <div className="greeting-stats">
        <div className="stat-item">
          <span className="stat-icon">📚</span>
          <div className="stat-content">
            <span className="stat-number">{loading ? '...' : todaysClasses ?? 0}</span>
            <span className="stat-label">Classes Today</span>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⭐</span>
          <div className="stat-content">
            <span className="stat-number">85%</span>
            <span className="stat-label">Attendance</span>
          </div>
        </div>
      </div>
      
      <div className="greeting-quote">
        <span className="quote-icon">💭</span>
        <p className="quote-text">{quote}</p>
      </div>
    </div>
  );
};

export default GreetingCard; 
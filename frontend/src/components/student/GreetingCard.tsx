import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

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

  const [classesToday, setClassesToday] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/class/student-today/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setClassesToday(Array.isArray(data) ? data.length : 0))
      .catch(() => setClassesToday(0))
      .finally(() => setLoading(false));
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
            <span className="stat-number">{loading ? '...' : classesToday ?? 0}</span>
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
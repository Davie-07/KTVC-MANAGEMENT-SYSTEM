import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const quotes = [
  'Teaching is the greatest act of optimism.',
  'The art of teaching is the art of assisting discovery.',
  'Education is not preparation for life; education is life itself.',
  'The best teachers teach from the heart, not from the book.',
  'Teaching is more than imparting knowledge; it is inspiring change.',
  'Every child deserves a champion—an adult who will never give up on them.',
  'The influence of a great teacher can never be erased.'
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

const TeacherGreetingCard: React.FC = () => {
  const { user, token } = useAuth();
  const greeting = getGreeting();
  const name = user ? user.firstName : 'Teacher';
  const quote = quotes[new Date().getDay() % quotes.length];

  const [classesToday, setClassesToday] = useState<number | null>(null);
  const [studentsCount, setStudentsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    // Fetch today's classes
    fetch(`http://localhost:5000/api/class/teacher-today/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setClassesToday(Array.isArray(data) ? data.length : 0))
      .catch(() => setClassesToday(0));

    // Fetch student count for teacher's course
    if (user.course) {
      fetch(`http://localhost:5000/api/auth/students/course/${encodeURIComponent(user.course)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setStudentsCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setStudentsCount(0))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, token]);

  return (
    <div className="greeting-card">
      <div className="greeting-header">
        <div className="greeting-icon">👨‍🏫</div>
        <div className="greeting-text">
          <h2 className="greeting-title">{greeting}, {name}!</h2>
          <p className="greeting-subtitle">Ready to inspire and educate today?</p>
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
          <span className="stat-icon">👥</span>
          <div className="stat-content">
            <span className="stat-number">{loading ? '...' : studentsCount ?? 0}</span>
            <span className="stat-label">Students</span>
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

export default TeacherGreetingCard; 
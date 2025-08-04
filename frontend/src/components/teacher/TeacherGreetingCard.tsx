import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

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
  const [classesToday, setClassesToday] = useState<number>(0);
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Safe user data extraction
  const greeting = getGreeting();
  const name = user?.firstName || user?.lastName || 'Teacher';
  const quote = quotes[new Date().getDay() % quotes.length];

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch today's classes
        const classesResponse = await fetch(`${API_ENDPOINTS.CLASSES}/teacher-today/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          setClassesToday(Array.isArray(classesData) ? classesData.length : 0);
        } else {
          console.error('Failed to fetch classes:', classesResponse.status);
          setClassesToday(0);
        }

        // Fetch student count for teacher's course
        if (user.course) {
          const studentsResponse = await fetch(
            `${API_ENDPOINTS.STUDENTS_BY_COURSE}/${encodeURIComponent(user.course)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (studentsResponse.ok) {
            const studentsData = await studentsResponse.json();
            console.log('Students data:', studentsData);
            setStudentsCount(Array.isArray(studentsData) ? studentsData.length : 0);
          } else {
            console.error('Failed to fetch students:', studentsResponse.status, studentsResponse.statusText);
            setStudentsCount(0);
          }
        } else {
          console.log('No course assigned to teacher');
          setStudentsCount(0);
        }
      } catch (err) {
        console.error('Error fetching teacher data:', err);
        setError('Failed to load dashboard data');
        setClassesToday(0);
        setStudentsCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token]);

  if (error) {
    return (
      <div className="greeting-card">
        <div className="greeting-header">
          <div className="greeting-icon">👨‍🏫</div>
          <div className="greeting-text">
            <h2 className="greeting-title">{greeting}, {name}!</h2>
            <p className="greeting-subtitle">Ready to inspire and educate today?</p>
          </div>
        </div>
        <div style={{ color: '#ef4444', textAlign: 'center', padding: '1rem' }}>
          {error}
        </div>
      </div>
    );
  }

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
            <span className="stat-number">{loading ? '...' : classesToday}</span>
            <span className="stat-label">Classes Today</span>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">👥</span>
          <div className="stat-content">
            <span className="stat-number">{loading ? '...' : studentsCount}</span>
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
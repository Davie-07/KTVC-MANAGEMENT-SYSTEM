import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const StudentTotalCourses: React.FC = () => {
  const { token } = useAuth();
  const [totalCourses, setTotalCourses] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalCourses = async () => {
      try {
        setLoading(true);
        
        // Fetch all published courses
        const response = await fetch(`http://localhost:5000/api/course/published`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const courses = await response.json();
        setTotalCourses(Array.isArray(courses) ? courses.length : 0);
      } catch (error) {
        console.error('Error fetching total courses:', error);
        setTotalCourses(0);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTotalCourses();
    }
  }, [token]);

  return (
    <div 
      style={{
        background: '#23232b',
        color: '#fff',
        borderRadius: 12,
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        border: '2px solid #10b981',
        flex: 1,
        margin: '0 0.5rem',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', opacity: 0.8 }}>
            Total Courses
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>
            {loading ? '...' : totalCourses ?? 0}
          </div>
        </div>
        <div style={{
          fontSize: '2rem',
          color: '#10b981',
          opacity: 0.7
        }}>
          ✅
        </div>
      </div>
    </div>
  );
};

export default StudentTotalCourses; 
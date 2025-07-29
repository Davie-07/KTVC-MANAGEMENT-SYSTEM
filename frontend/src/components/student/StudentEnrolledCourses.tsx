import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface CourseInfo {
  name: string;
  level: string;
  duration: string;
}

const StudentEnrolledCourses: React.FC = () => {
  const { user, token } = useAuth();
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        setLoading(true);
        if (!user?.course) {
          setCourseInfo(null);
          return;
        }
        
        // Get course level from user data (from registration form)
        const studentLevel = (user as any)?.level || 'Level 1';
        
        // Get course duration from user data (set by teacher)
        const studentDuration = (user as any)?.courseDuration || '1 Year';
        
        // Fetch course details for name
        const response = await fetch(`http://localhost:5000/api/course/name/${encodeURIComponent(user.course)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const course = await response.json();
        setCourseInfo({
          name: course.name || user.course,
          level: studentLevel,
          duration: studentDuration
        });
      } catch (error) {
        console.error('Error fetching course info:', error);
        // Fallback to user's course data
        setCourseInfo({
          name: user?.course || 'Not Assigned',
          level: user?.level || 'Level 1',
          duration: user?.courseDuration || '1 Year'
        });
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.course) {
      fetchCourseInfo();
    } else {
      setLoading(false);
    }
  }, [token, user?.course, user?.level, user?.courseDuration]);

  return (
    <div 
      style={{
        background: '#23232b',
        color: '#fff',
        borderRadius: 12,
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        border: '2px solid #3b82f6',
        flex: 1,
        margin: '0 0.5rem',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', opacity: 0.8 }}>
            Enrolled Course
          </h3>
          {loading ? (
            <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Loading...</div>
          ) : courseInfo ? (
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.3rem' }}>
                {courseInfo.name}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '0.2rem' }}>
                {courseInfo.level}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                {courseInfo.duration}
              </div>
            </div>
          ) : (
            <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
              No course enrolled
            </div>
          )}
        </div>
        <div style={{
          fontSize: '2rem',
          color: '#3b82f6',
          opacity: 0.7,
          marginLeft: '1rem'
        }}>
          📚
        </div>
      </div>
    </div>
  );
};

export default StudentEnrolledCourses; 
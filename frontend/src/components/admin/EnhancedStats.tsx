import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import StatisticsCard from './StatisticsCard';

interface EnhancedStatsProps {
  userRole: string;
}

const EnhancedStats: React.FC<EnhancedStatsProps> = ({ userRole }) => {
  const { token } = useAuth();
  const [coursesCount, setCoursesCount] = useState(0);
  const [classesCount, setClassesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Determine courses endpoint based on user role
        let coursesEndpoint = API_ENDPOINTS.COURSES;
        if (userRole === 'teacher') {
          coursesEndpoint = API_ENDPOINTS.PUBLISHED_COURSES;
        }
        
        // Fetch courses
        const coursesResponse = await fetch(coursesEndpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const coursesData = await coursesResponse.json();
        setCoursesCount(coursesData.length);
        
        // Fetch classes
        const classesResponse = await fetch(API_ENDPOINTS.CLASSES, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const classesData = await classesResponse.json();
        setClassesCount(classesData.length);
        
        // Fetch students
        const studentsResponse = await fetch(API_ENDPOINTS.STUDENTS, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const studentsData = await studentsResponse.json();
        setStudentsCount(studentsData.length);
        
        // Fetch teachers
        const teachersResponse = await fetch(API_ENDPOINTS.TEACHERS, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const teachersData = await teachersResponse.json();
        setTeachersCount(teachersData.length);
        
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchStats();
    }
  }, [token, userRole]);

  if (userRole === 'student') {
    return (
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <StatisticsCard
          title="Total Courses"
          count={coursesCount}
          loading={loading}
          icon="📚"
          color="#8b5cf6"
        />
        <StatisticsCard
          title="Published Courses"
          count={coursesCount} // Assuming all courses are published for students
          loading={loading}
          icon="✅"
          color="#10b981"
        />
      </div>
    );
  }

  if (userRole === 'teacher') {
    return (
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <StatisticsCard
          title="Total Courses"
          count={coursesCount}
          loading={loading}
          icon="📚"
          color="#8b5cf6"
        />
        <StatisticsCard
          title="Published Courses"
          count={coursesCount} // Assuming all courses are published for teachers
          loading={loading}
          icon="✅"
          color="#10b981"
        />
        <StatisticsCard
          title="Total Classes"
          count={classesCount}
          loading={loading}
          icon="🏫"
          color="#f59e0b"
        />
        <StatisticsCard
          title="Active Classes"
          count={classesCount} // Assuming all classes are active for teachers
          loading={loading}
          icon="🟢"
          color="#10b981"
        />
      </div>
    );
  }

  // Admin view - includes system health
  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
      <StatisticsCard
        title="Total Courses"
        count={coursesCount}
        loading={loading}
        icon="📚"
        color="#8b5cf6"
      />
      <StatisticsCard
        title="Published Courses"
        count={coursesCount}
        loading={loading}
        icon="✅"
        color="#10b981"
      />
      <StatisticsCard
        title="Unpublished Courses"
        count={0} // No direct count for unpublished courses in this simplified view
        loading={loading}
        icon="⏳"
        color="#f59e0b"
      />
      <StatisticsCard
        title="Total Classes"
        count={classesCount}
        loading={loading}
        icon="🏫"
        color="#3b82f6"
      />
      <StatisticsCard
        title="Active Classes"
        count={classesCount} // Assuming all classes are active for admin
        loading={loading}
        icon="🟢"
        color="#10b981"
      />
      <StatisticsCard
        title="Total Students"
        count={studentsCount}
        loading={loading}
        icon="👥"
        color="#ef4444"
      />
      <StatisticsCard
        title="Total Teachers"
        count={teachersCount}
        loading={loading}
        icon="👨‍🏫"
        color="#10b981"
      />
    </div>
  );
};

export default EnhancedStats; 
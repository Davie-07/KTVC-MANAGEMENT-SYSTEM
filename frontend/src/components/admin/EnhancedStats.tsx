import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatisticsCard from './StatisticsCard';

interface EnhancedStatsProps {
  userRole: string;
}

const EnhancedStats: React.FC<EnhancedStatsProps> = ({ userRole }) => {
  const { token } = useAuth();
  const [courseStats, setCourseStats] = useState({ total: 0, published: 0, unpublished: 0 });
  const [classStats, setClassStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnhancedStats = async () => {
      try {
        // Fetch course statistics based on user role
        let coursesEndpoint = 'http://localhost:5000/api/course';
        if (userRole === 'teacher') {
          coursesEndpoint = 'http://localhost:5000/api/course/published';
        }
        
        const coursesResponse = await fetch(coursesEndpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const coursesData = await coursesResponse.json();
        const courses = Array.isArray(coursesData) ? coursesData : [];
        
        if (userRole === 'teacher') {
          // For teachers, all courses returned are published
          setCourseStats({
            total: courses.length,
            published: courses.length,
            unpublished: 0
          });
        } else {
          // For admin, filter published courses
          const published = courses.filter((course: any) => course.published).length;
          setCourseStats({
            total: courses.length,
            published,
            unpublished: courses.length - published
          });
        }

        // Fetch class statistics
        const classesResponse = await fetch('http://localhost:5000/api/class', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const classesData = await classesResponse.json();
        const classes = Array.isArray(classesData) ? classesData : [];
        const active = classes.filter((cls: any) => cls.published).length;
        setClassStats({
          total: classes.length,
          active,
          inactive: classes.length - active
        });

      } catch (error) {
        console.error('Error fetching enhanced stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEnhancedStats();
    }
  }, [token, userRole]);

  if (userRole === 'student') {
    return (
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <StatisticsCard
          title="Total Courses"
          count={courseStats.total}
          loading={loading}
          icon="📚"
          color="#8b5cf6"
        />
        <StatisticsCard
          title="Published Courses"
          count={courseStats.published}
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
          count={courseStats.total}
          loading={loading}
          icon="📚"
          color="#8b5cf6"
        />
        <StatisticsCard
          title="Published Courses"
          count={courseStats.published}
          loading={loading}
          icon="✅"
          color="#10b981"
        />
        <StatisticsCard
          title="Total Classes"
          count={classStats.total}
          loading={loading}
          icon="🏫"
          color="#f59e0b"
        />
        <StatisticsCard
          title="Active Classes"
          count={classStats.active}
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
        count={courseStats.total}
        loading={loading}
        icon="📚"
        color="#8b5cf6"
      />
      <StatisticsCard
        title="Published Courses"
        count={courseStats.published}
        loading={loading}
        icon="✅"
        color="#10b981"
      />
      <StatisticsCard
        title="Unpublished Courses"
        count={courseStats.unpublished}
        loading={loading}
        icon="⏳"
        color="#f59e0b"
      />
      <StatisticsCard
        title="Total Classes"
        count={classStats.total}
        loading={loading}
        icon="🏫"
        color="#3b82f6"
      />
      <StatisticsCard
        title="Active Classes"
        count={classStats.active}
        loading={loading}
        icon="🟢"
        color="#10b981"
      />
    </div>
  );
};

export default EnhancedStats; 
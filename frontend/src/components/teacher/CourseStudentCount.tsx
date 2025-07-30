import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import StatisticsCard from '../admin/StatisticsCard';

interface CourseStudentCountProps {
  onTabChange?: (tab: string) => void;
}

const CourseStudentCount: React.FC<CourseStudentCountProps> = ({ onTabChange }) => {
  const { user, token } = useAuth();
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        setLoading(true);
        if (!user?.course) {
          console.log('No course found for teacher:', user);
          setStudentCount(0);
          return;
        }
        
        const response = await fetch(`${API_ENDPOINTS.STUDENTS_BY_COURSE}/${encodeURIComponent(user.course)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const students = await response.json();
        setStudentCount(Array.isArray(students) ? students.length : 0);
      } catch (error) {
        console.error('Error fetching student count:', error);
        setStudentCount(0);
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.course) {
      fetchStudentCount();
    }
  }, [token, user?.course]);

  const handleClick = () => {
    if (onTabChange) {
      onTabChange('students');
    }
  };

  return (
    <StatisticsCard
      title={`No. of ${user?.course || 'Course'} Students`}
      count={studentCount}
      loading={loading}
      icon="👨‍🎓"
      color="#10b981"
      onClick={handleClick}
    />
  );
};

export default CourseStudentCount; 
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import StatisticsCard from './StatisticsCard';

interface AdminDashboardStatsProps {
  onTabChange?: (tab: string) => void;
}

const AdminDashboardStats: React.FC<AdminDashboardStatsProps> = ({ onTabChange }) => {
  const { token } = useAuth();
  const [teacherCount, setTeacherCount] = useState<number | null>(null);
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch teachers count
        const teachersResponse = await fetch(API_ENDPOINTS.TEACHERS, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const teachersData = await teachersResponse.json();
        setTeacherCount(Array.isArray(teachersData) ? teachersData.length : 0);

        // Fetch students count (we'll need to create this endpoint or use existing one)
        const studentsResponse = await fetch(API_ENDPOINTS.STUDENTS, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const studentsData = await studentsResponse.json();
        setStudentCount(Array.isArray(studentsData) ? studentsData.length : 0);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setTeacherCount(0);
        setStudentCount(0);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  return (
    <>
      <StatisticsCard
        title="Total Teachers"
        count={teacherCount}
        loading={loading}
        icon="👨‍🏫"
        color="#3b82f6"
        onClick={() => onTabChange?.('teachers')}
      />
      <StatisticsCard
        title="Total Students"
        count={studentCount}
        loading={loading}
        icon="👨‍🎓"
        color="#10b981"
      />
    </>
  );
};

export default AdminDashboardStats; 
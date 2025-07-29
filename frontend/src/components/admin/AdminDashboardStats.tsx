import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatisticsCard from './StatisticsCard';

interface AdminDashboardStatsProps {
  onTabChange?: (tab: string) => void;
}

const AdminDashboardStats: React.FC<AdminDashboardStatsProps> = ({ onTabChange }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const [teacherCount, setTeacherCount] = useState<number | null>(null);
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch teachers count
        const teachersResponse = await fetch('http://localhost:5000/api/auth/teachers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const teachersData = await teachersResponse.json();
        setTeacherCount(Array.isArray(teachersData) ? teachersData.length : 0);

        // Fetch students count (we'll need to create this endpoint or use existing one)
        const studentsResponse = await fetch('http://localhost:5000/api/auth/students', {
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
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

const StudentUpcomingClasses: React.FC = () => {
  const { user, token } = useAuth();
  const [classesCount, setClassesCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingClasses = async () => {
      try {
        setLoading(true);
        if (!user?.id) {
          setClassesCount(0);
          return;
        }
        
        // Fetch upcoming classes for student (excluding today)
        const response = await fetch(`${API_ENDPOINTS.CLASSES}/student/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const allClasses = await response.json();
        
        // Filter for upcoming classes (excluding today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingClasses = Array.isArray(allClasses) ? allClasses.filter((cls: any) => {
          const classDate = new Date(cls.date);
          return classDate > today;
        }) : [];
        
        setClassesCount(upcomingClasses.length);
      } catch (error) {
        console.error('Error fetching upcoming classes:', error);
        setClassesCount(0);
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.id) {
      fetchUpcomingClasses();
      
      // Poll for updates every 10 seconds
      const interval = setInterval(fetchUpcomingClasses, 10000);
      
      return () => clearInterval(interval);
    }
  }, [token, user?.id]);

  return (
    <div 
      style={{
        background: '#23232b',
        color: '#fff',
        borderRadius: 12,
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        border: '2px solid #f59e0b',
        flex: 1,
        margin: '0 0.5rem',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', opacity: 0.8 }}>
            Upcoming Classes
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {loading ? '...' : classesCount ?? 0}
          </div>
        </div>
        <div style={{
          fontSize: '2rem',
          color: '#f59e0b',
          opacity: 0.7
        }}>
          📅
        </div>
      </div>
    </div>
  );
};

export default StudentUpcomingClasses; 
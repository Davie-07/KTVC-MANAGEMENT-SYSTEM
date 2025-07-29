import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GrowthData {
  month: string;
  students: number;
  teachers: number;
  courses: number;
  classes: number;
}

interface StudentProgress {
  unit: string;
  cam1: { score: number; outOf: number };
  cam2: { score: number; outOf: number };
  average: number;
  target: number;
}

const GrowthCharts: React.FC = () => {
  const { user, token } = useAuth();
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        setLoading(true);
        
        // Fetch real growth data from the backend
        const response = await fetch(`${API_ENDPOINTS.SYSTEM}/growth-data`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setGrowthData(data);
        } else {
          // Fallback to empty array if endpoint doesn't exist yet
          setGrowthData([]);
        }

        // Fetch real student progress data if user is a student
        if (user?.role === 'student') {
          const progressResponse = await fetch(`${API_ENDPOINTS.EXAM_RESULTS}/student/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            // Transform the data to match our interface
            const transformedProgress = progressData.map((result: any) => ({
              unit: result.unit,
              cam1: result.cam1 || { score: 0, outOf: 100 },
              cam2: result.cam2 || { score: 0, outOf: 100 },
              average: result.average || 0,
              target: 70 // Default target
            }));
            setStudentProgress(transformedProgress);
          } else {
            setStudentProgress([]);
          }
        } else {
          setStudentProgress([]);
        }

      } catch (error) {
        console.error('Error fetching growth data:', error);
        setGrowthData([]);
        setStudentProgress([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchGrowthData();
    }
  }, [token, user]);

  const renderGrowthChart = () => {
    if (growthData.length === 0) {
      return (
        <div style={{ 
          background: '#374151', 
          padding: '2rem', 
          borderRadius: '8px', 
          textAlign: 'center',
          color: '#9ca3af'
        }}>
          <p>No growth data available yet.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Growth data will appear as the system is used.
          </p>
        </div>
      );
    }

    return (
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>System Growth Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#d1d5db" />
            <YAxis stroke="#d1d5db" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#23232b', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="teachers" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="courses" stroke="#f59e0b" strokeWidth={2} />
            <Line type="monotone" dataKey="classes" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderStudentProgress = () => {
    if (user?.role !== 'student' || studentProgress.length === 0) {
      return null;
    }

    return (
      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Your Academic Progress</h3>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {studentProgress.map((progress, index) => (
            <div key={index} style={{
              background: '#374151',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #4b5563'
            }}>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>{progress.unit}</h4>
              
              <div style={{ marginBottom: '0.5rem' }}>
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="progress-label">CAM 1</span>
                    <span style={{ color: (progress.cam1.score / progress.cam1.outOf * 100) >= progress.target ? '#10b981' : '#ef4444' }}>
                      {Math.round(progress.cam1.score / progress.cam1.outOf * 100)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{
                        width: `${Math.min(progress.cam1.score / progress.cam1.outOf * 100, 100)}%`,
                        background: (progress.cam1.score / progress.cam1.outOf * 100) >= progress.target ? '#10b981' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
                
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="progress-label">CAM 2</span>
                    <span style={{ color: (progress.cam2.score / progress.cam2.outOf * 100) >= progress.target ? '#10b981' : '#ef4444' }}>
                      {Math.round(progress.cam2.score / progress.cam2.outOf * 100)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{
                        width: `${Math.min(progress.cam2.score / progress.cam2.outOf * 100, 100)}%`,
                        background: (progress.cam2.score / progress.cam2.outOf * 100) >= progress.target ? '#10b981' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #4b5563', paddingTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 'bold' }}>
                  <span>Average:</span>
                  <span style={{ color: progress.average >= progress.target ? '#10b981' : '#ef4444' }}>
                    {progress.average}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#4b5563',
                  borderRadius: '4px',
                  marginTop: '0.25rem'
                }}>
                  <div style={{
                    width: `${Math.min(progress.average, 100)}%`,
                    height: '100%',
                    background: progress.average >= progress.target ? '#10b981' : '#ef4444',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>Loading growth data...</div>;
  }

  return (
    <div style={{
      background: '#23232b',
      color: '#fff',
      borderRadius: 12,
      padding: '1.5rem',
      marginBottom: '2rem',
      border: '1px solid #374151'
    }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>📈 Growth & Progress Charts</h2>
      
      {renderGrowthChart()}
      {renderStudentProgress()}

      <div style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center', marginTop: '1rem' }}>
        📊 Charts display real data from the system
      </div>
    </div>
  );
};

export default GrowthCharts; 
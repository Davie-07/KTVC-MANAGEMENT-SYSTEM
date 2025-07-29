import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ExamResult {
  _id: string;
  unit: string;
  cam1: { score: number; outOf: number };
  cam2: { score: number; outOf: number };
  cam3: { score: number; outOf: number };
  average: number;
}

const ExamResultsChart: React.FC = () => {
  const { user, token } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/exam-result/student/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const processedData = Array.isArray(data) ? data.map(result => ({
          ...result,
          cam1: result.cam1 || { score: 0, outOf: 100 },
          cam2: result.cam2 || { score: 0, outOf: 100 },
          cam3: result.cam3 || { score: 0, outOf: 100 },
          cam1Percentage: result.cam1 ? (result.cam1.score / result.cam1.outOf) * 100 : 0,
          cam2Percentage: result.cam2 ? (result.cam2.score / result.cam2.outOf) * 100 : 0,
          cam3Percentage: result.cam3 ? (result.cam3.score / result.cam3.outOf) * 100 : 0,
          average: result.average || 0
        })) : [];
        setResults(processedData);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [user, token]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#23232b',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '12px',
          color: '#fff'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#3b82f6' }}>
            {label}
          </p>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#60a5fa' }}>CAM 1: </span>
            <span>{data.cam1.score}/{data.cam1.outOf} ({data.cam1Percentage.toFixed(1)}%)</span>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#f59e42' }}>CAM 2: </span>
            <span>{data.cam2.score}/{data.cam2.outOf} ({data.cam2Percentage.toFixed(1)}%)</span>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#8b5cf6' }}>CAM 3: </span>
            <span>{data.cam3.score}/{data.cam3.outOf} ({data.cam3Percentage.toFixed(1)}%)</span>
          </div>
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #374151' }}>
            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Average: </span>
            <span style={{ fontWeight: 'bold' }}>{data.average.toFixed(1)}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="exam-results-chart">
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading exam results...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="no-data">
          <div className="no-data-icon">📊</div>
          <p>No exam results available</p>
        </div>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={results} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="unit" 
                stroke="#d1d5db" 
                fontSize={12}
                tick={{ fill: '#d1d5db' }}
              />
              <YAxis 
                stroke="#d1d5db" 
                domain={[0, 100]} 
                fontSize={12}
                tick={{ fill: '#d1d5db' }}
                label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fill: '#d1d5db' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="cam1Percentage" 
                fill="#60a5fa" 
                name="CAM 1" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="cam2Percentage" 
                fill="#f59e42" 
                name="CAM 2" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="cam3Percentage" 
                fill="#8b5cf6" 
                name="CAM 3" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="average" 
                fill="#22c55e" 
                name="Average" 
                radius={[4, 4, 0, 0]}
              />
              <ReferenceLine 
                y={50} 
                label="Pass Mark" 
                stroke="#ef4444" 
                strokeDasharray="3 3"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="results-summary">
            <div className="summary-stats">
              <div className="summary-item">
                <span className="summary-label">Total Subjects:</span>
                <span className="summary-value">{results.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Average Score:</span>
                <span className="summary-value">
                  {(results.reduce((sum, result) => sum + result.average, 0) / results.length).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamResultsChart; 
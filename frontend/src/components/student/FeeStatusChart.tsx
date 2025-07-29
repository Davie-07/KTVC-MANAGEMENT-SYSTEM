import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

const FeeStatusChart: React.FC = () => {
  const { user, token } = useAuth();
  const [feeStatus, setFeeStatus] = useState<{ paid: number; due: number; partial: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/fee-status/student/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setFeeStatus(data ? { 
        paid: data.paid || 0, 
        due: data.due || 0, 
        partial: data.partial || 0 
      } : null))
      .catch(() => setFeeStatus(null))
      .finally(() => setLoading(false));
  }, [user, token]);

  const data = feeStatus ? [
    { name: 'Paid', value: feeStatus.paid, color: COLORS[0] },
    { name: 'Due', value: feeStatus.due, color: COLORS[1] },
    { name: 'Partial', value: feeStatus.partial, color: COLORS[2] }
  ].filter(item => item.value > 0) : [];

  const totalFees = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalFees > 0 ? ((data.value / totalFees) * 100).toFixed(1) : 0;
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#23232b',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '12px',
          color: '#fff'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{data.name}</p>
          <p style={{ margin: '0', color: '#9ca3af' }}>
            Amount: KSH {data.value.toLocaleString()}
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#9ca3af' }}>
            Percentage: {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fee-status-chart">
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading fee status...</p>
        </div>
      ) : !feeStatus ? (
        <div className="no-data">
          <div className="no-data-icon">💰</div>
          <p>No fee data available</p>
        </div>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="chart-legend">
            {data.map((entry, index) => (
              <div key={entry.name} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="legend-label">{entry.name}</span>
                <span className="legend-value">KSH {entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
          
          <div className="total-fees">
            <span className="total-label">Total Fees</span>
            <span className="total-amount">KSH {totalFees.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeStatusChart; 
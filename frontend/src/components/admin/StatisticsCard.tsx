import React from 'react';

interface StatisticsCardProps {
  title: string;
  count: number | string | null;
  loading: boolean;
  icon: string;
  color: string;
  onClick?: () => void;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ title, count, loading, icon, color, onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        background: '#23232b',
        color: '#fff',
        borderRadius: 12,
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        border: `2px solid ${color}`,
        flex: 1,
        margin: '0 0.5rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...(onClick && {
          ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
          }
        })
      }}
      onMouseEnter={onClick ? (e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
      } : undefined}
      onMouseLeave={onClick ? (e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      } : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', opacity: 0.8 }}>
            {title}
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color }}>
            {loading ? '...' : count ?? 0}
          </div>
        </div>
        <div style={{
          fontSize: '2rem',
          color,
          opacity: 0.7
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard; 
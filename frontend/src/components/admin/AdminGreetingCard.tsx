import React from 'react';
import { useAuth } from '../../context/AuthContext';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

const AdminGreetingCard: React.FC = () => {
  const { user } = useAuth();
  const greeting = getGreeting();
  const name = user?.firstName || 'Admin';

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      borderRadius: 15,
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '600' }}>
        {greeting}, {name}!
      </h1>
      <p style={{ fontSize: '1.3rem', marginBottom: '0.5rem', opacity: 0.9 }}>
        Welcome to your dashboard, your tools are ready, and systems are green.
      </p>
      <p style={{ fontSize: '1.1rem', opacity: 0.8, fontStyle: 'italic' }}>
        Let's build brilliance today.
      </p>
    </div>
  );
};

export default AdminGreetingCard; 
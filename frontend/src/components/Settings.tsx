import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
  const { logout } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>(localStorage.getItem('theme') === 'light' ? 'light' : 'dark');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.body.style.background = '#fff';
      document.body.style.color = '#18181b';
    } else {
      document.body.style.background = '#18181b';
      document.body.style.color = '#fff';
    }
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div style={{background:'#23232b',color:'#fff',borderRadius:12,padding:'1.5rem',marginBottom:'1.5rem',boxShadow:'0 2px 12px #0002',maxWidth:500}}>
      <h3>Settings</h3>
      <div style={{marginBottom:'1.5rem'}}>
        <label style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <span>Theme:</span>
          <button onClick={toggleTheme} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:6,padding:'0.5rem 1.5rem',fontWeight:600,cursor:'pointer'}}>
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </label>
      </div>
      <button onClick={logout} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'0.7rem 1.5rem',fontWeight:600,cursor:'pointer'}}>Logout</button>
    </div>
  );
};

export default Settings; 
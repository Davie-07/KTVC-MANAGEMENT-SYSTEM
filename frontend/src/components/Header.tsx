import React from 'react';
import { useAuth } from '../context/AuthContext';
import QuickActionsPanel from './admin/QuickActionsPanel';
import TeacherNotificationPanel from './teacher/TeacherNotificationPanel';
import StudentNotificationPanel from './student/StudentNotificationPanel';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  return (
    <header className="header">
      <div className="header-left">KTVC</div>
      <div className="header-center">
        <img 
          src="/KTVC-LOGO.png" 
          alt="School Logo" 
          className="school-logo" 
          onError={(e) => {
            console.error('Failed to load logo:', e);
            e.currentTarget.style.display = 'none';
          }}
        />
        <span className="school-name">KANDARA TECHNICAL COLLEGE</span>
      </div>
      <div className="header-right">
        {isAdmin && <QuickActionsPanel />}
        {isTeacher && <TeacherNotificationPanel />}
        {isStudent && <StudentNotificationPanel />}
        <span className="account-icon">👤</span>
        <span className="account-name">{user?.firstName || 'Account'}</span>
        {user && (
          <button className="logout-btn" onClick={logout} style={{marginLeft:'1rem'}}>Logout</button>
        )}
      </div>
    </header>
  );
};

export default Header; 
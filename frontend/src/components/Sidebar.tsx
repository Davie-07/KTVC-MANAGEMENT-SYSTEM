import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  return (
    <aside className="sidebar-content">
      <nav>
        <ul>
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => onTabChange('dashboard')}>Dashboard</li>
          <li className={activeTab === 'announcements' ? 'active' : ''} onClick={() => onTabChange('announcements')}>Announcements</li>
          <li className={activeTab === 'classes' ? 'active' : ''} onClick={() => onTabChange('classes')}>Classes</li>
          <li className={activeTab === 'tuchat' ? 'active' : ''} onClick={() => onTabChange('tuchat')}>💬 Tuchat</li>
          {isAdmin && (
            <>
              <li className={activeTab === 'courses' ? 'active' : ''} onClick={() => onTabChange('courses')}>Courses</li>
              <li className={activeTab === 'teachers' ? 'active' : ''} onClick={() => onTabChange('teachers')}>Teachers</li>
              <li className={activeTab === 'academic-calendar' ? 'active' : ''} onClick={() => onTabChange('academic-calendar')}>Academic Calendar</li>
              <li className={activeTab === 'academic-fee' ? 'active' : ''} onClick={() => onTabChange('academic-fee')}>Academic Fee</li>
            </>
          )}
          {(isAdmin || user?.role === 'teacher') && (
            <li className={activeTab === 'student-fees' ? 'active' : ''} onClick={() => onTabChange('student-fees')}>Student Fees</li>
          )}
          <li className={activeTab === 'upskill' ? 'active' : ''} onClick={() => onTabChange('upskill')}>Upskill</li>
          {isAdmin ? (
            <li className={activeTab === 'users' ? 'active' : ''} onClick={() => onTabChange('users')}>Users</li>
          ) : user?.role === 'teacher' ? (
            <>
              <li className={activeTab === 'students' ? 'active' : ''} onClick={() => onTabChange('students')}>My Students</li>
              <li className={activeTab === 'course-duration' ? 'active' : ''} onClick={() => onTabChange('course-duration')}>Course Duration</li>
            </>
          ) : (
            <li className={activeTab === 'users' ? 'active' : ''} onClick={() => onTabChange('users')}>Users</li>
          )}
          <li className={activeTab === 'fees' ? 'active' : ''} onClick={() => onTabChange('fees')}>Fees</li>
          <li className={activeTab === 'exams' ? 'active' : ''} onClick={() => onTabChange('exams')}>Exams</li>
          <li className={activeTab === 'ask-dave' ? 'active' : ''} onClick={() => onTabChange('ask-dave')}>Ask Dave</li>
          <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => onTabChange('settings')}>Settings</li>
        </ul>
      </nav>
    </aside>
  );
};
export default Sidebar; 
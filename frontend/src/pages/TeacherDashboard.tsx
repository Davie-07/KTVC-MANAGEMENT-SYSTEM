import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import TeacherGreetingCard from '../components/teacher/TeacherGreetingCard';
import AdvancedSearch from '../components/common/AdvancedSearch';
import DataExport from '../components/common/DataExport';
import Tuchat from '../components/common/Tuchat';
import ManageStudents from '../components/teacher/ManageStudents';
import TeacherCalendar from '../components/teacher/TeacherCalendar';
import CreateExamResultForm from '../components/teacher/CreateExamResultForm';
import ExamResultsList from '../components/teacher/ExamResultsList';
import CreateAnnouncementForm from '../components/teacher/CreateAnnouncementForm';
import SetStudentCourseDuration from '../components/teacher/SetStudentCourseDuration';
import TeacherNotificationPanel from '../components/teacher/TeacherNotificationPanel';
import Footer from '../components/Footer';
import EnhancedStats from '../components/admin/EnhancedStats';
import GrowthCharts from '../components/common/GrowthCharts';
import StudentFeeManagement from '../components/teacher/StudentFeeManagement';
import CourseStudentCount from '../components/teacher/CourseStudentCount';
import AskDave from '../components/student/AskDave';
import Settings from '../components/Settings';
import ManageFeeStatusForm from '../components/teacher/ManageFeeStatusForm';

interface TeacherDashboardProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ activeTab, onTabChange }) => {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ensure user and token are loaded before rendering
  useEffect(() => {
    if (user && token) {
      setIsLoading(false);
    } else if (!user && !token) {
      setIsLoading(false);
    }
  }, [user, token]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: '#fff',
        textAlign: 'center'
      }}>
        <div>
          <h3>Loading Teacher Dashboard...</h3>
          <p>Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // No user state
  if (!user || !token) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: '#fff',
        textAlign: 'center'
      }}>
        <div>
          <h3>Authentication Required</h3>
          <p>Please log in to access the teacher dashboard.</p>
        </div>
      </div>
    );
  }

  // Safe user role check
  const userRole = user?.role || 'teacher';

  // Render main content based on active tab
  const renderMainContent = () => {
    try {
      switch (activeTab) {
        case 'dashboard':
          return (
            <div className="dashboard-container">
              <div className="card-full">
                <TeacherGreetingCard />
              </div>
              <div className="card-full">
                <EnhancedStats userRole={userRole} />
              </div>
              <div className="card-row-2">
                <div>
                  <h3>🔍 Advanced Search</h3>
                  <AdvancedSearch userRole={userRole} />
                </div>
                <DataExport userRole={userRole} dataType="classes" />
              </div>
              <div className="card-full">
                <TeacherNotificationPanel />
              </div>
              <div className="card-row-2">
                <div className="card-half">
                  <GrowthCharts />
                </div>
                <div className="card-half">
                  <CourseStudentCount />
                </div>
              </div>
            </div>
          );

        case 'students':
          return <ManageStudents />;

        case 'calendar':
          return <TeacherCalendar />;

        case 'exam-results':
          return (
            <div className="dashboard-container">
              <div className="card-full">
                <CreateExamResultForm />
              </div>
              <div className="card-full">
                <ExamResultsList />
              </div>
            </div>
          );

        case 'announcements':
          return <CreateAnnouncementForm />;

        case 'course-duration':
          return <SetStudentCourseDuration />;

        case 'fee-management':
          return (
            <div className="dashboard-container">
              <div className="card-full">
                <StudentFeeManagement />
              </div>
              <div className="card-full">
                <ManageFeeStatusForm />
              </div>
            </div>
          );

        case 'tuchat':
          return <Tuchat />;

        case 'ask-dave':
          return <AskDave />;

        case 'settings':
          return <Settings />;

        default:
          return (
            <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>
              <h2>Page Not Found</h2>
              <p>The requested page could not be found.</p>
            </div>
          );
      }
    } catch (err) {
      console.error('Error rendering teacher dashboard content:', err);
      setError('An error occurred while loading the dashboard content.');
      return (
        <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>
          <h2>Error Loading Content</h2>
          <p>Please refresh the page or try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
  };

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-content">
        {renderMainContent()}
      </div>
      <Footer />
    </div>
  );
};

export default TeacherDashboard; 
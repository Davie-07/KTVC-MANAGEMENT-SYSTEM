import React, { useState } from 'react';
import TeacherGreetingCard from '../components/teacher/TeacherGreetingCard';
import AdvancedSearch from '../components/common/AdvancedSearch';
import DataExport from '../components/common/DataExport';
import Tuchat from '../components/common/Tuchat';
//import CreateClassForm from '../components/teacher/CreateClassForm';
import ManageStudents from '../components/teacher/ManageStudents';
import TeacherCalendar from '../components/teacher/TeacherCalendar';
import CreateExamResultForm from '../components/teacher/CreateExamResultForm';
import ExamResultsList from '../components/teacher/ExamResultsList';
import CreateAnnouncementForm from '../components/teacher/CreateAnnouncementForm';
import SetStudentCourseDuration from '../components/teacher/SetStudentCourseDuration';
import TeacherNotificationPanel from '../components/teacher/TeacherNotificationPanel';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
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
  const userRole = user?.role || 'teacher';

  // Add error boundary
  const [hasError, setHasError] = useState(false);

  // Add loading state to ensure user is loaded
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
          <h3>Loading...</h3>
          <p>Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>
        <h2>Something went wrong</h2>
        <p>Please refresh the page or try again later.</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  let mainContent: React.ReactNode;
  
  try {
    switch (activeTab) {
      case 'dashboard':
        mainContent = (
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
              <CourseStudentCount onTabChange={onTabChange} />
              <div className="empty-space"></div>
            </div>
            <div className="card-row-2">
              <CreateAnnouncementForm />
              <CreateExamResultForm />
            </div>
            <div className="card-full">
              <SetStudentCourseDuration />
            </div>
            <div className="card-full">
              <ExamResultsList />
            </div>
            <div className="card-full">
              <ManageFeeStatusForm />
            </div>
            <div className="card-full">
              <TeacherCalendar />
            </div>
            <div className="card-full">
              <GrowthCharts />
            </div>
          </div>
        );
        break;
      case 'announcements':
        mainContent = <CreateAnnouncementForm />;
        break;
      case 'classes':
        mainContent = <TeacherCalendar />;
        break;
      case 'messages':
        mainContent = <div style={{color:'#fff'}}>Messages Component (Coming Soon)</div>;
        break;
      case 'exams':
        mainContent = (
          <div>
            <div className="card-full">
              <CreateExamResultForm />
            </div>
            <div className="card-full">
              <ExamResultsList />
            </div>
          </div>
        );
        break;
      case 'student-fees':
        mainContent = <StudentFeeManagement />;
        break;
      case 'fees':
        mainContent = <ManageFeeStatusForm />;
        break;
      case 'students':
        mainContent = <ManageStudents />;
        break;
      case 'course-duration':
        mainContent = <SetStudentCourseDuration />;
        break;
      case 'ask-dave':
        mainContent = <AskDave />;
        break;
      case 'tuchat':
        mainContent = <Tuchat />;
        break;
      case 'settings':
        mainContent = <Settings />;
        break;
      default:
        mainContent = <div style={{color:'#fff'}}>Select a tab from the sidebar.</div>;
    }
  } catch (error) {
    console.error('Error in TeacherDashboard:', error);
    setHasError(true);
    return (
      <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>
        <h2>Something went wrong</h2>
        <p>Please refresh the page or try again later.</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <>
      {mainContent}
      <Footer />
    </>
  );
};

export default TeacherDashboard; 
import React from 'react';
import GreetingCard from '../components/student/GreetingCard';
import Announcements from '../components/student/Announcements';
import StudentCalendar from '../components/student/StudentCalendar';
import ExamResultsChart from '../components/student/ExamResultsChart';
import FeeStatusChart from '../components/student/FeeStatusChart';
import Friends from '../components/student/Friends';
import AskDave from '../components/student/AskDave';
import Settings from '../components/Settings';
import EnhancedStats from '../components/admin/EnhancedStats';
import AdvancedSearch from '../components/common/AdvancedSearch';
import DataExport from '../components/common/DataExport';
import GrowthCharts from '../components/common/GrowthCharts';
import StudentNotificationPanel from '../components/student/StudentNotificationPanel';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import StudentEnrolledCourses from '../components/student/StudentEnrolledCourses';
import StudentTodaysClasses from '../components/student/StudentTodaysClasses';
import StudentTotalCourses from '../components/student/StudentTotalCourses';
import Tuchat from '../components/common/Tuchat';

interface StudentDashboardProps {
  activeTab: string;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ activeTab }) => {
  const { user } = useAuth();
  const userRole = user?.role || 'student';

  let mainContent: React.ReactNode;
  
  switch (activeTab) {
    case 'dashboard':
      mainContent = (
        <div className="dashboard-container">
          <div className="card-full">
            <GreetingCard />
          </div>
          <div className="card-row-3">
            <StudentEnrolledCourses />
            <StudentTodaysClasses />
            <StudentTotalCourses />
          </div>
          <div className="row-2-flat">
            <section className="flat-section">
              <h3>🔍 Advanced Search</h3>
              <AdvancedSearch userRole={userRole} />
            </section>
            <section className="flat-section">
              <h3>📤 Data Export</h3>
              <DataExport userRole={userRole} dataType="personal" />
            </section>
          </div>
          <div className="row-2-flat">
            <section className="flat-section">
              <h3>💰 Fee Status</h3>
              <FeeStatusChart />
            </section>
            <section className="flat-section">
              <h3>📅 Class Calendar</h3>
              <StudentCalendar />
            </section>
          </div>
          <div className="card-full">
            <h3>📊 Exam Results</h3>
            <div className="card-content">
              <ExamResultsChart />
            </div>
          </div>
          <div className="card-full">
            <h3>📈 Growth Analytics</h3>
            <div className="card-content">
              <GrowthCharts />
            </div>
          </div>
        </div>
      );
      break;
    case 'announcements':
      mainContent = <Announcements />;
      break;
    case 'classes':
      mainContent = <StudentCalendar />;
      break;
    case 'friends':
      mainContent = <Friends />;
      break;
    case 'messages':
      mainContent = <div style={{color:'#fff'}}>Messages Component (Coming Soon)</div>;
      break;
    case 'upskill':
      mainContent = <div style={{color:'#fff'}}>Upskill Opportunities (Coming Soon)</div>;
      break;
    case 'refer':
      mainContent = <div style={{color:'#fff'}}>Refer and Earn (Coming Soon)</div>;
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

  return (
    <>
      {mainContent}
      <Footer />
    </>
  );
};

export default StudentDashboard; 
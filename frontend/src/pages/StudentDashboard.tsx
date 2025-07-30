import React from 'react';
import GreetingCard from '../components/student/GreetingCard';
import StudentEnrolledCourses from '../components/student/StudentEnrolledCourses';
import StudentTodaysClasses from '../components/student/StudentTodaysClasses';
import StudentTotalCourses from '../components/student/StudentTotalCourses';
import AdvancedSearch from '../components/common/AdvancedSearch';
import DataExport from '../components/common/DataExport';
import FeeStatusChart from '../components/student/FeeStatusChart';
import StudentCalendar from '../components/student/StudentCalendar';
import ExamResultsChart from '../components/student/ExamResultsChart';
import GrowthCharts from '../components/common/GrowthCharts';
import Tuchat from '../components/common/Tuchat';
import StudentNotificationPanel from '../components/student/StudentNotificationPanel';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

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
              <AdvancedSearch userRole={userRole} />
            </section>
            <DataExport userRole={userRole} dataType="personal" />
          </div>
          
          <div className="row-2-flat">
            <section className="flat-section">
              <FeeStatusChart />
            </section>
            <section className="flat-section">
              <StudentCalendar />
            </section>
          </div>
          
          <div className="card-full">
            <ExamResultsChart />
          </div>
          
          <div className="card-full">
            <GrowthCharts />
          </div>
          
          <div className="card-full">
            <StudentNotificationPanel />
          </div>
        </div>
      );
      break;
    case 'announcements':
      mainContent = <div style={{color:'#fff'}}>Announcements Component (Coming Soon)</div>;
      break;
    case 'classes':
      mainContent = <StudentCalendar />;
      break;
    case 'friends':
      mainContent = <div style={{color:'#fff'}}>Friends Component (Coming Soon)</div>;
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
      mainContent = <div style={{color:'#fff'}}>Ask Dave (Coming Soon)</div>;
      break;
    case 'tuchat':
      mainContent = <Tuchat />;
      break;
    case 'settings':
      mainContent = <div style={{color:'#fff'}}>Settings Component (Coming Soon)</div>;
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
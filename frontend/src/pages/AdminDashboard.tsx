import React from 'react';
import TeachersManagement from '../components/admin/TeachersManagement';
import EnhancedStats from '../components/admin/EnhancedStats';
import AdvancedSearch from '../components/common/AdvancedSearch';
import DataExport from '../components/common/DataExport';
import Tuchat from '../components/common/Tuchat';
import { useAuth } from '../context/AuthContext';

const FeesManagement = () => <div style={{color:'#fff'}}>Fees Management (View/Edit All Students' Fees)</div>;
const ClassesManagement = () => <div style={{color:'#fff'}}>Classes Management (View/Edit All Classes)</div>;

interface AdminDashboardProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const userRole = user?.role || 'admin';

  let mainContent: React.ReactNode;
  switch (activeTab) {
    case 'dashboard':
      mainContent = (
        <div className="dashboard-container">
          <div className="card-full">
            <AdminGreetingCard />
          </div>
          
          <div className="card-row-2">
            <AdminDashboardStats onTabChange={onTabChange} />
          </div>
          
          <div className="card-full">
            <EnhancedStats userRole={userRole} />
          </div>
          
          <div className="card-row-2">
            <div>
              <h3>🔍 Advanced Search</h3>
              <AdvancedSearch userRole={userRole} />
            </div>
            <DataExport userRole={userRole} dataType="students" />
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
      mainContent = <ClassesManagement />;
      break;
    case 'courses':
      mainContent = <CourseManagement />;
      break;
    case 'teachers':
      mainContent = <TeachersManagement />;
      break;
    case 'academic-calendar':
      mainContent = <AcademicCalendarManagement />;
      break;
    case 'academic-fee':
      mainContent = <AcademicFeeManagement />;
      break;
    case 'upskill':
      mainContent = <UpskillManagement />;
      break;
    case 'users':
      mainContent = <StudentsManagement />;
      break;
    case 'fees':
      mainContent = <FeesManagement />;
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

export default AdminDashboard; 
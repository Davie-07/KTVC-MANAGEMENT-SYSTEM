import React from 'react';
import CreateAnnouncementForm from '../components/teacher/CreateAnnouncementForm';
import CreateExamResultForm from '../components/teacher/CreateExamResultForm';
import ExamResultsList from '../components/teacher/ExamResultsList';
import ManageFeeStatusForm from '../components/teacher/ManageFeeStatusForm';
import AskDave from '../components/student/AskDave';
import Settings from '../components/Settings';
import ManageStudents from '../components/teacher/ManageStudents';
import TeacherCalendar from '../components/teacher/TeacherCalendar';
import EnhancedStats from '../components/admin/EnhancedStats';
import AdvancedSearch from '../components/common/AdvancedSearch';
import DataExport from '../components/common/DataExport';
import GrowthCharts from '../components/common/GrowthCharts';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import StudentFeeManagement from '../components/teacher/StudentFeeManagement';
import CourseStudentCount from '../components/teacher/CourseStudentCount';
import TeacherGreetingCard from '../components/teacher/TeacherGreetingCard';
import SetStudentCourseDuration from '../components/teacher/SetStudentCourseDuration';
import Tuchat from '../components/common/Tuchat';

interface TeacherDashboardProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const userRole = user?.role || 'teacher';

  let mainContent: React.ReactNode;
  
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
            <DataExport userRole={userRole} dataType="students" />
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

  return (
    <>
      {mainContent}
      <Footer />
    </>
  );
};

export default TeacherDashboard; 
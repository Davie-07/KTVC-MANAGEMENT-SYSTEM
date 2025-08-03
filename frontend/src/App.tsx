import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Sidebar from './components/Sidebar'

import HomePage from './components/HomePage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import ProtectedRoute from './components/ProtectedRoute';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MenuButton from './components/common/MenuButton';
import CollapsibleSidebar from './components/common/Sidebar';
import { useAuth } from './context/AuthContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Get the appropriate sidebar based on user role
  const getSidebarProps = () => {
    return {
      activeTab,
      onTabChange: (tab: string) => {
        setActiveTab(tab);
        setIsSidebarOpen(false); // Close sidebar when tab is clicked
      }
    };
  };

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Routes>
      {/* Public routes - no header/sidebar */}
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/terms" element={<TermsAndConditionsPage />} />
      
      {/* Protected routes - with header/sidebar layout */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Navigate to={user?.role === 'admin' ? '/admin' : user?.role === 'teacher' ? '/teacher' : '/student'} replace />
        </ProtectedRoute>
      } />
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <div className="app-layout">
            <Header />
            <MenuButton onClick={handleMenuToggle} isVisible={true} />
            <div className="main-section">
              <CollapsibleSidebar isOpen={isSidebarOpen} onClose={handleSidebarClose}>
                <Sidebar {...getSidebarProps()} />
              </CollapsibleSidebar>
              <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <StudentDashboard activeTab={activeTab} />
              </div>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/teacher" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <div className="app-layout">
            <Header />
            <MenuButton onClick={handleMenuToggle} isVisible={true} />
            <div className="main-section">
              <CollapsibleSidebar isOpen={isSidebarOpen} onClose={handleSidebarClose}>
                <Sidebar {...getSidebarProps()} />
              </CollapsibleSidebar>
              <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <TeacherDashboard activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <div className="app-layout">
            <Header />
            <MenuButton onClick={handleMenuToggle} isVisible={true} />
            <div className="main-section">
              <CollapsibleSidebar isOpen={isSidebarOpen} onClose={handleSidebarClose}>
                <Sidebar {...getSidebarProps()} />
              </CollapsibleSidebar>
              <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <AdminDashboard activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

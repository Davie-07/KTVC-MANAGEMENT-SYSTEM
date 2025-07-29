import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { token, user } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If user is logged in but not allowed, redirect to appropriate dashboard
    const roleRoutes = {
      'admin': '/admin',
      'teacher': '/teacher',
      'student': '/student'
    };
    const redirectRoute = roleRoutes[user.role as keyof typeof roleRoutes] || '/login';
    return <Navigate to={redirectRoute} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute; 
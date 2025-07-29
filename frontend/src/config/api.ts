// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
  VALIDATE_TOKEN: `${API_BASE_URL}/api/auth/validate`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  AUTH: `${API_BASE_URL}/api/auth`,
  
  // Users
  TEACHERS: `${API_BASE_URL}/api/auth/teachers`,
  STUDENTS: `${API_BASE_URL}/api/auth/students`,
  UPDATE_TEACHER: `${API_BASE_URL}/api/auth/teacher`,
  UPDATE_STUDENT: `${API_BASE_URL}/api/auth/student`,
  
  // Classes
  CLASSES: `${API_BASE_URL}/api/class`,
  PUBLISH_CLASS: `${API_BASE_URL}/api/class/publish`,
  STUDENT_CLASSES: `${API_BASE_URL}/api/class/student-today`,
  
  // Courses
  COURSES: `${API_BASE_URL}/api/course`,
  PUBLISHED_COURSES: `${API_BASE_URL}/api/course/published`,
  
  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/api/notification`,
  
  // Messages
  MESSAGES: `${API_BASE_URL}/api/messages`,
  
  // Exam Results
  EXAM_RESULTS: `${API_BASE_URL}/api/exam-result`,
  
  // Payments
  PAYMENTS: `${API_BASE_URL}/api/payment`,
  
  // Upskill
  UPSKILL: `${API_BASE_URL}/api/upskill`,
  
  // AskDave
  ASK_DAVE: `${API_BASE_URL}/api/ask-dave`,
  
  // Health Check
  HEALTH: `${API_BASE_URL}/api/health`,
  
  // Announcements
  ANNOUNCEMENTS: `${API_BASE_URL}/api/announcement`,
  
  // Fee Status
  FEE_STATUS: `${API_BASE_URL}/api/fee-status`,
  
  // Academic Calendar
  ACADEMIC_CALENDAR: `${API_BASE_URL}/api/academic-calendar`,
  
  // Academic Fee
  ACADEMIC_FEE: `${API_BASE_URL}/api/academic-fee`,
  
  // Friends
  FRIENDS: `${API_BASE_URL}/api/friends`,
  
  // Student Fee
  STUDENT_FEE: `${API_BASE_URL}/api/student-fee`,
  
  // System
  SYSTEM: `${API_BASE_URL}/api/system`
};

export default API_ENDPOINTS; 
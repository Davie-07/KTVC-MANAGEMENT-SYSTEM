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
  AUTH_TEACHER: `${API_BASE_URL}/api/auth/teacher`,
  AUTH_TEACHER_UPDATE: `${API_BASE_URL}/api/auth/teacher`,
  AUTH_TEACHER_DELETE: `${API_BASE_URL}/api/auth/teacher`,
  STUDENTS_BY_COURSE: `${API_BASE_URL}/api/auth/students/course`,
  AUTH_STUDENT_COURSE_DURATION: `${API_BASE_URL}/api/auth/student`,
  
  // Classes
  CLASSES: `${API_BASE_URL}/api/class`,
  PUBLISH_CLASS: `${API_BASE_URL}/api/class/publish`,
  STUDENT_CLASSES: `${API_BASE_URL}/api/class/student-today`,
  CLASSES_ASSIGN_STUDENTS: `${API_BASE_URL}/api/class/assign-students`,
  
  // Courses
  COURSES: `${API_BASE_URL}/api/course`,
  PUBLISHED_COURSES: `${API_BASE_URL}/api/course/published`,
  
  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/api/notification`,
  MARK_NOTIFICATION_READ: `${API_BASE_URL}/api/notification/read`,
  MARK_ALL_NOTIFICATIONS_READ: `${API_BASE_URL}/api/notification/read-all`,
  DELETE_NOTIFICATION: `${API_BASE_URL}/api/notification`,
  
  // Messages
  MESSAGES: `${API_BASE_URL}/api/messages`,
  MESSAGES_USER: `${API_BASE_URL}/api/messages/user`,
  MESSAGES_READ: `${API_BASE_URL}/api/messages/read`,
  
  // Exam Results
  EXAM_RESULTS: `${API_BASE_URL}/api/exam-result`,
  EXAM_RESULTS_STUDENTS: `${API_BASE_URL}/api/exam-result/students`,
  EXAM_RESULTS_STUDENT: `${API_BASE_URL}/api/exam-result/student`,
  EXAM_RESULTS_HISTORY: `${API_BASE_URL}/api/exam-result/history`,
  
  // Payments
  PAYMENTS: `${API_BASE_URL}/api/payment`,
  PAYMENT_MPESA_INITIATE: `${API_BASE_URL}/api/payment/mpesa/initiate`,
  
  // Upskill
  UPSKILL: `${API_BASE_URL}/api/upskill`,
  UPSKILL_USER: `${API_BASE_URL}/api/upskill/user`,
  UPSKILL_ENROLL: `${API_BASE_URL}/api/upskill/enroll`,
  UPSKILL_SEEN: `${API_BASE_URL}/api/upskill/seen`,
  UPSKILL_TOGGLE: `${API_BASE_URL}/api/upskill/toggle`,
  
  // AskDave
  ASK_DAVE: `${API_BASE_URL}/api/ask-dave`,
  
  // Health Check
  HEALTH: `${API_BASE_URL}/api/health`,
  
  // Announcements
  ANNOUNCEMENTS: `${API_BASE_URL}/api/announcement`,
  
  // Fee Status
  FEE_STATUS: `${API_BASE_URL}/api/fee-status`,
  FEE_STATUS_HISTORY: `${API_BASE_URL}/api/fee-status/history`,
  
  // Academic Calendar
  ACADEMIC_CALENDAR: `${API_BASE_URL}/api/academic-calendar`,
  
  // Academic Fee
  ACADEMIC_FEE: `${API_BASE_URL}/api/academic-fee`,
  
  // Friends
  FRIENDS: `${API_BASE_URL}/api/friends`,
  FRIENDS_ALL: `${API_BASE_URL}/api/friends/all`,
  FRIENDS_REQUESTS: `${API_BASE_URL}/api/friends/requests`,
  FRIENDS_FRIENDS: `${API_BASE_URL}/api/friends/friends`,
  FRIENDS_REQUEST: `${API_BASE_URL}/api/friends/request`,
  FRIENDS_ACCEPT: `${API_BASE_URL}/api/friends/accept`,
  FRIENDS_REJECT: `${API_BASE_URL}/api/friends/reject`,
  
  // Student Fee
  STUDENT_FEE: `${API_BASE_URL}/api/student-fee`,
  
  // System
  SYSTEM: `${API_BASE_URL}/api/system`,
  SYSTEM_STATUS: `${API_BASE_URL}/api/system/status`,
  SYSTEM_SETTINGS: `${API_BASE_URL}/api/system/settings`,
  SYSTEM_BACKUP: `${API_BASE_URL}/api/system/backup`,
  SYSTEM_GROWTH_DATA: `${API_BASE_URL}/api/system/growth-data`,
  
  // Auth Management
  AUTH_BULK_ACTION: `${API_BASE_URL}/api/auth/bulk-action`
};

export default API_ENDPOINTS; 
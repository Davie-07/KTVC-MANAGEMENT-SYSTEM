# 🏫 Kandara Technical and Vocational Training College
## Complete System Architecture & Structure

---

## 📋 **SYSTEM OVERVIEW**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SCHOOL MANAGEMENT SYSTEM                              │
│                    Kandara Technical and Vocational Training College            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 **FRONTEND ARCHITECTURE (React + TypeScript + Vite)**

### **📁 Project Structure**
```
frontend/
├── 📁 src/
│   ├── 📁 assets/                    # Static assets (images, icons)
│   ├── 📁 components/                # Reusable UI components
│   │   ├── 📁 admin/                 # Admin-specific components
│   │   │   ├── AdminDashboardStats.tsx
│   │   │   ├── AdminGreetingCard.tsx
│   │   │   ├── CourseManagement.tsx
│   │   │   ├── EnrollTeacher.tsx
│   │   │   ├── SystemManagement.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── AcademicCalendarManagement.tsx
│   │   │   ├── AcademicFeeManagement.tsx
│   │   │   └── UpskillManagement.tsx
│   │   ├── 📁 student/               # Student-specific components
│   │   │   ├── GreetingCard.tsx
│   │   │   ├── Announcements.tsx
│   │   │   ├── StudentCalendar.tsx
│   │   │   ├── ExamResultsChart.tsx
│   │   │   ├── FeeStatusChart.tsx
│   │   │   ├── Friends.tsx
│   │   │   └── UpskillList.tsx
│   │   ├── 📁 teacher/               # Teacher-specific components
│   │   │   ├── CreateAnnouncementForm.tsx
│   │   │   ├── CreateExamResultForm.tsx
│   │   │   ├── ExamResultsList.tsx
│   │   │   ├── ManageFeeStatusForm.tsx
│   │   │   ├── ManageStudents.tsx
│   │   │   ├── TeacherCalendar.tsx
│   │   │   └── StudentFeeManagement.tsx
│   │   ├── 📁 common/                # Shared components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MenuButton.tsx
│   │   │   ├── AdvancedSearch.tsx
│   │   │   ├── DataExport.tsx
│   │   │   ├── GrowthCharts.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── Settings.tsx
│   │   └── 📁 auth/                  # Authentication components
│   │       ├── LoginForm.tsx
│   │       └── RegisterForm.tsx
│   ├── 📁 pages/                     # Main page components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── VerifyEmailPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── StudentDashboard.tsx
│   │   ├── TeacherDashboard.tsx
│   │   └── HomePage.tsx
│   ├── 📁 context/                   # React Context providers
│   │   └── AuthContext.tsx           # Authentication state management
│   ├── 📁 hooks/                     # Custom React hooks
│   ├── 📁 utils/                     # Utility functions
│   ├── 📁 types/                     # TypeScript type definitions
│   ├── App.tsx                       # Main application component
│   ├── App.css                       # Global styles
│   ├── main.tsx                      # Application entry point
│   └── index.css                     # Base styles
├── 📁 public/                        # Public assets
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite build configuration
└── index.html                        # HTML template
```

### **🔄 Frontend Data Flow**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  React State    │───▶│  API Calls      │
│   (Forms, etc.) │    │   Management    │    │   (Fetch)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Updates    │◀───│  Context API    │◀───│  Backend API    │
│   (Components)  │    │   (AuthContext) │    │   Responses     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## ⚙️ **BACKEND ARCHITECTURE (Node.js + Express + TypeScript)**

### **📁 Project Structure**
```
backend/
├── 📁 src/
│   ├── 📁 routes/                    # API route handlers
│   │   ├── auth.ts                   # Authentication routes
│   │   ├── users.ts                  # User management routes
│   │   ├── courses.ts                # Course management routes
│   │   ├── classes.ts                # Class management routes
│   │   ├── announcements.ts          # Announcement routes
│   │   ├── examResults.ts            # Exam results routes
│   │   ├── fees.ts                   # Fee management routes
│   │   ├── payments.ts               # Payment processing routes
│   │   ├── upskill.ts                # Upskill management routes
│   │   └── calendar.ts               # Academic calendar routes
│   ├── 📁 models/                    # Database models (Mongoose)
│   │   ├── User.ts                   # User model (students, teachers, admins)
│   │   ├── Course.ts                 # Course model
│   │   ├── Class.ts                  # Class model
│   │   ├── Announcement.ts           # Announcement model
│   │   ├── ExamResult.ts             # Exam result model
│   │   ├── Fee.ts                    # Fee model
│   │   ├── Payment.ts                # Payment model
│   │   ├── Upskill.ts                # Upskill model
│   │   └── AcademicCalendar.ts       # Academic calendar model
│   ├── 📁 middleware/                # Express middleware
│   │   ├── auth.ts                   # JWT authentication middleware
│   │   ├── validation.ts             # Input validation middleware
│   │   ├── errorHandler.ts           # Error handling middleware
│   │   └── cors.ts                   # CORS configuration
│   ├── 📁 config/                    # Configuration files
│   │   ├── database.ts               # MongoDB connection
│   │   ├── email.ts                  # Email service configuration
│   │   └── jwt.ts                    # JWT configuration
│   ├── 📁 utils/                     # Utility functions
│   │   ├── emailService.ts           # Email sending utilities
│   │   ├── passwordUtils.ts          # Password hashing utilities
│   │   ├── validationUtils.ts        # Validation helpers
│   │   └── logger.ts                 # Logging utilities
│   ├── 📁 types/                     # TypeScript type definitions
│   │   └── index.ts                  # Shared types
│   ├── index.ts                      # Server entry point
│   └── app.ts                        # Express app configuration
├── 📁 uploads/                       # File uploads directory
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── .env                              # Environment variables
└── nodemon.json                      # Development configuration
```

### **🔄 Backend API Structure**
```
┌─────────────────────────────────────────────────────────────────┐
│                        EXPRESS SERVER                           │
├─────────────────────────────────────────────────────────────────┤
│  📁 Middleware Layer                                             │
│  ├── CORS Configuration                                          │
│  ├── Body Parser                                                 │
│  ├── JWT Authentication                                          │
│  ├── Input Validation                                            │
│  └── Error Handling                                              │
├─────────────────────────────────────────────────────────────────┤
│  📁 Route Layer                                                  │
│  ├── /api/auth/*          # Authentication endpoints            │
│  ├── /api/users/*         # User management endpoints           │
│  ├── /api/courses/*       # Course management endpoints         │
│  ├── /api/classes/*       # Class management endpoints          │
│  ├── /api/announcements/* # Announcement endpoints              │
│  ├── /api/exam-results/*  # Exam result endpoints               │
│  ├── /api/fees/*          # Fee management endpoints            │
│  ├── /api/payments/*      # Payment processing endpoints        │
│  ├── /api/upskill/*       # Upskill management endpoints        │
│  └── /api/calendar/*      # Academic calendar endpoints         │
├─────────────────────────────────────────────────────────────────┤
│  📁 Service Layer                                               │
│  ├── Email Service (Nodemailer)                                 │
│  ├── Payment Processing                                         │
│  ├── File Upload Handling                                       │
│  └── Data Validation & Processing                               │
├─────────────────────────────────────────────────────────────────┤
│  📁 Model Layer (Mongoose)                                      │
│  ├── User Model                                                 │
│  ├── Course Model                                               │
│  ├── Class Model                                                │
│  ├── Announcement Model                                         │
│  ├── ExamResult Model                                           │
│  ├── Fee Model                                                  │
│  ├── Payment Model                                              │
│  ├── Upskill Model                                              │
│  └── AcademicCalendar Model                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ **DATABASE ARCHITECTURE (MongoDB + Mongoose)**

### **📊 Database Schema Structure**
```
┌─────────────────────────────────────────────────────────────────┐
│                        MONGODB DATABASE                         │
├─────────────────────────────────────────────────────────────────┤
│  📁 Collections                                                  │
│  │                                                               │
│  ├── 📄 users                                                    │
│  │   ├── _id: ObjectId                                          │
│  │   ├── firstName: String                                      │
│  │   ├── lastName: String                                       │
│  │   ├── email: String (unique)                                 │
│  │   ├── password: String (hashed)                              │
│  │   ├── role: String (student/teacher/admin)                   │
│  │   ├── teacherId: String (for teachers)                       │
│  │   ├── studentId: String (for students)                       │
│  │   ├── course: String                                         │
│  │   ├── level: Number                                          │
│  │   ├── isEmailVerified: Boolean                               │
│  │   ├── verificationCode: String                               │
│  │   ├── resetPasswordToken: String                             │
│  │   ├── resetPasswordExpires: Date                             │
│  │   ├── createdAt: Date                                        │
│  │   └── updatedAt: Date                                        │
│  │                                                               │
│  ├── 📄 courses                                                  │
│  │   ├── _id: ObjectId                                          │
│  │   ├── name: String                                           │
│  │   ├── description: String                                    │
│  │   ├── duration: String                                       │
│  │   ├── published: Boolean                                     │
│  │   ├── createdAt: Date                                        │
│  │   └── updatedAt: Date                                        │
│  │                                                               │
│  ├── 📄 classes                                                  │
│  │   ├── _id: ObjectId                                          │
│  │   ├── title: String                                          │
│  │   ├── course: String                                         │
│  │   ├── teacher: ObjectId (ref: users)                         │
│  │   ├── students: [ObjectId] (ref: users)                      │
│  │   ├── schedule: String                                       │
│  │   ├── createdAt: Date                                        │
│  │   └── updatedAt: Date                                        │
│  │                                                               │
│  ├── 📄 announcements                                            │
│  │   ├── _id: ObjectId                                          │
│  │   ├── title: String                                          │
│  │   ├── content: String                                        │
│  │   ├── author: ObjectId (ref: users)                          │
│  │   ├── targetAudience: String                                 │
│  │   ├── createdAt: Date                                        │
│  │   └── updatedAt: Date                                        │
│  │                                                               │
│  ├── 📄 examResults                                              │
│  │   ├── _id: ObjectId                                          │
│  │   ├── student: ObjectId (ref: users)                         │
│  │   ├── course: String                                         │
│  │   ├── examType: String                                       │
│  │   ├── score: Number                                          │
│  │   ├── maxScore: Number                                       │
│  │   ├── percentage: Number                                     │
│  │   ├── grade: String                                          │
│  │   ├── date: Date                                             │
│  │   ├── createdBy: ObjectId (ref: users)                       │
│  │   ├── createdAt: Date                                        │
│  │   └── updatedAt: Date                                        │
│  │                                                               │
│  ├── 📄 fees                                                     │
│  │   ├── _id: ObjectId                                          │
│  │   ├── student: ObjectId (ref: users)                         │
│  │   ├── course: String                                         │
│  │   ├── amount: Number                                         │
│  │   ├── dueDate: Date                                          │
│  │   ├── status: String (paid/partial/unpaid)                   │
│  │   ├── paidAmount: Number                                     │
│  │   ├── createdAt: Date                                        │
│  │   └── updatedAt: Date                                        │
│  │                                                               │
│  ├── 📄 payments                                                 │
│  │   ├── _id: ObjectId                                          │
│  │   ├── student: ObjectId (ref: users)                         │
│  │   ├── fee: ObjectId (ref: fees)                              │
│  │   ├── amount: Number                                         │
│  │   ├── paymentMethod: String                                  │
│  │   ├── transactionId: String                                  │
│  │   ├── status: String (pending/completed/failed)              │
│  │   ├── createdAt: Date                                        │
│  │   └── updatedAt: Date                                        │
│  │                                                               │
│  ├── 📄 upskills                                                 │
│  │   ├── _id: ObjectId                                          │
│  │   ├── title: String                                          │
│  │   ├── description: String                                    │
│  │   ├── price: Number                                          │
│  │   ├── duration: String                                       │
│  │   ├── instructor: String                                     │
│  │   ├── category: String                                       │
│  │   ├── isActive: Boolean                                      │
│  │   ├── createdAt: Date                                        │
│  │   └── updatedAt: Date                                        │
│  │                                                               │
│  └── 📄 academicCalendars                                        │
│      ├── _id: ObjectId                                          │
│      ├── title: String                                          │
│      ├── description: String                                    │
│      ├── startDate: Date                                        │
│      ├── endDate: Date                                          │
│      ├── type: String (holiday/exam/event)                      │
│      ├── createdBy: ObjectId (ref: users)                       │
│      ├── createdAt: Date                                        │
│      └── updatedAt: Date                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 **SYSTEM CONNECTIONS & DATA FLOW**

### **🌐 Complete System Architecture**
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  📱 Web Browser (React App)                                                    │
│  ├── User Interface Components                                                 │
│  ├── State Management (Context API)                                           │
│  ├── Routing (React Router)                                                   │
│  └── HTTP Client (Fetch API)                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   NETWORK LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  🌐 Internet/Intranet                                                          │
│  ├── CORS Configuration                                                       │
│  ├── SSL/TLS Encryption                                                       │
│  └── Load Balancing (if applicable)                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼ API Calls
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  SERVER LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│  🖥️ Node.js + Express Server                                                   │
│  ├── API Endpoints (/api/*)                                                   │
│  ├── Middleware (Auth, Validation, CORS)                                      │
│  ├── Business Logic                                                           │
│  ├── Email Service (Nodemailer)                                               │
│  └── File Processing                                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼ Database Queries
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 DATABASE LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  🗄️ MongoDB Database                                                           │
│  ├── Collections (users, courses, classes, etc.)                              │
│  ├── Indexes (for performance)                                                │
│  ├── Data Validation                                                           │
│  └── Backup & Recovery                                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### **🔄 Authentication Flow**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │───▶│  Frontend   │───▶│  Backend    │───▶│  Database   │
│  Login      │    │  (React)    │    │  (Express)  │    │ (MongoDB)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Dashboard  │◀───│  JWT Token  │◀───│  Password   │◀───│  User Data  │
│  Access     │    │  Storage    │    │  Validation │    │  Retrieved  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### **📧 Email Verification Flow**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Register   │───▶│  Generate   │───▶│  Send Email │───▶│  User Email │
│  Form       │    │  Code       │    │  (Nodemailer)│   │  Inbox      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Auto-      │◀───│  Verify     │◀───│  Code       │◀───│  Enter Code │
│  Redirect   │    │  Success    │    │  Validation │    │  (6 digits) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## 🔧 **TECHNOLOGY STACK**

### **Frontend Technologies**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Context API
- **Styling**: CSS3 with custom design system
- **HTTP Client**: Fetch API
- **Form Handling**: Controlled components
- **UI Components**: Custom component library

### **Backend Technologies**
- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer
- **Validation**: Custom validation middleware
- **File Upload**: Multer
- **CORS**: Express CORS middleware

### **Development Tools**
- **Package Manager**: npm
- **TypeScript**: For type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Nodemon**: Development server
- **Git**: Version control

---

## 🚀 **DEPLOYMENT ARCHITECTURE**

### **Development Environment**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Frontend Dev   │    │  Backend Dev    │    │  Local MongoDB  │
│  (localhost:5173)│   │  (localhost:5000)│   │  (localhost:27017)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Production Environment**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Frontend       │    │  Backend API    │    │  MongoDB Atlas  │
│  (Vercel/Netlify)│   │  (Heroku/AWS)   │    │  (Cloud DB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📊 **SYSTEM FEATURES BY ROLE**

### **👨‍🎓 Student Features**
- Dashboard with personal stats
- Course enrollment & management
- Exam results viewing
- Fee status & payments
- Announcements
- Academic calendar
- Upskill opportunities
- Ask Dave (AI assistant)

### **👨‍🏫 Teacher Features**
- Dashboard with class management
- Student management
- Exam result creation
- Fee status management
- Announcement creation
- Class scheduling
- Student progress tracking

### **👨‍💼 Admin Features**
- Complete system management
- User management (students/teachers)
- Course management
- Fee management
- System settings
- Data export & analytics
- Academic calendar management
- Upskill program management

---

## 🔒 **SECURITY FEATURES**

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Email Verification**: Two-step registration process
- **Input Validation**: Server-side validation
- **CORS Protection**: Cross-origin request security
- **Rate Limiting**: API request throttling
- **Error Handling**: Secure error responses
- **Data Encryption**: Sensitive data protection

---

## 📈 **PERFORMANCE OPTIMIZATIONS**

- **Code Splitting**: Lazy loading of components
- **Database Indexing**: Optimized queries
- **Caching**: API response caching
- **Image Optimization**: Compressed assets
- **Bundle Optimization**: Tree shaking
- **CDN Integration**: Static asset delivery
- **Database Connection Pooling**: Efficient DB connections

---

*This architecture provides a scalable, maintainable, and secure foundation for the Kandara Technical and Vocational Training College management system.* 
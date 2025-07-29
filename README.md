# School Management System

A comprehensive MERN stack school management system with real-time features, AI-powered assistance, and modern UI.

## 🚀 Features

### For Teachers
- Create and manage classes
- Publish course materials
- Real-time notifications
- Student progress tracking
- AI-powered teaching assistant (AskDave)
- Payment management

### For Students
- View today's classes
- Access course materials
- Real-time notifications
- Chat with teachers
- Track exam results
- Payment history

### Core Features
- User authentication (JWT)
- Real-time notifications
- File uploads
- Email notifications
- AI-powered assistance
- Payment integration
- Modern responsive UI

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express**
- **TypeScript**
- **MongoDB** with **Mongoose**
- **JWT** authentication
- **Socket.io** for real-time features
- **Nodemailer** for emails
- **Multer** for file uploads

### Frontend
- **React** with **TypeScript**
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io-client** for real-time

## 📁 Project Structure

```
KTVC4/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── render.yaml         # Render deployment config
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context
│   │   ├── pages/          # Page components
│   │   └── config/         # Configuration files
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Git

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/school_management
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
HF_API_TOKEN=your_huggingface_token_here
PORT=5000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 📦 Deployment

### Backend (Render)
1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables
4. Deploy automatically

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Deploy automatically

## 🤖 AI Features

### AskDave - AI Teaching Assistant
- Powered by Hugging Face API
- Helps teachers with lesson planning
- Provides educational resources
- Answers student questions

## 📱 Real-time Features

- Live notifications
- Real-time chat
- Live class updates
- Instant payment confirmations

## 🔐 Security

- JWT authentication
- Password hashing
- Input validation
- CORS protection
- Rate limiting

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support, email support@schoolmanagement.com or create an issue in this repository. 
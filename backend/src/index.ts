import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRouter from './routes/auth';
import classRouter from './routes/class';
import announcementRouter from './routes/announcement';
import examResultRouter from './routes/examResult';
import messagesRouter from './routes/messages';
import upskillRouter from './routes/upskill';
import feeStatusRouter from './routes/feeStatus';
import friendsRouter from './routes/friends';
import askDaveRouter from './routes/askDave';
import courseRouter from './routes/course';
import healthRouter from './routes/health';
import systemRouter from './routes/system';
import academicCalendarRouter from './routes/academicCalendar';
import academicFeeRouter from './routes/academicFee';
import studentFeeRouter from './routes/studentFee';
import paymentRouter from './routes/payment';
import notificationRouter from './routes/notifications';
import { verifyEmailConfig } from './utils/sendEmail';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err: any) => console.error('❌ MongoDB connection error:', err));

// Verify email configuration
verifyEmailConfig()
  .then((isValid) => {
    if (isValid) {
      console.log('📧 Email service is ready');
    } else {
      console.log('⚠️ Email service is not configured properly');
    }
  })
  .catch((error: any) => {
    console.log('⚠️ Email configuration check failed:', error);
  });

// Routes
app.get('/clear-users', async (req, res) => {
  try {
    const User = mongoose.model('User');
    const result = await User.deleteMany({});
    res.json({ message: `Cleared ${result.deletedCount} users from database` });
  } catch (error: any) {
    res.status(500).json({ message: 'Error clearing users', error: error.message });
  }
});

app.get('/clear-test-users', async (req, res) => {
  try {
    const User = mongoose.model('User');
    const result = await User.deleteMany({
      email: { $regex: /test|example|temp|fake/, $options: 'i' }
    });
    res.json({ message: `Cleared ${result.deletedCount} test users from database` });
  } catch (error: any) {
    res.status(500).json({ message: 'Error clearing test users', error: error.message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/class', classRouter);
app.use('/api/announcement', announcementRouter);
app.use('/api/exam-result', examResultRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/upskill', upskillRouter);
app.use('/api/fee-status', feeStatusRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/ask-dave', askDaveRouter);
app.use('/api/course', courseRouter);
app.use('/api/health', healthRouter);
app.use('/api/system', systemRouter);
app.use('/api/academic-calendar', academicCalendarRouter);
app.use('/api/academic-fee', academicFeeRouter);
app.use('/api/student-fee', studentFeeRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/notification', notificationRouter);

// Health check endpoint for Railway
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.send('School Management System API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email User: ${process.env.EMAIL_USER || 'Not configured'}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'Not configured'}`);
}); 
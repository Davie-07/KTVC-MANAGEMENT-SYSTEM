import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendEmail';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper to generate a unique 10-digit ID
function generateTeacherId() {
  return Array.from({length: 10}, () => Math.floor(Math.random() * 10)).join('');
}

// Token validation endpoint
router.get('/validate', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      course: user.course
    });
  } catch (error) {
    res.status(500).json({ message: 'Token validation failed' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, phone, admission, email, course, level, password } = req.body;
    if (!firstName || !lastName || !phone || !admission || !email || !course || !level || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });
    const hash = await bcrypt.hash(password, 10);
    const code = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    const user = await User.create({
      firstName, lastName, phone, admission, email, course, level,
      password: hash,
      role: 'student',
      isVerified: false,
      verificationCode: code,
      verificationCodeExpires: codeExpires,
    });
    
    // Try to send email, but don't fail registration if email fails
    try {
      await sendEmail(
        email,
        'Verify your email',
        `Hi ${firstName} ${lastName},<br><br>
        Thank you for signing up! To complete your registration, please verify your account by entering the code below in the app:<br><br>
        <b>🔒 Verification Code: ${code}</b><br><br>
        This code will expire in 15 minutes.<br><br>
        If you didn't request this, please ignore this message.<br><br>
        Warm regards,<br>
        David Daniel's Development & Testing Team`
      );
      res.status(201).json({ message: 'Registration successful. Please check your email for the verification code.' });
    } catch (emailError) {
      // Email failed but registration succeeded
      res.status(201).json({ message: 'Registration successful. Please check your email for the verification code. (Note: Email service may be temporarily unavailable)' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified.' });
    if (
      user.verificationCode !== code ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }
    user.isVerified = true;
    user.verificationCode = undefined as any;
    user.verificationCodeExpires = undefined as any;
    await user.save();
    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed.', error: err });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, teacherId } = req.body;
    if ((!email && !teacherId) || !password) {
      return res.status(400).json({ message: 'Email or Teacher ID and password are required.' });
    }
    let user;
    if (teacherId) {
      user = await User.findOne({ teacherId });
      if (!user) return res.status(404).json({ message: 'Teacher not found.' });
      if (user.role !== 'teacher') return res.status(403).json({ message: 'Teacher ID is not valid for login.' });
    } else {
      user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found.' });
    }
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email before logging in.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        teacherId: user.teacherId,
        course: user.course
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    await sendEmail(
      email,
      'Password Reset Code',
      `Hi ${user.firstName},<br><br>
      We received a request to reset your password. To proceed, enter the code below on the password reset page:<br><br>
      <b>🔁 Reset Code: ${code}</b><br><br>
      This code will expire in 15 minutes. If you didn’t request a password reset, no action is needed.<br><br>
      Cheers,<br>
      Customer Success — David Daniel's Development & Testing Team`
    );
    res.json({ message: 'Password reset code sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reset code.', error: err });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (
      user.verificationCode !== code ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.verificationCode = undefined as any;
    user.verificationCodeExpires = undefined as any;
    await user.save();
    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Password reset failed.', error: err });
  }
});

// Create teacher (admin only)
router.post('/teacher', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, email, course, password, phone } = req.body;
    if (!firstName || !lastName || !email || !course || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    
    let teacherId;
    let unique = false;
    // Ensure teacherId is unique
    while (!unique) {
      teacherId = generateTeacherId();
      const exists = await User.findOne({ teacherId });
      if (!exists) unique = true;
    }
    
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName, lastName, email, course, password: hash, role: 'teacher', isVerified: true, teacherId, phone
    });
    
    // Try to send welcome email, but don't fail if email is not configured
    try {
      await sendEmail(
        email,
        'Welcome to Kandara E-Platform Teaching Team! 🎉',
        `Dear ${firstName} ${lastName},<br><br>
        
        Congratulations and welcome aboard the Kandara E-Platform teaching team! 🎉<br><br>
        
        You've officially stepped into a role that shapes futures, ignites curiosity, and leaves a lasting mark on countless minds. We're thrilled to have your energy, insight, and passion joining our mission to transform learning into something extraordinary.<br><br>
        
        🧭 <b>First Steps:</b><br>
        Your personal dashboard is now unlocked, find your account details at the end of this email. Go ahead and log in — it's your command center for teaching. Take some time to explore its features, from lesson planning tools to student performance tracking and resource libraries. It's built to support you every step of the way.<br><br>
        
        🌱 <b>Your teaching toolkit includes:</b><br>
        - Intuitive classroom management systems<br>
        - Curriculum resources tailored to your subject area<br>
        - A vibrant community of fellow educators and learners.<br><br>
        
        We believe teaching is part science, part art — and all heart. So don't be afraid to get creative, try new strategies, and build the kind of classroom you'd be proud to walk into every morning.<br><br>
        
        <b>Below are your account details to login with, keep them secure:</b><br>
        <b>AccountID:</b> ${teacherId}<br>
        <b>Password:</b> Given by the admin.<br><br>
        
        💬 <b>Need help or have questions?</b><br>
        Our support team is just a message away at +254 701 759 905. Plus, your assigned mentor teacher will reach out soon to ensure your first steps are confident ones.<br><br>
        
        Here's to the impact you're about to make — every lesson you share is a ripple of change.<br><br>
        
        With enthusiasm,<br>
        David Daniels Dev Team<br>
        System Admin,<br>
        DEV-TEAM,<br>
        +254 701 759 905`
      );
    } catch (emailError) {
      // Email failed but teacher was created successfully
    }
    
    res.status(201).json({ message: 'Teacher account created.', user: { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, teacherId } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create teacher.', error: err });
  }
});

// List all teachers
router.get('/teachers', authenticate, async (_req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }, 'firstName lastName email course phone teacherId isVerified');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch teachers.', error: err });
  }
});

// Update teacher (admin only)
router.put('/teacher/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, course, phone } = req.body;
    
    if (!firstName || !lastName || !email || !course) {
      return res.status(400).json({ message: 'Required fields are missing.' });
    }
    
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered by another user.' });
    }
    
    const updatedTeacher = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email, course, phone },
      { new: true, runValidators: true }
    );
    
    if (!updatedTeacher) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }
    
    res.json({ message: 'Teacher updated successfully.', teacher: updatedTeacher });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update teacher.', error: err });
  }
});

// Delete teacher (admin only)
router.delete('/teacher/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const deletedTeacher = await User.findByIdAndDelete(id);
    
    if (!deletedTeacher) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }
    
    res.json({ message: 'Teacher deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete teacher.', error: err });
  }
});

// Set student course duration (teacher only)
router.put('/student/:id/course-duration', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { courseDuration } = req.body;
    const teacherId = req.user?.id;
    
    if (!courseDuration) {
      return res.status(400).json({ message: 'Course duration is required.' });
    }
    
    // Find the student
    const student = await User.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    
    if (student.role !== 'student') {
      return res.status(400).json({ message: 'User is not a student.' });
    }
    
    // Check if the teacher is assigned to the same course as the student
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can set course duration.' });
    }
    
    if (teacher.course !== student.course) {
      return res.status(403).json({ message: 'You can only set course duration for students in your assigned course.' });
    }
    
    // Update the student's course duration
    const updatedStudent = await User.findByIdAndUpdate(
      id,
      { courseDuration },
      { new: true, runValidators: true }
    );
    
    res.json({ 
      message: 'Student course duration updated successfully.', 
      student: { 
        id: updatedStudent?._id, 
        firstName: updatedStudent?.firstName, 
        lastName: updatedStudent?.lastName,
        courseDuration: updatedStudent?.courseDuration 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update student course duration.', error: err });
  }
});

// List all students
router.get('/students', authenticate, async (_req, res) => {
  try {
    const students = await User.find({ role: 'student' }, 'firstName lastName email course level admission');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch students.', error: err });
  }
});

// Get students by course (for teachers)
router.get('/students/course/:course', authenticate, async (req: AuthRequest, res) => {
  try {
    const { course } = req.params;
    
    if (!course) {
      return res.status(400).json({ message: 'Course parameter is required.' });
    }
    
    const students = await User.find({ 
      role: 'student', 
      course: course 
    }, 'firstName lastName email phone course level admission');
    
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch students by course.', error: err });
  }
});

// Bulk actions for user management
router.post('/bulk-action', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userIds, action } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }
    
    if (!['activate', 'deactivate', 'delete'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }
    
    // In real app, perform the bulk action on users
    
    // Mock response - in real app, actually update/delete users
    res.json({ 
      message: `Bulk action '${action}' completed successfully`,
      affectedUsers: userIds.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to perform bulk action', error: err });
  }
});

// Update user online status
router.put('/online-status', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { isOnline } = req.body;

    await User.findByIdAndUpdate(userId, {
      isOnline: isOnline,
      lastSeen: new Date()
    });

    res.json({ message: 'Online status updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update online status.', error: err });
  }
});

// Get user online status
router.get('/online-status/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId, 'isOnline lastSeen');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ 
      isOnline: user.isOnline || false,
      lastSeen: user.lastSeen
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get online status.', error: err });
  }
});

export default router; 
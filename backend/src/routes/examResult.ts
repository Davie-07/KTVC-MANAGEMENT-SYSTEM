import { Router } from 'express';
import ExamResult from '../models/ExamResult';
import User from '../models/User';
import ExamResultHistory from '../models/ExamResultHistory';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Create an exam result
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { student, unit, cam1, cam2, cam3, average } = req.body;
    const changedBy = req.user?._id; // Get the authenticated user's ID
    
    const result = await ExamResult.create({ student, unit, cam1, cam2, cam3, average });
    await ExamResultHistory.create({ student, unit, cam1, cam2, cam3, average, changedBy, changedAt: new Date() });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating exam result:', err);
    res.status(500).json({ message: 'Failed to create exam result.', error: err.message });
  }
});

// Get all exam results (for admin/teacher list)
router.get('/', authenticate, async (req, res) => {
  try {
    const results = await ExamResult.find().populate('student', 'firstName lastName email');
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch exam results.', error: err });
  }
});

// Get all exam results for a student
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const results = await ExamResult.find({ student: studentId });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch exam results.', error: err });
  }
});

// Update an exam result
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { unit, cam1, cam2, cam3, average } = req.body;
    const changedBy = req.user?._id; // Get the authenticated user's ID
    const updated = await ExamResult.findByIdAndUpdate(id, { unit, cam1, cam2, cam3, average }, { new: true });
    if (updated) {
      await ExamResultHistory.create({ student: updated.student, unit, cam1, cam2, cam3, average, changedBy, changedAt: new Date() });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update exam result.', error: err });
  }
});

// Delete an exam result
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await ExamResult.findByIdAndDelete(id);
    res.json({ message: 'Exam result deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete exam result.', error: err });
  }
});

// Get exam result history for a student
router.get('/history/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const history = await ExamResultHistory.find({ student: studentId }).populate('changedBy', 'firstName lastName email').sort({ changedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch exam result history.', error: err });
  }
});

// Get all students (for dropdown)
router.get('/students', authenticate, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }, '_id firstName lastName email');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch students.', error: err });
  }
});

export default router; 
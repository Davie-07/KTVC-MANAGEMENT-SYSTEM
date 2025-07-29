import { Router } from 'express';
import AcademicCalendar from '../models/AcademicCalendar';
import StudentFee from '../models/StudentFee';
import User from '../models/User';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all academic calendars
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const calendars = await AcademicCalendar.find().sort({ year: -1, semester: 1 });
    res.json(calendars);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching academic calendars', error: error.message });
  }
});

// Create academic calendar (admin only)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { year, semester, startDate, endDate, feeAmount, currency = 'KSH' } = req.body;
    
    if (!year || !semester || !startDate || !endDate || feeAmount === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const calendar = await AcademicCalendar.create({
      year,
      semester,
      startDate,
      endDate,
      feeAmount,
      currency,
    });

    // Create student fee records for all students
    const students = await User.find({ role: 'student' });
    const studentFees = students.map(student => ({
      student: student._id,
      academicYear: year,
      semester,
      course: student.course,
      totalFee: feeAmount,
      remainingAmount: feeAmount,
      dueDate: endDate,
    }));

    if (studentFees.length > 0) {
      await StudentFee.insertMany(studentFees);
    }

    res.status(201).json(calendar);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Academic calendar for this year and semester already exists' });
    } else {
      res.status(500).json({ message: 'Error creating academic calendar', error: error.message });
    }
  }
});

// Update academic calendar (admin only)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { year, semester, startDate, endDate, feeAmount, currency, isActive } = req.body;
    
    const calendar = await AcademicCalendar.findByIdAndUpdate(
      req.params.id,
      {
        year,
        semester,
        startDate,
        endDate,
        feeAmount,
        currency,
        isActive,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!calendar) {
      return res.status(404).json({ message: 'Academic calendar not found' });
    }

    res.json(calendar);
  } catch (error) {
    res.status(500).json({ message: 'Error updating academic calendar', error: error.message });
  }
});

// Delete academic calendar (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const calendar = await AcademicCalendar.findByIdAndDelete(req.params.id);
    
    if (!calendar) {
      return res.status(404).json({ message: 'Academic calendar not found' });
    }

    // Also delete related student fees
    await StudentFee.deleteMany({
      academicYear: calendar.year,
      semester: calendar.semester,
    });

    res.json({ message: 'Academic calendar deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting academic calendar', error: error.message });
  }
});

// Get current active academic calendar
router.get('/current', authenticate, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const calendar = await AcademicCalendar.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true,
    });
    
    res.json(calendar);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching current academic calendar', error: error.message });
  }
});

export default router; 
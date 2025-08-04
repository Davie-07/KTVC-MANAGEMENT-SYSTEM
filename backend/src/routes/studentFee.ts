import { Router } from 'express';
import StudentFee from '../models/StudentFee';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get student fees (for teachers - their course students, for students - their own fees)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    let fees;
    
    if (req.user?.role === 'teacher') {
      // Teachers see fees for students in their course
      const students = await User.find({ role: 'student', course: req.user.course });
      const studentIds = students.map(s => s._id);
      fees = await StudentFee.find({ student: { $in: studentIds } })
        .populate('student', 'firstName lastName email course')
        .sort({ academicYear: -1, semester: 1 });
    } else if (req.user?.role === 'student') {
      // Students see only their own fees
      fees = await StudentFee.find({ student: req.user.id })
        .populate('student', 'firstName lastName email course')
        .sort({ academicYear: -1, semester: 1 });
    } else if (req.user?.role === 'admin') {
      // Admins see all fees
      fees = await StudentFee.find()
        .populate('student', 'firstName lastName email course')
        .sort({ academicYear: -1, semester: 1 });
    }

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student fees', error: error.message });
  }
});

// Get specific student fee
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const fee = await StudentFee.findById(req.params.id)
      .populate('student', 'firstName lastName email course');
    
    if (!fee) {
      return res.status(404).json({ message: 'Student fee not found' });
    }

    // Check permissions
    if (req.user?.role === 'student' && fee.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user?.role === 'teacher' && fee.course !== req.user.course) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student fee', error: error.message });
  }
});

// Update student fee payment (teachers and admins only)
router.put('/:id/payment', authenticate, async (req: AuthRequest, res) => {
  try {
    const { paidAmount, paidBy } = req.body;
    
    if (!paidAmount || !paidBy) {
      return res.status(400).json({ message: 'Paid amount and paid by are required' });
    }

    const fee = await StudentFee.findById(req.params.id);
    
    if (!fee) {
      return res.status(404).json({ message: 'Student fee not found' });
    }

    // Check permissions
    if (req.user?.role === 'teacher' && fee.course !== req.user.course) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user?.role === 'student') {
      return res.status(403).json({ message: 'Students cannot update fee payments' });
    }

    // Update payment
    const newPaidAmount = fee.paidAmount + paidAmount;
    const newRemainingAmount = fee.totalFee - newPaidAmount;
    const isPaid = newRemainingAmount <= 0;

    fee.paidAmount = newPaidAmount;
    fee.remainingAmount = newRemainingAmount;
    fee.isPaid = isPaid;
    fee.paymentHistory.push({
      amount: paidAmount,
      paidBy: paidBy,
      date: new Date(),
    });
    fee.updatedAt = new Date();

    await fee.save();

    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Error updating student fee payment', error: error.message });
  }
});

// Get students for teacher's course (for dropdown)
router.get('/students/course/:course', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const students = await User.find({ 
      role: 'student', 
      course: req.params.course 
    }, 'firstName lastName email admission');

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

// Get fee summary for dashboard
router.get('/summary/:studentId', authenticate, async (req: AuthRequest, res) => {
  try {
    const fees = await StudentFee.find({ student: req.params.studentId })
      .sort({ academicYear: -1, semester: 1 });

    const summary = {
      totalFees: fees.reduce((sum, fee) => sum + fee.totalFee, 0),
      totalPaid: fees.reduce((sum, fee) => sum + fee.paidAmount, 0),
      totalRemaining: fees.reduce((sum, fee) => sum + fee.remainingAmount, 0),
      overdueFees: fees.filter(fee => !fee.isPaid && fee.dueDate < new Date()),
      currentFees: fees.filter(fee => !fee.isPaid && fee.dueDate >= new Date()),
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fee summary', error: error.message });
  }
});

export default router; 
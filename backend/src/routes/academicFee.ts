import { Router } from 'express';
import AcademicFee from '../models/AcademicFee';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all academic fees
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const fees = await AcademicFee.find().sort({ course: 1 });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching academic fees', error: error.message });
  }
});

// Create academic fee (admin only)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { course, feeAmount, currency = 'KSH' } = req.body;
    
    if (!course || feeAmount === undefined) {
      return res.status(400).json({ message: 'Course and fee amount are required' });
    }

    const fee = await AcademicFee.create({
      course,
      feeAmount,
      currency,
    });

    res.status(201).json(fee);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Academic fee for this course already exists' });
    } else {
      res.status(500).json({ message: 'Error creating academic fee', error: error.message });
    }
  }
});

// Update academic fee (admin only)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { course, feeAmount, currency, isActive } = req.body;
    
    const fee = await AcademicFee.findByIdAndUpdate(
      req.params.id,
      {
        course,
        feeAmount,
        currency,
        isActive,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!fee) {
      return res.status(404).json({ message: 'Academic fee not found' });
    }

    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Error updating academic fee', error: error.message });
  }
});

// Delete academic fee (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const fee = await AcademicFee.findByIdAndDelete(req.params.id);
    
    if (!fee) {
      return res.status(404).json({ message: 'Academic fee not found' });
    }

    res.json({ message: 'Academic fee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting academic fee', error: error.message });
  }
});

// Get fee by course
router.get('/course/:course', authenticate, async (req: AuthRequest, res) => {
  try {
    const fee = await AcademicFee.findOne({ course: req.params.course, isActive: true });
    
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found for this course' });
    }

    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course fee', error: error.message });
  }
});

export default router; 
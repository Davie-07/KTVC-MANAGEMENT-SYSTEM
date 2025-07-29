import { Router } from 'express';
import FeeStatus from '../models/FeeStatus';
import FeeStatusHistory from '../models/FeeStatusHistory';

const router = Router();

// Create or update fee status
router.post('/', async (req, res) => {
  try {
    const { student, paid, due, changedBy } = req.body;
    const feeStatus = await FeeStatus.findOneAndUpdate(
      { student },
      { paid, due, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    await FeeStatusHistory.create({ student, paid, due, changedBy, changedAt: new Date() });
    res.status(201).json(feeStatus);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update fee status.', error: err });
  }
});

// Get fee status for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const feeStatus = await FeeStatus.findOne({ student: studentId });
    res.json(feeStatus);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fee status.', error: err });
  }
});

// Get fee status history for a student
router.get('/history/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const history = await FeeStatusHistory.find({ student: studentId }).populate('changedBy', 'firstName lastName email').sort({ changedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fee status history.', error: err });
  }
});

export default router; 
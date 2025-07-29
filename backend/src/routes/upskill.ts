import { Router } from 'express';
import Upskill from '../models/Upskill';
import User from '../models/User';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Create an upskill (admin only)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { title, description, price = 0, currency = 'KSH' } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const users = await User.find({ role: 'student' }, '_id');
    const notifiedUsers = users.map(u => u._id.toString());
    
    const upskill = await Upskill.create({ 
      title, 
      description, 
      price, 
      currency, 
      notifiedUsers,
      isActive: true 
    });
    
    res.status(201).json(upskill);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create upskill.', error: err });
  }
});

// Get all upskills (admin only)
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const upskills = await Upskill.find().sort({ createdAt: -1 });
    res.json(upskills);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch upskills.', error: err });
  }
});

// Update an upskill (admin only)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, currency, isActive } = req.body;
    
    const upskill = await Upskill.findByIdAndUpdate(
      id,
      { title, description, price, currency, isActive, updatedAt: new Date() },
      { new: true }
    );
    
    if (!upskill) {
      return res.status(404).json({ message: 'Upskill not found' });
    }
    
    res.json(upskill);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update upskill.', error: err });
  }
});

// Delete an upskill (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const upskill = await Upskill.findByIdAndDelete(id);
    
    if (!upskill) {
      return res.status(404).json({ message: 'Upskill not found' });
    }
    
    res.json({ message: 'Upskill deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete upskill.', error: err });
  }
});

// Toggle upskill active status (admin only)
router.patch('/:id/toggle', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const upskill = await Upskill.findByIdAndUpdate(
      id,
      { isActive, updatedAt: new Date() },
      { new: true }
    );
    
    if (!upskill) {
      return res.status(404).json({ message: 'Upskill not found' });
    }
    
    res.json(upskill);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update upskill status.', error: err });
  }
});

// Get all active upskills for a user
router.get('/user/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const upskills = await Upskill.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(upskills);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch upskills.', error: err });
  }
});

// Enroll in an upskill
router.post('/enroll', authenticate, async (req: AuthRequest, res) => {
  try {
    const { upskillId, userId, amount, currency } = req.body;
    
    if (!upskillId || !userId) {
      return res.status(400).json({ message: 'Upskill ID and user ID are required' });
    }

    const upskill = await Upskill.findById(upskillId);
    if (!upskill) {
      return res.status(404).json({ message: 'Upskill not found' });
    }

    if (!upskill.isActive) {
      return res.status(400).json({ message: 'This upskill is not available for enrollment' });
    }

    // If it's a free upskill, enroll directly
    if (upskill.price === 0) {
      // Here you would typically create an enrollment record
      res.json({ 
        success: true, 
        message: 'Enrollment successful',
        upskill: upskill 
      });
    } else {
      // For paid upskills, return payment URL
      res.json({ 
        success: true, 
        message: 'Payment required for enrollment',
        paymentUrl: `/api/payment/mpesa/initiate`,
        upskill: upskill 
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to enroll in upskill.', error: err });
  }
});

// Mark an upskill as seen
router.patch('/:id/seen', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const updated = await Upskill.findByIdAndUpdate(
      id, 
      { $pull: { notifiedUsers: userId } }, 
      { new: true }
    );
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark upskill as seen.', error: err });
  }
});

export default router; 
import { Router } from 'express';
import Announcement from '../models/Announcement';
import User from '../models/User';

const router = Router();

// Create an announcement
router.post('/', async (req, res) => {
  try {
    const { title, message, createdBy, target } = req.body;
    let notifiedUsers: string[] = [];
    if (target === 'student' || target === 'all') {
      const students = await User.find({ role: 'student' }, '_id');
      notifiedUsers.push(...students.map(s => s._id.toString()));
    }
    if (target === 'teacher' || target === 'all') {
      const teachers = await User.find({ role: 'teacher' }, '_id');
      notifiedUsers.push(...teachers.map(t => t._id.toString()));
    }
    const announcement = await Announcement.create({
      title,
      message,
      createdBy,
      target,
      published: true,
      notifiedUsers,
    });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create announcement.', error: err });
  }
});

// Get all published announcements for students
router.get('/student', async (req, res) => {
  try {
    const announcements = await Announcement.find({
      published: true,
      target: { $in: ['student', 'all'] },
    }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch announcements.', error: err });
  }
});

// User marks an announcement as seen
router.patch('/:id/seen', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const updated = await Announcement.findByIdAndUpdate(id, { $pull: { notifiedUsers: userId } }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark announcement as seen.', error: err });
  }
});

export default router; 
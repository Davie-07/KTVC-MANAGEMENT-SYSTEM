import * as express from 'express';
import { authenticate } from '../middleware/auth';
import Notification from '../models/Notification';

const router = express.Router();

// Get notifications for a teacher
router.get('/teacher/:teacherId', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipient: req.params.teacherId 
    }).sort({ timestamp: -1 }).limit(50);
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching teacher notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Get notifications for a student
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipient: req.params.studentId 
    }).sort({ timestamp: -1 }).limit(50);
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching student notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read for a teacher
router.patch('/teacher/:teacherId/read-all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.params.teacherId, read: false },
      { read: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
});

// Mark all notifications as read for a student
router.patch('/student/:studentId/read-all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.params.studentId, read: false },
      { read: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
});

// Create a new notification
router.post('/', authenticate, async (req, res) => {
  try {
    const { recipient, type, message, relatedId, relatedModel } = req.body;
    
    const notification = new Notification({
      recipient,
      type,
      message,
      relatedId,
      relatedModel
    });
    
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

export default router; 
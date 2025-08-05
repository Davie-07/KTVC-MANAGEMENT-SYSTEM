import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import User from '../models/User';
import Course from '../models/Course';
import Class from '../models/Class';

const router = Router();

// System status endpoint
router.get('/status', authenticate, requireAdmin, async (req, res) => {
  try {
    // Mock system status - in real app, get actual system metrics
    const systemStatus = {
      database: 'online',
      lastBackup: new Date().toISOString(),
      backupSize: '2.5 GB',
      diskUsage: 65,
      memoryUsage: 45,
      uptime: '5 days, 12 hours'
    };
    
    res.json(systemStatus);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch system status' });
  }
});

// Growth data endpoint - now uses real data
router.get('/growth-data', authenticate, async (req, res) => {
  try {
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Generate growth data for the last 6 months
    const growthData = [];
    
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const monthName = targetDate.toLocaleString('default', { month: 'short' });
      
      // Calculate data for this month
      const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
      
      // Count students created in this month
      const studentsCount = await User.countDocuments({
        role: 'student',
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      // Count teachers created in this month
      const teachersCount = await User.countDocuments({
        role: 'teacher',
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      // Count courses created in this month
      const coursesCount = await Course.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      // Count classes created in this month
      const classesCount = await Class.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      growthData.push({
        month: monthName,
        students: studentsCount,
        teachers: teachersCount,
        courses: coursesCount,
        classes: classesCount
      });
    }
    
    res.json(growthData);
  } catch (error) {
    console.error('Error in growth-data endpoint:', error);
    res.status(500).json({ message: 'Failed to fetch growth data' });
  }
});

// System settings endpoint
router.get('/settings', authenticate, requireAdmin, async (req, res) => {
  try {
    // Mock system settings - in real app, get from database
    const systemSettings = {
      emailEnabled: true,
      jwtExpiry: 7,
      maxFileSize: 10,
      autoBackup: true,
      backupFrequency: 'daily'
    };
    
    res.json(systemSettings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch system settings' });
  }
});

// Update system settings
router.put('/settings', authenticate, requireAdmin, async (req, res) => {
  try {
    const { emailEnabled, jwtExpiry, maxFileSize, autoBackup, backupFrequency } = req.body;
    
    // In real app, save to database
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update system settings' });
  }
});

// Trigger manual backup
router.post('/backup', authenticate, requireAdmin, async (req, res) => {
  try {
    // In real app, trigger actual backup process
    
    res.json({ message: 'Backup initiated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to trigger backup' });
  }
});

export default router; 
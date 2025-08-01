import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';

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

// Growth data endpoint
router.get('/growth-data', authenticate, async (req, res) => {
  try {
    // Mock growth data - in real app, calculate from actual data
    const growthData = {
      studentGrowth: [
        { month: 'Jan', count: 120 },
        { month: 'Feb', count: 135 },
        { month: 'Mar', count: 142 },
        { month: 'Apr', count: 158 },
        { month: 'May', count: 165 },
        { month: 'Jun', count: 172 }
      ],
      courseEnrollment: [
        { course: 'ICT', count: 45 },
        { course: 'Engineering', count: 38 },
        { course: 'Business', count: 32 },
        { course: 'Science', count: 28 }
      ],
      performanceMetrics: {
        averageScore: 78.5,
        passRate: 92.3,
        attendanceRate: 88.7
      }
    };
    
    res.json(growthData);
  } catch (error) {
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
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
import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    // Basic health check - you can add more sophisticated checks here
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 
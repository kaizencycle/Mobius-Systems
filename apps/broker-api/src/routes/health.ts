import { Router } from 'express';
import { healthMonitor } from '../monitoring/health';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'operational',
    sentinels: healthMonitor.getAll(),
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

export default router;

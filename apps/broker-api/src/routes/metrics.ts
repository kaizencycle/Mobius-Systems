import { Router } from 'express';
import { healthMonitor } from '../monitoring/health';

const router = Router();

router.get('/', (req, res) => {
  const sentinels = healthMonitor.getAll();

  let output = '';
  sentinels.forEach(s => {
    output += `# HELP sentinel_success_rate Success rate for ${s.name}\n`;
    output += `# TYPE sentinel_success_rate gauge\n`;
    output += `sentinel_success_rate{sentinel="${s.name}"} ${s.successRate}\n`;

    output += `# HELP sentinel_response_time Average response time for ${s.name}\n`;
    output += `# TYPE sentinel_response_time gauge\n`;
    output += `sentinel_response_time{sentinel="${s.name}"} ${s.avgResponseTime}\n`;

    output += `# HELP sentinel_total_requests Total requests for ${s.name}\n`;
    output += `# TYPE sentinel_total_requests counter\n`;
    output += `sentinel_total_requests{sentinel="${s.name}"} ${s.total}\n`;

    output += `# HELP sentinel_failed_requests Failed requests for ${s.name}\n`;
    output += `# TYPE sentinel_failed_requests counter\n`;
    output += `sentinel_failed_requests{sentinel="${s.name}"} ${s.failed}\n`;
  });

  res.set('Content-Type', 'text/plain');
  res.send(output);
});

export default router;

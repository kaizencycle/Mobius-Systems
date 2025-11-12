interface SentinelHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  lastSeen: Date;
  avgResponseTime: number;
  successRate: number;
  total: number;
  failed: number;
}

class HealthMonitor {
  private health = new Map<string, SentinelHealth>();

  record(sentinel: string, success: boolean, responseTime: number) {
    const h = this.health.get(sentinel) || {
      name: sentinel,
      status: 'healthy' as const,
      lastSeen: new Date(),
      avgResponseTime: 0,
      successRate: 1,
      total: 0,
      failed: 0
    };

    h.lastSeen = new Date();
    h.avgResponseTime = (h.avgResponseTime * 0.9) + (responseTime * 0.1);
    h.total++;
    if (!success) h.failed++;
    h.successRate = (h.total - h.failed) / h.total;
    h.status = h.successRate < 0.5 ? 'down' : h.successRate < 0.8 ? 'degraded' : 'healthy';

    this.health.set(sentinel, h);
  }

  get(sentinel: string) {
    return this.health.get(sentinel);
  }

  getAll() {
    return Array.from(this.health.values());
  }
}

export const healthMonitor = new HealthMonitor();

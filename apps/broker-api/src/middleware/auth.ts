import { rateLimit } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

export function authenticateAPIKey(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-api-key'] as string;
  if (!key) {
    return res.status(401).json({ error: 'API key required' });
  }

  const validKeys = process.env.VALID_API_KEYS?.split(',') || [];
  if (!validKeys.includes(key)) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next();
}

export const deliberationRateLimit = rateLimit({
  windowMs: 60_000,
  max: 10,
  message: 'Rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.headers['x-api-key'] as string) || req.ip || 'unknown'
});

import type { Request, Response } from "express";

/**
 * Fetch GI from aggregator (with fallback to config)
 */
async function fetchGI(): Promise<number> {
  const aggregatorUrl = process.env.GI_AGGREGATOR_URL;
  
  if (aggregatorUrl) {
    try {
      const response = await fetch(`${aggregatorUrl}/gi`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000), // 5s timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        if (typeof data.gi === 'number' && data.gi >= 0 && data.gi <= 1) {
          return data.gi;
        }
      }
    } catch (error) {
      console.warn(`GI aggregator unavailable: ${error}`);
      // Fall through to config default
    }
  }
  
  // Fallback: use config default
  // In production, this should be replaced with a real calculation
  // Formula: GI = 0.25*M + 0.20*H + 0.30*I + 0.25*E
  return parseFloat(process.env.GI_DEFAULT || "0.999");
}

/**
 * GET /gi
 * Returns current Global Integrity (GI) score
 */
export async function giStatus(_req: Request, res: Response) {
  try {
    const gi = await fetchGI();
    const thresholdWarn = parseFloat(process.env.GI_FLOOR_WARN || "0.950");
    const thresholdHalt = parseFloat(process.env.GI_FLOOR_HALT || "0.900");
    
    res.json({ 
      gi, 
      updated_at: new Date().toISOString(),
      threshold_warn: thresholdWarn,
      threshold_halt: thresholdHalt,
      status: gi >= thresholdWarn ? "healthy" : gi >= thresholdHalt ? "warning" : "critical"
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch GI",
      message: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}

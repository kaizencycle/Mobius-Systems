export function gradeResponse(response: string): number {
  // Simple MII grading based on response quality
  // Real implementation would use more sophisticated analysis

  let score = 0.5; // Base score

  // Length check (reasonable responses are 50-500 chars)
  if (response.length > 50 && response.length < 500) {
    score += 0.1;
  }

  // Contains reasoning indicators
  if (/because|therefore|thus|reasoning|analysis/i.test(response)) {
    score += 0.1;
  }

  // Contains ethical considerations
  if (/ethic|moral|fair|just|right|integrity/i.test(response)) {
    score += 0.1;
  }

  // Contains specific recommendations
  if (/recommend|suggest|should|propose|advise/i.test(response)) {
    score += 0.1;
  }

  // Cites principles or frameworks
  if (/principle|framework|standard|guideline/i.test(response)) {
    score += 0.1;
  }

  // Cap at 0.95 (perfect 1.0 is reserved for formal verification)
  return Math.min(score, 0.95);
}

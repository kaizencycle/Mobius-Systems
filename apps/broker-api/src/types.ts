export interface DeliberationRequest {
  prompt: string;
  context?: Record<string, any>;
  requiredSentinels: string[];
  consensusThreshold?: number;
  maxRounds?: number;
  webhookUrl?: string;
}

export interface DeliberationResult {
  id: string;
  consensus: {
    achieved: boolean;
    confidence: number;
  };
  miiScore: number;
  responses?: Array<{
    sentinel: string;
    miiScore: number;
  }>;
  attestation: {
    signature: string;
    publicKey: string;
  };
  duration: number;
}

export interface SentinelResponse {
  sentinel: string;
  response: string;
  miiScore: number;
  vote?: 'approve' | 'reject' | 'abstain';
}

export interface Attestation {
  signature: string;
  publicKey: string;
  message: string;
}

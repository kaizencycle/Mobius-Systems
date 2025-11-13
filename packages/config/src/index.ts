import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Civic / Ledger
  CIVIC_LEDGER_API: z.string().url().default('https://civic-protocol-core-ledger.onrender.com'),
  CIVIC_LEDGER_TOKEN: z.string().optional(),

  // OAA / Agents
  OAA_API_BASE: z.string().url().optional(),
  REFLECTIONS_API_BASE: z.string().url().optional(),
  SHIELD_API_BASE: z.string().url().optional(),

  // Telemetry
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);


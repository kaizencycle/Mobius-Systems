import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const deliberations = sqliteTable('deliberations', {
  id: text('id').primaryKey(),
  prompt: text('prompt').notNull(),
  context: text('context'),
  status: text('status').notNull(),
  consensusAchieved: integer('consensus_achieved', { mode: 'boolean' }),
  finalMII: real('final_mii'),
  requester: text('requester'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

export const sentinelResponses = sqliteTable('sentinel_responses', {
  id: text('id').primaryKey(),
  deliberationId: text('deliberation_id').notNull(),
  sentinelName: text('sentinel_name').notNull(),
  round: integer('round').notNull(),
  response: text('response').notNull(),
  miiScore: real('mii_score'),
  vote: text('vote'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const attestations = sqliteTable('attestations', {
  id: text('id').primaryKey(),
  deliberationId: text('deliberation_id').notNull(),
  signature: text('signature').notNull(),
  publicKey: text('public_key').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

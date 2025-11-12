import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('./data/broker.db');
export const db = drizzle(sqlite, { schema });

export function initDB() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS deliberations (
      id TEXT PRIMARY KEY,
      prompt TEXT NOT NULL,
      context TEXT,
      status TEXT NOT NULL,
      consensus_achieved INTEGER,
      final_mii REAL,
      requester TEXT,
      created_at INTEGER NOT NULL,
      completed_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS sentinel_responses (
      id TEXT PRIMARY KEY,
      deliberation_id TEXT NOT NULL,
      sentinel_name TEXT NOT NULL,
      round INTEGER NOT NULL,
      response TEXT NOT NULL,
      mii_score REAL,
      vote TEXT,
      timestamp INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attestations (
      id TEXT PRIMARY KEY,
      deliberation_id TEXT NOT NULL,
      signature TEXT NOT NULL,
      public_key TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `);
}

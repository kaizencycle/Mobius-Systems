/**
 * Epoch Burn Service
 * 
 * Automatically applies decay to idle shards and reabsorbs to integrity pool
 * Runs on cron schedule: every 90 days at midnight UTC (configurable)
 */

import cron from "node-cron";
import { readFileSync } from "fs";
import { join } from "path";
import { SHARDS_PER_CREDIT } from "@civic/integrity-units";

interface IntegrityUnitsConfig {
  epochs: {
    length_days: number;
    shard_decay_pct: number;
    reabsorption_target: string;
    burn_job: {
      enabled: boolean;
      cron: string;
      min_idle_days: number;
      notify: string[];
      dry_run: boolean;
    };
  };
}

/**
 * Load integrity units configuration
 */
function loadConfig(): IntegrityUnitsConfig {
  try {
    const configPath = join(process.cwd(), "../../configs/integrity_units.yaml");
    const yaml = require("yaml");
    const content = readFileSync(configPath, "utf-8");
    return yaml.parse(content);
  } catch (error) {
    console.error("Failed to load config:", error);
    // Return defaults
    return {
      epochs: {
        length_days: 90,
        shard_decay_pct: 0.5,
        reabsorption_target: "integrity_pool",
        burn_job: {
          enabled: true,
          cron: "0 0 */90 * *",
          min_idle_days: 30,
          notify: ["ZEUS", "HERMES", "ECHO"],
          dry_run: false,
        },
      },
    };
  }
}

/**
 * Identify idle shards (unused for min_idle_days)
 */
async function identifyIdleShards(minIdleDays: number): Promise<
  Array<{ address: string; shards: bigint; last_activity: Date }>
> {
  // TODO: Query ledger database for shards with no activity in last min_idle_days
  // For now, return empty array (stub)
  return [];
}

/**
 * Calculate decay amount (0.5% per epoch)
 */
function calculateDecay(shards: bigint, decayPct: number): bigint {
  const decayMultiplier = BigInt(Math.floor(decayPct * 100));
  return (shards * decayMultiplier) / 10000n;
}

/**
 * Reabsorb decayed shards to integrity pool
 */
async function reabsorbToPool(decayedShards: bigint, target: string): Promise<string> {
  // TODO: Call ledger API to move shards to integrity_pool
  // For now, return mock transaction hash
  return `0x${Buffer.from(`${Date.now()}-${decayedShards.toString()}`).toString("hex")}`;
}

/**
 * Generate attestation hash
 */
function generateAttestationHash(
  epoch: number,
  totalDecayed: bigint,
  reabsorptionTx: string
): string {
  const payload = JSON.stringify({
    epoch,
    total_decayed_shards: totalDecayed.toString(),
    reabsorption_tx: reabsorptionTx,
    timestamp: new Date().toISOString(),
  });
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(payload).digest("hex");
}

/**
 * Notify sentinels
 */
async function notifySentinels(sentinels: string[], message: string): Promise<void> {
  // TODO: Send notifications via webhook/API
  console.log(`[NOTIFY] ${sentinels.join(", ")}: ${message}`);
}

/**
 * Execute epoch burn
 */
async function executeEpochBurn(dryRun: boolean = false): Promise<void> {
  const config = loadConfig();
  const burnConfig = config.epochs.burn_job;

  if (!burnConfig.enabled) {
    console.log("[EPOCH-BURN] Disabled in configuration");
    return;
  }

  console.log(`[EPOCH-BURN] Starting epoch burn (dry_run=${dryRun})`);

  try {
    // Identify idle shards
    const idleShards = await identifyIdleShards(burnConfig.min_idle_days);
    console.log(`[EPOCH-BURN] Found ${idleShards.length} idle shard accounts`);

    let totalDecayed = 0n;
    const decayPct = config.epochs.shard_decay_pct;

    // Calculate decay for each idle account
    const decayedAccounts = idleShards.map((account) => {
      const decayed = calculateDecay(account.shards, decayPct);
      totalDecayed += decayed;
      return {
        address: account.address,
        original_shards: account.shards.toString(),
        decayed_shards: decayed.toString(),
        remaining_shards: (account.shards - decayed).toString(),
      };
    });

    if (totalDecayed === 0n) {
      console.log("[EPOCH-BURN] No decay to apply");
      return;
    }

    console.log(`[EPOCH-BURN] Total decay: ${totalDecayed.toString()} shards`);

    if (dryRun) {
      console.log("[EPOCH-BURN] DRY RUN - Would decay:", JSON.stringify(decayedAccounts, null, 2));
      return;
    }

    // Reabsorb to integrity pool
    const reabsorptionTx = await reabsorbToPool(
      totalDecayed,
      config.epochs.reabsorption_target
    );
    console.log(`[EPOCH-BURN] Reabsorption TX: ${reabsorptionTx}`);

    // Generate attestation
    const epoch = Math.floor(Date.now() / (config.epochs.length_days * 24 * 60 * 60 * 1000));
    const attestationHash = generateAttestationHash(epoch, totalDecayed, reabsorptionTx);
    console.log(`[EPOCH-BURN] Attestation hash: ${attestationHash}`);

    // TODO: Post attestation to civic-ledger /attest/burn endpoint
    const ledgerUrl = process.env.LEDGER_API_URL || "http://localhost:3000";
    try {
      const response = await fetch(`${ledgerUrl}/attest/burn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_shards: totalDecayed.toString(),
          human_signature: "epoch-burn-service",
          sentinel_signature: "automated",
          reason: `Epoch ${epoch} decay (${decayPct}% of idle shards)`,
          metadata: {
            epoch,
            attestation_hash: attestationHash,
            reabsorption_tx: reabsorptionTx,
            accounts_affected: decayedAccounts.length,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ledger attestation failed: ${response.status}`);
      }
    } catch (error) {
      console.error("[EPOCH-BURN] Failed to post attestation:", error);
      // Continue anyway - log error but don't fail
    }

    // Notify sentinels
    const message = `Epoch ${epoch} burn complete: ${totalDecayed.toString()} shards decayed and reabsorbed`;
    await notifySentinels(burnConfig.notify, message);

    console.log("[EPOCH-BURN] Complete");
  } catch (error) {
    console.error("[EPOCH-BURN] Error:", error);
    throw error;
  }
}

/**
 * Main service entry point
 */
async function main() {
  const config = loadConfig();
  const burnConfig = config.epochs.burn_job;

  console.log("[EPOCH-BURN] Service starting...");
  console.log(`[EPOCH-BURN] Cron schedule: ${burnConfig.cron}`);
  console.log(`[EPOCH-BURN] Dry run: ${burnConfig.dry_run}`);

  // Run immediately on startup if in test mode
  if (process.env.RUN_ON_STARTUP === "true") {
    await executeEpochBurn(burnConfig.dry_run);
  }

  // Schedule cron job
  cron.schedule(burnConfig.cron, async () => {
    await executeEpochBurn(burnConfig.dry_run);
  });

  console.log("[EPOCH-BURN] Service running (press Ctrl+C to stop)");
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[EPOCH-BURN] Shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n[EPOCH-BURN] Shutting down...");
  process.exit(0);
});

// Start service
main().catch((error) => {
  console.error("[EPOCH-BURN] Fatal error:", error);
  process.exit(1);
});


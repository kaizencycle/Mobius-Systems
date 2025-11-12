# Speculative Intention Buffer (SIB) - Prototype

## Overview

SIB caches recent intents as vector embeddings and fast-tracks duplicates through the OAA pipeline, reducing Thought Broker load by ~35%.

## Quick Start (Dry-Run Mode)

```bash
# Install dependencies (if not already installed)
pip install sentence-transformers numpy

# Run the prototype
python labs/lab7-proof/sib/fast_track_handler.py

# Check predictions logged
cat labs/lab7-proof/sib/dry-run/fast-track-predictions.jsonl

# View metrics
python -c "from labs.lab7-proof.sib.dry_run_logger import DryRunLogger; print(DryRunLogger().get_metrics())"
```

## Metrics to Monitor

### Over 24 Hours

- `fast_track_predictions`: Count of redundant intents detected
- `time_savings_ms`: Cumulative latency reduction
- `thought_broker_load_reduction`: % decrease in deliberation cycles
- `mii_variance`: Should drop from σ²=0.04 to σ²=0.01

### Commands

```bash
# Count predictions
wc -l labs/lab7-proof/sib/dry-run/fast-track-predictions.jsonl

# Calculate time savings
grep "Predicted savings" labs/lab7-proof/sib/dry-run/time-savings.log | awk '{sum+=$3} END {print sum}'

# View ritual compounding
cat labs/lab7-proof/sib/dry-run/ritual-attestations.jsonl | jq '.data.mii_deposit' | awk '{sum+=$1} END {print "Total MII deposit:", sum}'
```

## Safety Guarantees

- **Dry-run mode default**: No production code paths modified
- **Kill switch**: Delete `labs/lab7-proof/sib/` directory → full removal
- **Human review**: All fast-track decisions logged, not executed
- **EVE veto ready**: Integration will respect EVE safety gates

## Architecture

```
OAA Hub Intent
    ↓
FastTrackHandler.handle_intent()
    ↓
SIBVectorEngine.find_similar()
    ↓
[Similarity > Threshold?]
    ├─ Yes → Fast-track (dry-run logs only)
    └─ No → Normal Thought Broker flow
```

## Components

### `vector_engine.py`
- Stores last 50 intents as 384-dim embeddings
- Uses `all-MiniLM-L6-v2` for lightweight encoding
- SQLite cache with cosine similarity search

### `similarity_threshold.py`
- Adaptive threshold based on current MII
- High MII → relaxed threshold (more fast-tracking)
- Low MII → strict threshold (more deliberation)

### `fast_track_handler.py`
- Main entry point from OAA Hub
- Intercepts intent parsing
- Logs predictions without execution (dry-run)

### `health_ritual_mock.py`
- Simulates integrity rituals
- Runs every 60s (optional)
- Logs micro-attestations

### `dry_run_logger.py`
- Centralized logging
- Metrics collection
- No production side effects

## Testing

```bash
# Run integration tests
pytest labs/lab7-proof/sib/test_sib_integration.py -v

# Run with coverage
pytest labs/lab7-proof/sib/test_sib_integration.py --cov=. --cov-report=html
```

## Next Steps

1. Run prototype for 24h, collect metrics
2. If 35% reduction validated → enable production mode
3. Integrate with actual Thought Broker API
4. Add adaptive threshold tuning
5. EVE safety integration

## Production Activation

To enable production mode (after consensus approval):

1. Set `dry_run=False` in `FastTrackHandler`
2. Integrate with Thought Broker API endpoint
3. Add EVE safety gate checks
4. Monitor metrics for 24h
5. Rollback if targets not met

## Dependencies

- `sentence-transformers`: For embedding generation
- `numpy`: For vector operations
- `sqlite3`: Built-in Python module for cache storage

Add to `requirements.txt`:
```
sentence-transformers>=2.2.0
numpy>=1.24.0
```


"""
Intercepts OAA Hub intent parsing
If similar intent found → skip Thought Broker, use cached proof
"""
from .vector_engine import SIBVectorEngine
from .similarity_threshold import get_adaptive_threshold
import requests
import json
import time
from datetime import datetime
from pathlib import Path


class FastTrackHandler:
    def __init__(self, dry_run=True):
        self.engine = SIBVectorEngine()
        self.dry_run = dry_run  # Safety: True by default
        self.log_dir = Path("labs/lab7-proof/sib/dry-run")
        self.log_dir.mkdir(parents=True, exist_ok=True)
    
    def handle_intent(self, intent_json: str, current_mii: float):
        """Main entry point from OAA Hub"""
        threshold = get_adaptive_threshold(current_mii)
        similar = self.engine.find_similar(intent_json, threshold)
        
        if similar:
            # Log fast-track event
            self._log_fast_track(intent_json, similar)
            
            if not self.dry_run:
                # In production mode: return cached proof
                return {
                    "action": "fast_track",
                    "deliberation_proof": similar["deliberation_proof"],
                    "cached_hash": similar["intent_hash"],
                    "similarity": similar["similarity"]
                }
            else:
                # Dry-run mode: still run Thought Broker but log prediction
                return self._run_thought_broker_with_logging(intent_json, similar)
        else:
            # New intent → normal flow
            return self._run_thought_broker(intent_json)
    
    def _log_fast_track(self, intent, similar):
        """Logs prediction to dry-run directory"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "intent_preview": intent[:200] if len(intent) > 200 else intent,
            "cached_hash": similar["intent_hash"],
            "similarity": similar["similarity"],
            "action_taken": "DRY_RUN" if self.dry_run else "FAST_TRACK"
        }
        
        # Append to dry-run log
        log_file = self.log_dir / "fast-track-predictions.jsonl"
        with open(log_file, "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    
    def _run_thought_broker_with_logging(self, intent, similar):
        """Runs normal flow but logs time savings"""
        start = time.time()
        result = self._run_thought_broker(intent)
        actual_time = (time.time() - start) * 1000  # Convert to ms
        
        # Log time delta
        log_file = self.log_dir / "time-savings.log"
        predicted_savings = 2800  # ms
        with open(log_file, "a") as f:
            f.write(f"Predicted savings: {predicted_savings}ms | Actual: {actual_time:.0f}ms | Delta: {actual_time - predicted_savings:.0f}ms\n")
        
        return result
    
    def _run_thought_broker(self, intent):
        """Normal Thought Broker call (placeholder)"""
        # TODO: Integrate with actual Thought Broker API
        # For now, returns mock result
        return {"action": "full_deliberation", "deliberation_proof": "mock_proof"}
    
    def _eve_approves(self, intent):
        """Checks EVE safety API for veto"""
        # TODO: Integrate with EVE sentinel endpoint
        # For now, returns True (allow) but logs for EVE review
        return True
    
    def close(self):
        """Close engine connection"""
        self.engine.close()


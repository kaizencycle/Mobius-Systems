"""
Centralized dry-run logging for SIB prototype
No production side effects guaranteed
"""
import json
from pathlib import Path
from datetime import datetime


class DryRunLogger:
    def __init__(self):
        self.log_dir = Path("labs/lab7-proof/sib/dry-run")
        self.log_dir.mkdir(parents=True, exist_ok=True)
    
    def log_prediction(self, event_type, data):
        """Logs any SIB prediction without execution"""
        log_file = self.log_dir / f"{event_type}.jsonl"
        
        with open(log_file, "a") as f:
            f.write(json.dumps({
                "timestamp": datetime.utcnow().isoformat(),
                "event": event_type,
                "data": data,
                "mode": "DRY_RUN"
            }) + "\n")
    
    def get_metrics(self):
        """Returns simulation metrics"""
        metrics = {}
        
        # Count fast-track predictions
        fast_track_log = self.log_dir / "fast-track-predictions.jsonl"
        if fast_track_log.exists():
            lines = [l.strip() for l in fast_track_log.read_text().strip().split("\n") if l.strip()]
            metrics["fast_track_predictions"] = len(lines)
        else:
            metrics["fast_track_predictions"] = 0
        
        # Count ritual attestations
        ritual_log = self.log_dir / "ritual-attestations.jsonl"
        if ritual_log.exists():
            lines = [l.strip() for l in ritual_log.read_text().strip().split("\n") if l.strip()]
            metrics["ritual_attestations"] = len(lines)
            metrics["total_mii_deposit"] = sum(
                json.loads(l)["data"]["mii_deposit"] 
                for l in lines if l.strip()
            )
        else:
            metrics["ritual_attestations"] = 0
            metrics["total_mii_deposit"] = 0.0
        
        # Calculate time savings if log exists
        time_savings_log = self.log_dir / "time-savings.log"
        if time_savings_log.exists():
            lines = time_savings_log.read_text().strip().split("\n")
            total_savings = 0
            for line in lines:
                if "Predicted savings" in line:
                    try:
                        # Extract delta value
                        parts = line.split("Delta:")
                        if len(parts) > 1:
                            delta = float(parts[1].replace("ms", "").strip())
                            total_savings += delta
                    except (ValueError, IndexError):
                        pass
            metrics["total_time_savings_ms"] = total_savings
        else:
            metrics["total_time_savings_ms"] = 0.0
        
        return metrics


# Usage:
# logger = DryRunLogger()
# logger.log_prediction("fast_track", {"similarity": 0.94, "hash": "abc123"})
# metrics = logger.get_metrics()
# print(metrics)


"""
Example usage of SIB prototype
Demonstrates how to use FastTrackHandler in dry-run mode
"""
import json
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sib.fast_track_handler import FastTrackHandler
from sib.dry_run_logger import DryRunLogger


def main():
    """Example: Process a series of intents"""
    handler = FastTrackHandler(dry_run=True)
    logger = DryRunLogger()
    
    # Example intents
    intents = [
        '{"goal": "deploy_service", "params": {"name": "api", "version": "1.0"}}',
        '{"goal": "deploy_service", "params": {"name": "api", "version": "1.0"}}',  # Duplicate
        '{"goal": "delete_service", "params": {"name": "api"}}',  # Different
        '{"goal": "deploy_service", "params": {"name": "api", "version": "1.0"}}',  # Duplicate again
    ]
    
    current_mii = 0.97  # High integrity
    
    print("Processing intents through SIB (dry-run mode)...\n")
    
    for i, intent in enumerate(intents, 1):
        print(f"Intent {i}: {intent[:60]}...")
        
        # Process intent
        result = handler.handle_intent(intent, current_mii)
        
        # Store intent in cache (simulating Thought Broker result)
        if result["action"] == "full_deliberation":
            proof = f"deliberation_proof_{i}"
            handler.engine.add_intent(intent, proof, current_mii)
            print(f"  → Full deliberation (stored in cache)")
        else:
            print(f"  → Fast-tracked (similarity: {result.get('similarity', 0):.3f})")
        
        print()
    
    # Show metrics
    print("=" * 60)
    print("Metrics Summary:")
    print("=" * 60)
    metrics = logger.get_metrics()
    for key, value in metrics.items():
        print(f"  {key}: {value}")
    
    handler.close()


if __name__ == "__main__":
    main()


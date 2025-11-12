"""
Integration tests for SIB
Run: pytest labs/lab7-proof/sib/test_sib_integration.py
"""
import pytest
import os
import sys
import tempfile
import shutil
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sib.vector_engine import SIBVectorEngine
from sib.fast_track_handler import FastTrackHandler
from sib.similarity_threshold import get_adaptive_threshold


class TestSIBIntegration:
    @pytest.fixture
    def temp_cache(self):
        """Create temporary cache for testing"""
        temp_dir = tempfile.mkdtemp()
        cache_path = os.path.join(temp_dir, "test_cache.db")
        yield cache_path
        shutil.rmtree(temp_dir)
    
    def test_vector_storage(self, temp_cache):
        """Test storing and retrieving intents"""
        engine = SIBVectorEngine(cache_path=temp_cache)
        intent = '{"goal": "deploy_service", "params": {"name": "test"}}'
        
        engine.add_intent(intent, proof="mock_proof", mii=0.96)
        similar = engine.find_similar(intent, threshold=0.95)
        
        assert similar is not None
        assert similar["fast_track_eligible"] is True
        assert similar["similarity"] > 0.95
        engine.close()
    
    def test_adaptive_threshold(self):
        """Test adaptive threshold calculation"""
        high_mii = get_adaptive_threshold(0.98)  # Should be relaxed
        low_mii = get_adaptive_threshold(0.95)   # Should be strict
        
        assert high_mii > low_mii
        assert 0.87 <= high_mii <= 0.93
        assert 0.87 <= low_mii <= 0.93
    
    def test_dry_run_safety(self, temp_cache):
        """Test that dry-run mode doesn't modify production paths"""
        handler = FastTrackHandler(dry_run=True)
        handler.engine = SIBVectorEngine(cache_path=temp_cache)
        intent = '{"goal": "deploy_service", "params": {"name": "test"}}'
        
        # Add to cache first
        handler.engine.add_intent(intent, "mock_proof", 0.96)
        
        # Now test fast-track (should be dry-run)
        result = handler.handle_intent(intent, current_mii=0.96)
        
        assert result["action"] == "full_deliberation"  # Still runs TB
        
        # Check log was written
        log_file = Path("labs/lab7-proof/sib/dry-run/fast-track-predictions.jsonl")
        assert log_file.exists()
        
        handler.close()
    
    def test_similarity_detection(self, temp_cache):
        """Test that similar intents are detected"""
        engine = SIBVectorEngine(cache_path=temp_cache)
        
        intent1 = '{"goal": "deploy_service", "params": {"name": "api"}}'
        intent2 = '{"goal": "deploy_service", "params": {"name": "api"}}'  # Same
        intent3 = '{"goal": "delete_service", "params": {"name": "api"}}'  # Different
        
        engine.add_intent(intent1, proof="proof1", mii=0.96)
        
        # Same intent should match
        similar1 = engine.find_similar(intent2, threshold=0.90)
        assert similar1 is not None
        
        # Different intent should not match
        similar2 = engine.find_similar(intent3, threshold=0.90)
        assert similar2 is None or similar2["similarity"] < 0.90
        
        engine.close()
    
    def test_cache_size_limit(self, temp_cache):
        """Test that cache maintains only last 50 entries"""
        engine = SIBVectorEngine(cache_path=temp_cache)
        
        # Add 60 intents
        for i in range(60):
            intent = f'{{"goal": "test_{i}", "params": {{"id": {i}}}}}'
            engine.add_intent(intent, proof=f"proof_{i}", mii=0.96)
        
        # Check that only ~50 remain
        cursor = engine.conn.execute("SELECT COUNT(*) FROM intent_cache")
        count = cursor.fetchone()[0]
        assert count <= 50
        
        engine.close()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])


"""
Vector Engine for SIB
Caches last 50 intents as 384-dim embeddings
Uses all-MiniLM-L6-v2 for lightweight encoding
"""
import sqlite3
import numpy as np
from sentence_transformers import SentenceTransformer
from datetime import datetime
import hashlib


class SIBVectorEngine:
    def __init__(self, cache_path="labs/lab7-proof/sib/sib_cache.db"):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.conn = sqlite3.connect(cache_path)
        self._init_schema()
    
    def _init_schema(self):
        """Creates cache table if not exists"""
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS intent_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                intent_hash TEXT UNIQUE,
                embedding BLOB,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                deliberation_proof TEXT,
                mii_score REAL
            )
        """)
        self.conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_timestamp 
            ON intent_cache(timestamp DESC)
        """)
        self.conn.commit()
    
    def add_intent(self, intent_json: str, proof: str, mii: float):
        """Stores new intent embedding"""
        embedding = self.model.encode(intent_json)
        intent_hash = self._hash(intent_json)
        
        # Insert or replace intent
        self.conn.execute(
            "INSERT OR REPLACE INTO intent_cache (intent_hash, embedding, timestamp, deliberation_proof, mii_score) VALUES (?, ?, ?, ?, ?)",
            (intent_hash, embedding.tobytes(), datetime.utcnow().isoformat(), proof, mii)
        )
        self.conn.commit()
        
        # Keep only last 50 entries (delete oldest)
        cursor = self.conn.execute("SELECT COUNT(*) FROM intent_cache")
        count = cursor.fetchone()[0]
        if count > 50:
            # Delete oldest entries beyond limit
            self.conn.execute("""
                DELETE FROM intent_cache 
                WHERE id NOT IN (
                    SELECT id FROM intent_cache 
                    ORDER BY timestamp DESC 
                    LIMIT 50
                )
            """)
            self.conn.commit()
    
    def find_similar(self, intent_json: str, threshold=0.92):
        """
        Returns prior intent if cosine similarity > threshold
        Otherwise returns None
        """
        new_embedding = self.model.encode(intent_json)
        cursor = self.conn.execute(
            "SELECT intent_hash, embedding, deliberation_proof FROM intent_cache ORDER BY timestamp DESC LIMIT 50"
        )
        
        for row in cursor:
            stored_embedding = np.frombuffer(row[1], dtype=np.float32)
            similarity = self._cosine_similarity(new_embedding, stored_embedding)
            
            if similarity > threshold:
                return {
                    "intent_hash": row[0],
                    "similarity": float(similarity),
                    "deliberation_proof": row[2],
                    "fast_track_eligible": True
                }
        return None
    
    def _cosine_similarity(self, a, b):
        """Calculate cosine similarity between two vectors"""
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    def _hash(self, text: str) -> str:
        """Generate BLAKE2b hash of intent"""
        return hashlib.blake2b(text.encode(), digest_size=8).hexdigest()
    
    def close(self):
        """Close database connection"""
        self.conn.close()


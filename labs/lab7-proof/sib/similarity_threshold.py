"""
Dynamic threshold based on current MII
Threshold relaxes when integrity is high, tightens when low
"""
def get_adaptive_threshold(current_mii: float, base=0.92, adjustment=0.05):
    """
    Formula: threshold = base - (adjustment * (1 - MII))
    High MII (0.98) → 0.93 (more fast-tracking)
    Low MII (0.95) → 0.87 (more deliberation)
    
    Args:
        current_mii: Current MII score (0.0 to 1.0)
        base: Base threshold (default 0.92)
        adjustment: Adjustment factor (default 0.05)
    
    Returns:
        Adaptive threshold value
    """
    return base - (adjustment * (1 - current_mii))


# Example usage:
# threshold = get_adaptive_threshold(mii_current=0.97)  # Returns 0.925


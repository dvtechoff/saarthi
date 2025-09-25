#!/usr/bin/env python3
"""
Quick fix script to make some buses active for mobile app testing
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.trip import Bus, OccupancyLevel
from datetime import datetime
import random

def activate_sample_buses():
    """Make some buses active for testing"""
    db = SessionLocal()
    
    try:
        # Get first 3 buses and make them active
        buses = db.query(Bus).limit(3).all()
        
        if not buses:
            print("❌ No buses found in database. Please run seed_buses.py first.")
            return
        
        for i, bus in enumerate(buses):
            # Make them active
            bus.is_active = True
            
            # Update their positions to be spread around Delhi NCR
            base_lat = 28.6139
            base_lng = 77.209
            
            bus.current_latitude = base_lat + random.uniform(-0.02, 0.02)
            bus.current_longitude = base_lng + random.uniform(-0.02, 0.02)
            bus.speed = random.uniform(15, 45)
            bus.occupancy = random.choice([OccupancyLevel.LOW, OccupancyLevel.MEDIUM, OccupancyLevel.HIGH])
            bus.last_updated = datetime.utcnow()
            
            print(f"✅ Activated bus {bus.bus_number} at ({bus.current_latitude:.4f}, {bus.current_longitude:.4f})")
        
        db.commit()
        print(f"✅ Successfully activated {len(buses)} buses for testing")
        
    except Exception as e:
        print(f"❌ Error activating buses: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    activate_sample_buses()
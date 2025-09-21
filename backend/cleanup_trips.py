#!/usr/bin/env python3
"""
Script to clean up active trips for testing
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.trip import Trip, Bus
from app.models.user import User

def cleanup_trips():
    """Clean up all active trips"""
    db = SessionLocal()
    
    try:
        # Find all active trips
        active_trips = db.query(Trip).filter(Trip.status == "active").all()
        print(f"Found {len(active_trips)} active trips")
        
        for trip in active_trips:
            # Mark trip as completed
            trip.status = "completed"
            
            # Mark bus as inactive
            bus = db.query(Bus).filter(Bus.id == trip.bus_id).first()
            if bus:
                bus.is_active = False
                print(f"Marked bus {bus.bus_number} as inactive")
        
        db.commit()
        print("✅ Cleaned up all active trips")
        
    except Exception as e:
        print(f"❌ Error cleaning up trips: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_trips()

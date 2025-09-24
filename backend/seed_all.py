#!/usr/bin/env python3
"""
Master seed script to populate the database with all initial data
Run this to seed your Railway database with complete test data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def main():
    """Run all seeding scripts in correct order"""
    print("🌱 Starting complete database seeding...")
    
    try:
        # 1. Seed basic data (users)
        print("\n1️⃣ Seeding users and basic data...")
        from seed_data import create_initial_data
        create_initial_data()
        print("✅ Users and basic data seeded")
        
        # 2. Seed routes and stops
        print("\n2️⃣ Seeding routes and stops...")
        from seed_routes import seed_routes
        seed_routes()
        print("✅ Routes and stops seeded")
        
        # 3. Seed buses
        print("\n3️⃣ Seeding buses...")
        from seed_buses import seed_buses
        seed_buses()
        print("✅ Buses seeded")
        
        # 4. Seed Neo4j (optional)
        try:
            print("\n4️⃣ Seeding Neo4j graph data...")
            from seed_neo4j import seed_neo4j_data
            seed_neo4j_data()
            print("✅ Neo4j graph data seeded")
        except Exception as e:
            print(f"⚠️ Neo4j seeding skipped: {e}")
        
        print("\n🎉 Complete database seeding finished successfully!")
        print("\n👤 Test users created:")
        print("   🔐 Authority: authority@test.com / password123")
        print("   🚗 Driver: driver@test.com / password123") 
        print("   🚌 Commuter: commuter@test.com / password123")
        print("\n🗺️ Sample routes and stops created")
        print("🚌 Sample buses assigned to routes")
        
    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
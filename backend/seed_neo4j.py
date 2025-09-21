#!/usr/bin/env python3
"""
Seed script for Neo4j graph database
Creates sample routes, stops, and connections
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.neo4j import neo4j_driver
from app.models.graph import GraphService, Stop, Route, Connection

def create_sample_data():
    """Create sample routes and stops for testing"""
    
    with neo4j_driver.get_session() as session:
        graph_service = GraphService(session)
        
        print("🚀 Seeding Neo4j database...")
        
        # Clear existing data
        print("🧹 Clearing existing data...")
        session.run("MATCH (n) DETACH DELETE n")
        
        # Create stops
        print("📍 Creating stops...")
        stops = [
            Stop("stop_1", "Central Station", 28.6139, 77.2090, "terminal", ["shelter", "bench", "lighting"]),
            Stop("stop_2", "Market Square", 28.6149, 77.2190, "regular", ["shelter", "bench"]),
            Stop("stop_3", "University Gate", 28.6159, 77.2290, "regular", ["shelter", "lighting"]),
            Stop("stop_4", "Hospital", 28.6169, 77.2390, "regular", ["shelter", "bench", "lighting"]),
            Stop("stop_5", "Airport Terminal", 28.6179, 77.2490, "terminal", ["shelter", "bench", "lighting", "wifi"]),
            Stop("stop_6", "Shopping Mall", 28.6129, 77.1990, "regular", ["shelter", "bench"]),
            Stop("stop_7", "Residential Area", 28.6119, 77.1890, "regular", ["shelter"]),
            Stop("stop_8", "Industrial Zone", 28.6109, 77.1790, "regular", ["shelter", "bench"]),
        ]
        
        for stop in stops:
            graph_service.create_stop(stop)
            print(f"  ✅ Created stop: {stop.name}")
        
        # Create routes
        print("🚌 Creating routes...")
        routes = [
            Route("route_1", "Central-Airport Express", "101", "outbound", "express", 10),
            Route("route_1", "Central-Airport Express", "101", "inbound", "express", 10),
            Route("route_2", "University Line", "202", "outbound", "city", 15),
            Route("route_2", "University Line", "202", "inbound", "city", 15),
            Route("route_3", "Hospital Shuttle", "303", "outbound", "local", 20),
            Route("route_3", "Hospital Shuttle", "303", "inbound", "local", 20),
        ]
        
        for route in routes:
            graph_service.create_route(route)
            print(f"  ✅ Created route: {route.name} ({route.number})")
        
        # Create connections for Route 101 (Central-Airport Express)
        print("🔗 Creating connections for Route 101...")
        route_101_connections = [
            Connection("stop_1", "stop_2", "route_1", 500, 120, 1),
            Connection("stop_2", "stop_3", "route_1", 800, 180, 2),
            Connection("stop_3", "stop_4", "route_1", 600, 150, 3),
            Connection("stop_4", "stop_5", "route_1", 1200, 300, 4),
        ]
        
        for conn in route_101_connections:
            graph_service.create_connection(conn)
            print(f"  ✅ Created connection: {conn.from_stop} -> {conn.to_stop}")
        
        # Create connections for Route 202 (University Line)
        print("🔗 Creating connections for Route 202...")
        route_202_connections = [
            Connection("stop_1", "stop_6", "route_2", 400, 100, 1),
            Connection("stop_6", "stop_7", "route_2", 300, 80, 2),
            Connection("stop_7", "stop_3", "route_2", 500, 120, 3),
            Connection("stop_3", "stop_4", "route_2", 600, 150, 4),
        ]
        
        for conn in route_202_connections:
            graph_service.create_connection(conn)
            print(f"  ✅ Created connection: {conn.from_stop} -> {conn.to_stop}")
        
        # Create connections for Route 303 (Hospital Shuttle)
        print("🔗 Creating connections for Route 303...")
        route_303_connections = [
            Connection("stop_1", "stop_8", "route_3", 600, 150, 1),
            Connection("stop_8", "stop_6", "route_3", 400, 100, 2),
            Connection("stop_6", "stop_4", "route_3", 800, 200, 3),
        ]
        
        for conn in route_303_connections:
            graph_service.create_connection(conn)
            print(f"  ✅ Created connection: {conn.from_stop} -> {conn.to_stop}")
        
        print("🎉 Neo4j seeding completed!")
        
        # Test some queries
        print("\n🧪 Testing queries...")
        
        # Test nearby stops
        nearby = graph_service.get_nearby_stops(28.6139, 77.2090, 1000)
        print(f"  📍 Nearby stops to Central Station: {len(nearby)}")
        
        # Test route stops
        route_stops = graph_service.get_route_stops("route_1")
        print(f"  🚌 Route 101 stops: {len(route_stops)}")
        
        # Test routes through stop
        routes_through = graph_service.get_routes_through_stop("stop_3")
        print(f"  🔄 Routes through University Gate: {len(routes_through)}")
        
        # Test shortest path
        path = graph_service.find_shortest_path("stop_1", "stop_5", "route_1")
        print(f"  🛣️ Shortest path from Central to Airport: {len(path)} paths found")
        
        # Test route optimization
        optimization = graph_service.optimize_route("stop_1", "stop_4")
        print(f"  ⚡ Route optimization: {len(optimization['optimal_routes'])} optimal routes")

if __name__ == "__main__":
    try:
        create_sample_data()
    except Exception as e:
        print(f"❌ Error seeding Neo4j: {e}")
        sys.exit(1)
    finally:
        neo4j_driver.close()

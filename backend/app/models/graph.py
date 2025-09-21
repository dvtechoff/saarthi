"""
Neo4j graph models for routes and stops
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from neo4j import Session

@dataclass
class Stop:
    """Bus stop node in the graph"""
    id: str
    name: str
    latitude: float
    longitude: float
    stop_type: str = "regular"  # regular, terminal, interchange
    facilities: List[str] = None  # shelter, bench, lighting, etc.

@dataclass
class Route:
    """Bus route node in the graph"""
    id: str
    name: str
    number: str
    direction: str  # inbound, outbound
    route_type: str = "city"  # city, express, local
    frequency: int = 15  # minutes between buses

@dataclass
class Connection:
    """Connection between stops in a route"""
    from_stop: str
    to_stop: str
    route_id: str
    distance: float  # meters
    travel_time: int  # seconds
    sequence: int  # order in route

class GraphService:
    """Service for managing graph operations"""
    
    def __init__(self, session: Session):
        self.session = session

    def create_stop(self, stop: Stop) -> bool:
        """Create a bus stop node"""
        try:
            query = """
            CREATE (s:Stop {
                id: $id,
                name: $name,
                latitude: $latitude,
                longitude: $longitude,
                stop_type: $stop_type,
                facilities: $facilities
            })
            """
            self.session.run(query, 
                id=stop.id,
                name=stop.name,
                latitude=stop.latitude,
                longitude=stop.longitude,
                stop_type=stop.stop_type,
                facilities=stop.facilities or []
            )
            return True
        except Exception as e:
            print(f"Error creating stop: {e}")
            return False

    def create_route(self, route: Route) -> bool:
        """Create a bus route node"""
        try:
            query = """
            CREATE (r:Route {
                id: $id,
                name: $name,
                number: $number,
                direction: $direction,
                route_type: $route_type,
                frequency: $frequency
            })
            """
            self.session.run(query,
                id=route.id,
                name=route.name,
                number=route.number,
                direction=route.direction,
                route_type=route.route_type,
                frequency=route.frequency
            )
            return True
        except Exception as e:
            print(f"Error creating route: {e}")
            return False

    def create_connection(self, connection: Connection) -> bool:
        """Create connection between stops"""
        try:
            query = """
            MATCH (from:Stop {id: $from_stop})
            MATCH (to:Stop {id: $to_stop})
            MATCH (route:Route {id: $route_id})
            CREATE (from)-[c:CONNECTS {
                route_id: $route_id,
                distance: $distance,
                travel_time: $travel_time,
                sequence: $sequence
            }]->(to)
            """
            self.session.run(query,
                from_stop=connection.from_stop,
                to_stop=connection.to_stop,
                route_id=connection.route_id,
                distance=connection.distance,
                travel_time=connection.travel_time,
                sequence=connection.sequence
            )
            return True
        except Exception as e:
            print(f"Error creating connection: {e}")
            return False

    def find_shortest_path(self, start_stop: str, end_stop: str, route_id: str = None) -> List[Dict]:
        """Find shortest path between two stops"""
        try:
            if route_id:
                query = """
                MATCH path = shortestPath((start:Stop {id: $start_stop})-[*]-(end:Stop {id: $end_stop}))
                WHERE ALL(r in relationships(path) WHERE r.route_id = $route_id)
                RETURN path, length(path) as path_length
                ORDER BY path_length
                LIMIT 1
                """
                result = self.session.run(query, 
                    start_stop=start_stop, 
                    end_stop=end_stop, 
                    route_id=route_id
                )
            else:
                query = """
                MATCH path = shortestPath((start:Stop {id: $start_stop})-[*]-(end:Stop {id: $end_stop}))
                RETURN path, length(path) as path_length
                ORDER BY path_length
                LIMIT 1
                """
                result = self.session.run(query, 
                    start_stop=start_stop, 
                    end_stop=end_stop
                )
            
            return [record.data() for record in result]
        except Exception as e:
            print(f"Error finding shortest path: {e}")
            return []

    def get_route_stops(self, route_id: str) -> List[Dict]:
        """Get all stops for a route in sequence"""
        try:
            query = """
            MATCH (s:Stop)-[c:CONNECTS {route_id: $route_id}]->(next:Stop)
            RETURN s.id as stop_id, s.name as stop_name, s.latitude as latitude, 
                   s.longitude as longitude, c.sequence as sequence
            ORDER BY c.sequence
            """
            result = self.session.run(query, route_id=route_id)
            return [record.data() for record in result]
        except Exception as e:
            print(f"Error getting route stops: {e}")
            return []

    def get_nearby_stops(self, latitude: float, longitude: float, radius: float = 1000) -> List[Dict]:
        """Get stops within radius of given coordinates"""
        try:
            query = """
            MATCH (s:Stop)
            WHERE distance(point({latitude: s.latitude, longitude: s.longitude}), 
                          point({latitude: $lat, longitude: $lng})) <= $radius
            RETURN s.id as stop_id, s.name as stop_name, s.latitude as latitude,
                   s.longitude as longitude, s.stop_type as stop_type
            ORDER BY distance(point({latitude: s.latitude, longitude: s.longitude}), 
                             point({latitude: $lat, longitude: $lng}))
            """
            result = self.session.run(query, 
                lat=latitude, 
                lng=longitude, 
                radius=radius
            )
            return [record.data() for record in result]
        except Exception as e:
            print(f"Error getting nearby stops: {e}")
            return []

    def get_routes_through_stop(self, stop_id: str) -> List[Dict]:
        """Get all routes that pass through a stop"""
        try:
            query = """
            MATCH (s:Stop {id: $stop_id})-[c:CONNECTS]->(next:Stop)
            MATCH (r:Route {id: c.route_id})
            RETURN DISTINCT r.id as route_id, r.name as route_name, r.number as route_number,
                   r.direction as direction, r.route_type as route_type
            """
            result = self.session.run(query, stop_id=stop_id)
            return [record.data() for record in result]
        except Exception as e:
            print(f"Error getting routes through stop: {e}")
            return []

    def calculate_eta(self, bus_location: Dict, target_stop: str, route_id: str) -> int:
        """Calculate estimated time of arrival in minutes"""
        try:
            # Get current stop and target stop
            current_stop = bus_location.get('current_stop_id')
            if not current_stop:
                return -1  # Cannot calculate without current stop
            
            # Find path from current stop to target stop
            path = self.find_shortest_path(current_stop, target_stop, route_id)
            if not path:
                return -1  # No path found
            
            # Calculate total travel time
            total_time = 0
            for connection in path[0]['path'].relationships:
                total_time += connection.get('travel_time', 0)
            
            # Convert to minutes
            return total_time // 60
        except Exception as e:
            print(f"Error calculating ETA: {e}")
            return -1

    def optimize_route(self, start_stop: str, end_stop: str) -> Dict:
        """Find optimal route between two stops considering multiple routes"""
        try:
            query = """
            MATCH (start:Stop {id: $start_stop})
            MATCH (end:Stop {id: $end_stop})
            MATCH path = (start)-[r*]-(end)
            WITH path, 
                 reduce(total_time = 0, rel in relationships(path) | total_time + rel.travel_time) as total_time,
                 reduce(total_distance = 0, rel in relationships(path) | total_distance + rel.distance) as total_distance
            RETURN path, total_time, total_distance
            ORDER BY total_time, total_distance
            LIMIT 3
            """
            result = self.session.run(query, 
                start_stop=start_stop, 
                end_stop=end_stop
            )
            
            routes = []
            for record in result:
                routes.append({
                    'path': record['path'],
                    'total_time': record['total_time'],
                    'total_distance': record['total_distance']
                })
            
            return {
                'optimal_routes': routes,
                'fastest_time': routes[0]['total_time'] if routes else -1,
                'shortest_distance': routes[0]['total_distance'] if routes else -1
            }
        except Exception as e:
            print(f"Error optimizing route: {e}")
            return {'optimal_routes': [], 'fastest_time': -1, 'shortest_distance': -1}

import { Client } from '@googlemaps/google-maps-services-js';
// OpenRouteService integration (uses public fetch)

// You can get a free API key from Google Cloud Console
// For now, we'll use a mock service that creates realistic routes
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with actual API key
const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY || '';

const client = new Client({});

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface RouteSegment {
  points: RoutePoint[];
  distance: number; // in meters
  duration: number; // in seconds
}

export class RouteService {
  /**
   * Generate realistic route path between multiple stops
   * This creates a more realistic bus route that follows roads
   */
  static generateRealisticRoute(stops: RoutePoint[]): RoutePoint[] {
    if (stops.length < 2) return [];

    const routePoints: RoutePoint[] = [];
    
    // Add the first stop
    routePoints.push(stops[0]);

    for (let i = 0; i < stops.length - 1; i++) {
      const currentStop = stops[i];
      const nextStop = stops[i + 1];
      
      // Generate intermediate points that simulate following roads
      const intermediatePoints = this.generateRoadPath(currentStop, nextStop);
      routePoints.push(...intermediatePoints);
    }

    // Add the last stop
    routePoints.push(stops[stops.length - 1]);

    return routePoints;
  }

  /**
   * Generate a realistic road path between two points
   * This simulates how a bus would actually travel on roads
   */
  private static generateRoadPath(start: RoutePoint, end: RoutePoint): RoutePoint[] {
    const points: RoutePoint[] = [];
    
    // Calculate distance between points
    const distance = this.calculateDistance(start, end);
    
    // Determine number of intermediate points based on distance
    const steps = Math.max(5, Math.min(20, Math.floor(distance * 1000 / 100))); // 1 point per 100m
    
    for (let i = 1; i < steps; i++) {
      const ratio = i / steps;
      
      // Linear interpolation
      let lat = start.latitude + (end.latitude - start.latitude) * ratio;
      let lng = start.longitude + (end.longitude - start.longitude) * ratio;
      
      // Add realistic road-like curves and variations
      const roadVariation = this.generateRoadVariation(ratio, distance);
      lat += roadVariation.latitude;
      lng += roadVariation.longitude;
      
      points.push({ latitude: lat, longitude: lng });
    }
    
    return points;
  }

  /**
   * Generate road-like variations to make the path more realistic
   */
  private static generateRoadVariation(ratio: number, distance: number): RoutePoint {
    // Create S-curves and turns that simulate real roads
    const curveIntensity = Math.min(0.0005, distance * 0.0001); // Scale with distance
    
    // Primary curve (S-shaped)
    const primaryCurve = Math.sin(ratio * Math.PI * 2) * curveIntensity;
    
    // Secondary variations (smaller curves)
    const secondaryCurve = Math.sin(ratio * Math.PI * 4) * curveIntensity * 0.3;
    
    // Add some randomness for realism
    const randomVariation = (Math.random() - 0.5) * curveIntensity * 0.2;
    
    return {
      latitude: primaryCurve + secondaryCurve + randomVariation,
      longitude: primaryCurve * 0.5 + secondaryCurve * 0.3 + randomVariation * 0.8
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private static calculateDistance(point1: RoutePoint, point2: RoutePoint): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLng = this.toRadians(point2.longitude - point1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get route segments with distance and duration information
   */
  static getRouteSegments(stops: RoutePoint[]): RouteSegment[] {
    const segments: RouteSegment[] = [];
    
    for (let i = 0; i < stops.length - 1; i++) {
      const start = stops[i];
      const end = stops[i + 1];
      
      const points = this.generateRoadPath(start, end);
      const distance = this.calculateDistance(start, end) * 1000; // Convert to meters
      const duration = distance / 30; // Assume 30 km/h average speed
      
      segments.push({
        points,
        distance,
        duration
      });
    }
    
    return segments;
  }

  /**
   * Get total route distance and duration
   */
  static getRouteSummary(stops: RoutePoint[]): { totalDistance: number; totalDuration: number } {
    const segments = this.getRouteSegments(stops);
    
    const totalDistance = segments.reduce((sum, segment) => sum + segment.distance, 0);
    const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0);
    
    return { totalDistance, totalDuration };
  }
}

// Alternative: Use Google Directions API (requires API key)
export class GoogleRouteService {
  static async getDirections(stops: RoutePoint[]): Promise<RoutePoint[]> {
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
      // Fallback to realistic route generation
      return RouteService.generateRealisticRoute(stops);
    }

    try {
      const waypoints = stops.slice(1, -1).map(stop => ({
        lat: stop.latitude,
        lng: stop.longitude
      }));

      const response = await client.directions({
        params: {
          origin: { lat: stops[0].latitude, lng: stops[0].longitude },
          destination: { lat: stops[stops.length - 1].latitude, lng: stops[stops.length - 1].longitude },
          waypoints: waypoints.length > 0 ? waypoints : undefined,
          mode: 'driving' as any,
          key: GOOGLE_MAPS_API_KEY,
        },
      });

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const points: RoutePoint[] = [];
        
        route.legs.forEach(leg => {
          leg.steps.forEach(step => {
            if (step.polyline && step.polyline.points) {
              // Decode polyline points
              const decodedPoints = this.decodePolyline(step.polyline.points);
              points.push(...decodedPoints);
            }
          });
        });
        
        return points;
      }
    } catch (error) {
      console.warn('Google Directions API failed, using fallback:', error);
    }

    // Fallback to realistic route generation
    return RouteService.generateRealisticRoute(stops);
  }

  private static decodePolyline(encoded: string): RoutePoint[] {
    const points: RoutePoint[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b: number;
      let shift = 0;
      let result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5
      });
    }

    return points;
  }
}

// OpenRouteService (free tier) – road-following directions without Google
export class OpenRouteService {
  static async getDirections(stops: RoutePoint[]): Promise<RoutePoint[]> {
    try {
      if (!Array.isArray(stops) || stops.length < 2) return [];
      if (!ORS_API_KEY) throw new Error('ORS API key missing');

      // ORS expects [lng, lat]
      const coordinates = stops.map((s) => [s.longitude, s.latitude]);

      const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': ORS_API_KEY,
        },
        body: JSON.stringify({ coordinates }),
      });

      if (!res.ok) throw new Error(`ORS error ${res.status}`);
      const data = await res.json();
      const coords: [number, number][] | undefined = data?.features?.[0]?.geometry?.coordinates;
      if (!coords || coords.length === 0) return [];

      return coords.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
    } catch (e) {
      // Fallback to realistic synthetic route
      return RouteService.generateRealisticRoute(stops);
    }
  }
}

// Helper that chooses ORS when available, otherwise falls back to Google (if key) or synthetic
export async function getRoadAwareRoute(stops: RoutePoint[]): Promise<RoutePoint[]> {
  if (ORS_API_KEY) {
    return OpenRouteService.getDirections(stops);
  }
  // If Google key exists, try Google; otherwise fallback to synthetic
  if (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY') {
    return GoogleRouteService.getDirections(stops);
  }
  return RouteService.generateRealisticRoute(stops);
}

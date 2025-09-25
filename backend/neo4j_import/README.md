# Neo4j Data Import Guide for Saarthi - Uttar Pradesh Bus Network

## 📁 Files Generated
- `stops.csv` - Major bus stops across UP cities with coordinates and facilities
- `routes.csv` - Realistic bus routes with frequency and type
- `connections.csv` - Stop-to-stop connections with travel times

## 🏛️ Uttar Pradesh Cities Covered

### 🌟 **Lucknow** (Capital City)
- Charbagh Railway Station, Hazratganj Market, University of Lucknow
- King George Medical University, Amausi Airport, Alambagh Bus Station
- Gomti Nagar, Indira Nagar, Aminabad, Mahanagar

### 🏭 **Kanpur** (Industrial Hub)
- Kanpur Central Railway Station, Civil Lines, IIT Kanpur
- Panki Industrial Area, Mall Road

### �️ **Varanasi** (Holy City)
- Varanasi Junction, Dashashwamedh Ghat, BHU Main Gate
- Sarnath, Babatpur Airport

### 🏰 **Agra** (Tourist Destination)
- Agra Cantonment, Taj Mahal Gate, Agra Fort
- Sadar Bazaar, Fatehpur Sikri

### 📚 **Prayagraj (Allahabad)** (Education Hub)
- Prayagraj Junction, Triveni Sangam, University of Allahabad
- Civil Lines, Bamrauli Airport

### 🏘️ **Meerut** (Western UP)
- Meerut City Railway Station, Meerut Cantonment, Modipuram
- Partapur Industrial Area, Meerut College

## �🚀 Import Steps in Neo4j Browser

### 1. Access Neo4j Browser
- Go to your Neo4j AuraDB instance
- Click "Open with Browser"
- Or use Neo4j Desktop Browser

### 2. Clear Existing Data (Optional)
```cypher
MATCH (n) DETACH DELETE n
```

### 3. Import Stops (After uploading stops.csv)
```cypher
LOAD CSV WITH HEADERS FROM 'stops.csv' AS row
CREATE (s:Stop {
  id: row.id,
  name: row.name,
  latitude: toFloat(row.latitude),
  longitude: toFloat(row.longitude),
  stop_type: row.stop_type,
  facilities: split(row.facilities, ',')
})
```

### 4. Import Routes (After uploading routes.csv)
```cypher
LOAD CSV WITH HEADERS FROM 'routes.csv' AS row
CREATE (r:Route {
  id: row.id,
  name: row.name,
  number: row.number,
  direction: row.direction,
  route_type: row.route_type,
  frequency: toInteger(row.frequency)
})
```

### 5. Import Connections (After uploading connections.csv)
```cypher
LOAD CSV WITH HEADERS FROM 'connections.csv' AS row
MATCH (from:Stop {id: row.from_stop})
MATCH (to:Stop {id: row.to_stop})
CREATE (from)-[c:CONNECTS {
  route_id: row.route_id,
  distance: toFloat(row.distance),
  travel_time: toInteger(row.travel_time),
  sequence: toInteger(row.sequence)
}]->(to)
```

### 6. Create Indexes for Performance
```cypher
CREATE INDEX stop_id_index FOR (s:Stop) ON (s.id);
CREATE INDEX route_id_index FOR (r:Route) ON (r.id);
CREATE INDEX route_number_index FOR (r:Route) ON (r.number);
CREATE INDEX stop_location_index FOR (s:Stop) ON (s.latitude, s.longitude);
```

## 🔍 Test Queries for UP Network

### Count Nodes by City
```cypher
MATCH (s:Stop) WHERE s.id STARTS WITH 'lucknow' RETURN count(s) as lucknow_stops;
MATCH (s:Stop) WHERE s.id STARTS WITH 'kanpur' RETURN count(s) as kanpur_stops;
MATCH (s:Stop) WHERE s.id STARTS WITH 'varanasi' RETURN count(s) as varanasi_stops;
MATCH (s:Stop) WHERE s.id STARTS WITH 'agra' RETURN count(s) as agra_stops;
```

### Find Nearby Stops (Example: Near Charbagh Railway Station, Lucknow)
```cypher
MATCH (s:Stop)
WHERE distance(point({latitude: s.latitude, longitude: s.longitude}), 
               point({latitude: 26.8467, longitude: 80.9462})) <= 5000
RETURN s.name, s.id, s.stop_type
ORDER BY distance(point({latitude: s.latitude, longitude: s.longitude}), 
                 point({latitude: 26.8467, longitude: 80.9462}))
```

### Find Route from Taj Mahal to Agra Cantonment
```cypher
MATCH path = shortestPath((start:Stop {id: 'agra_2'})-[*]-(end:Stop {id: 'agra_1'}))
RETURN path
```

### Get Lucknow Airport Express Route
```cypher
MATCH (s:Stop)-[c:CONNECTS {route_id: 'lucknow_airport_out'}]->(next:Stop)
RETURN s.name as from_stop, next.name as to_stop, c.distance, c.travel_time
ORDER BY c.sequence
```

### Find All Routes Serving Railway Stations
```cypher
MATCH (s:Stop)-[c:CONNECTS]->()
WHERE s.name CONTAINS 'Railway' OR s.name CONTAINS 'Junction'
RETURN DISTINCT s.name, c.route_id
```

## 📊 Uttar Pradesh Network Overview

**Stops (30 total across 6 cities):**
- **8 Terminals**: Railway stations and airports with full facilities
- **3 Interchanges**: Major connectivity hubs with advanced facilities
- **19 Regular stops**: Key locations like universities, markets, and residential areas

**Routes (28 total with bidirectional coverage):**
- **Express routes**: Airport connections, IIT routes, Taj Mahal express
- **City routes**: University lines, circular routes, metro feeders
- **Local routes**: Ghat darshan, medical college shuttles
- **Intercity routes**: Fatehpur Sikri connection from Agra

**Route Types by Frequency:**
- Express: 10-18 minutes (Airport, Tourist, Educational)
- City: 12-25 minutes (Regular urban transport)
- Local: 20-30 minutes (Specialized services)
- Intercity: 45-60 minutes (Long distance connections)

## 🎯 Real Coordinates Used

All coordinates are authentic GPS locations:
- **Lucknow**: Charbagh (26.8467°N, 80.9462°E), Amausi Airport (26.7606°N, 80.8893°E)
- **Kanpur**: Central Station (26.4499°N, 80.3319°E), IIT Kanpur (26.5123°N, 80.2329°E)
- **Varanasi**: Junction (25.3176°N, 82.9739°E), Dashashwamedh Ghat (25.3119°N, 83.0104°E)
- **Agra**: Cantonment (27.1767°N, 78.0081°E), Taj Mahal (27.1751°N, 78.0421°E)
- **Prayagraj**: Junction (25.4358°N, 81.8463°E), Sangam (25.4358°N, 81.8820°E)
- **Meerut**: City Station (28.9845°N, 77.7064°E), Cantonment (28.9950°N, 77.7240°E)

## 🚌 Sample Queries for UP Tourism

### Tourist Route - Agra
```cypher
MATCH (taj:Stop {name: 'Taj Mahal Gate'})-[c:CONNECTS*]-(fort:Stop {name: 'Agra Fort'})
RETURN taj.name, fort.name, length(c) as stops_between
```

### Spiritual Circuit - Varanasi
```cypher
MATCH (junction:Stop {name: 'Varanasi Junction'})-[c:CONNECTS*]-(ghat:Stop {name: 'Dashashwamedh Ghat'})
RETURN junction.name, ghat.name, c[0].travel_time as journey_time_seconds
```

### Educational Route - Lucknow to Kanpur IIT
```cypher
MATCH (lu:Stop {name: 'University of Lucknow'}), (iit:Stop {name: 'IIT Kanpur'})
RETURN lu.name, iit.name, 
       distance(point({latitude: lu.latitude, longitude: lu.longitude}), 
               point({latitude: iit.latitude, longitude: iit.longitude})) as distance_meters
```

This comprehensive UP network will power advanced routing features across multiple cities in Uttar Pradesh! 🚌🏛️✨
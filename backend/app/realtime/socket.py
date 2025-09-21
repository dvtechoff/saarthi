import socketio
from typing import Dict, Any
import json
from datetime import datetime

# Create Socket.IO server
sio_app = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
    always_connect=True
)

# Store active connections by user type and ID
active_connections: Dict[str, Dict[str, Any]] = {
    "drivers": {},
    "commuters": {},
    "authority": {}
}

@sio_app.event
async def connect(sid, environ, auth):
    """Handle client connection"""
    print(f"Client {sid} connected")
    print(f"Auth data: {auth}")
    print(f"Environment: {environ.get('HTTP_ORIGIN', 'No origin')}")
    await sio_app.emit("server:connected", {"message": "Connected to Saarthi API", "sid": sid}, to=sid)

@sio_app.event
async def disconnect(sid):
    """Handle client disconnection"""
    print(f"Client {sid} disconnected")
    
    # Remove from active connections
    for user_type, connections in active_connections.items():
        if sid in connections:
            del connections[sid]
            break

@sio_app.event
async def join_room(sid, data):
    """Join a specific room (driver, commuter, authority)"""
    try:
        user_type = data.get("user_type")
        user_id = data.get("user_id")
        
        if user_type in active_connections:
            active_connections[user_type][sid] = {
                "user_id": user_id,
                "connected_at": data.get("timestamp")
            }
            
            # Join specific room
            room_name = f"{user_type}_{user_id}"
            await sio_app.enter_room(sid, room_name)
            await sio_app.emit("room_joined", {"room": room_name}, to=sid)
            
            print(f"User {user_id} ({user_type}) joined room {room_name}")
    except Exception as e:
        print(f"Error joining room: {e}")
        await sio_app.emit("error", {"message": "Failed to join room"}, to=sid)

@sio_app.event
async def driver_location_update(sid, data):
    """Handle driver location updates"""
    try:
        # Broadcast to commuters and authority
        await sio_app.emit("bus:location", data, room="commuters")
        await sio_app.emit("bus:location", data, room="authority")
        
        print(f"Driver location update broadcasted: {data}")
    except Exception as e:
        print(f"Error broadcasting driver location: {e}")

@sio_app.event
async def bus_status_update(sid, data):
    """Handle bus status updates"""
    try:
        # Broadcast to all relevant parties
        await sio_app.emit("bus:status", data, room="commuters")
        await sio_app.emit("bus:status", data, room="authority")
        
        print(f"Bus status update broadcasted: {data}")
    except Exception as e:
        print(f"Error broadcasting bus status: {e}")

@sio_app.event
async def eta_update(sid, data):
    """Handle ETA updates"""
    try:
        # Broadcast to commuters
        await sio_app.emit("eta:update", data, room="commuters")
        
        print(f"ETA update broadcasted: {data}")
    except Exception as e:
        print(f"Error broadcasting ETA update: {e}")

@sio_app.event
async def feedback_submitted(sid, data):
    """Handle feedback submission"""
    try:
        # Broadcast to authority
        await sio_app.emit("feedback:new", data, room="authority")
        
        print(f"Feedback submitted: {data}")
    except Exception as e:
        print(f"Error broadcasting feedback: {e}")

@sio_app.event
async def ping(sid, data):
    """Handle ping for connection testing"""
    print(f"Ping received from {sid}: {data}")
    await sio_app.emit("pong", {"timestamp": data.get("timestamp"), "server_time": str(datetime.utcnow())}, to=sid)

# Utility functions for broadcasting updates
async def broadcast_bus_location(bus_id: str, location_data: Dict[str, Any]):
    """Broadcast bus location to all commuters and authority"""
    await sio_app.emit("bus:location", {
        "bus_id": bus_id,
        "latitude": location_data.get("latitude"),
        "longitude": location_data.get("longitude"),
        "speed": location_data.get("speed"),
        "heading": location_data.get("heading"),
        "timestamp": location_data.get("timestamp")
    }, room="commuters")
    
    await sio_app.emit("bus:location", {
        "bus_id": bus_id,
        "latitude": location_data.get("latitude"),
        "longitude": location_data.get("longitude"),
        "speed": location_data.get("speed"),
        "heading": location_data.get("heading"),
        "timestamp": location_data.get("timestamp")
    }, room="authority")

async def broadcast_eta_update(bus_id: str, stop_id: str, eta: str):
    """Broadcast ETA update to commuters"""
    await sio_app.emit("eta:update", {
        "bus_id": bus_id,
        "stop_id": stop_id,
        "eta": eta,
        "timestamp": str(datetime.utcnow())
    }, room="commuters")

async def broadcast_feedback(bus_id: str, feedback_data: Dict[str, Any]):
    """Broadcast new feedback to authority"""
    await sio_app.emit("feedback:new", {
        "bus_id": bus_id,
        "feedback": feedback_data,
        "timestamp": str(datetime.utcnow())
    }, room="authority")

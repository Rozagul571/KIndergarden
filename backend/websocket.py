from fastapi import WebSocket, WebSocketDisconnect, Depends
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
import json
import asyncio
from .database import get_db
from .models.models import Notification, User

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[int, List[WebSocket]] = {}  # Map user_id to their connections

    async def connect(self, websocket: WebSocket, user_id: int = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # If user_id is provided, associate this connection with the user
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = []
            self.user_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        # Remove from user connections if applicable
        if user_id and user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            
            # Clean up empty user entries
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            print(f"Error sending personal message: {e}")
            # Connection might be closed, remove it
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)

    async def send_to_user(self, message: str, user_id: int):
        """Send a message to all connections of a specific user"""
        if user_id in self.user_connections:
            disconnected = []
            for websocket in self.user_connections[user_id]:
                try:
                    await websocket.send_text(message)
                except Exception as e:
                    print(f"Error sending to user {user_id}: {e}")
                    disconnected.append(websocket)
            
            # Clean up disconnected websockets
            for ws in disconnected:
                self.disconnect(ws, user_id)

    async def broadcast(self, message: str):
        """Send a message to all connected clients"""
        disconnected = []
        for websocket in self.active_connections:
            try:
                await websocket.send_text(message)
            except Exception as e:
                print(f"Error broadcasting message: {e}")
                disconnected.append(websocket)
        
        # Clean up disconnected websockets
        for ws in disconnected:
            if ws in self.active_connections:
                self.active_connections.remove(ws)

    async def save_notification(self, message_data: Dict[str, Any], db: Session):
        """Save a notification to the database"""
        try:
            # Extract data from the message
            message_type = message_data.get("type", "system")
            message_content = message_data.get("message", "")
            user_id = message_data.get("user_id")
            
            # Create notification record
            notification = Notification(
                user_id=user_id,
                message=message_content,
                notification_type=message_type,
                is_read=False,
                created_at=datetime.utcnow()
            )
            
            db.add(notification)
            db.commit()
            
            # Return the created notification ID
            return notification.id
        except Exception as e:
            db.rollback()
            print(f"Error saving notification: {e}")
            return None

    async def broadcast_and_save(self, message: Dict[str, Any], db: Session):
        """Broadcast a message to all clients and save it to the database"""
        # Add timestamp if not present
        if "timestamp" not in message:
            message["timestamp"] = datetime.utcnow().isoformat()
        
        # Save to database
        notification_id = await self.save_notification(message, db)
        if notification_id:
            message["id"] = notification_id
        
        # Broadcast to all clients
        await self.broadcast(json.dumps(message))

# Create a global connection manager
manager = ConnectionManager()

# WebSocket endpoint
async def websocket_endpoint(websocket: WebSocket, user_id: int = None, db: Session = Depends(get_db)):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                
                # Save the message to the database and broadcast
                await manager.broadcast_and_save(message_data, db)
                
            except json.JSONDecodeError:
                # If not valid JSON, just broadcast as is
                await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

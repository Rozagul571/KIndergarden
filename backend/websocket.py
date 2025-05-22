from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import json
from datetime import datetime
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models.models import Notification, User

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[int, List[WebSocket]] = {}  # Map user_id to their connections

    async def connect(self, websocket: WebSocket, user_id: int = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # If user_id is provided, add to user_connections
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = []
            self.user_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        # Remove from user_connections if applicable
        if user_id and user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            
            # Clean up empty lists
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def send_to_user(self, message: str, user_id: int):
        """Send a message to a specific user via all their connections."""
        if user_id in self.user_connections:
            for connection in self.user_connections[user_id]:
                await connection.send_text(message)

    async def broadcast(self, message: str, save_to_db: bool = True):
        """
        Broadcast a message to all connected clients.
        Optionally save the message to the database.
        """
        # Send to all active connections
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Error sending message: {e}")
        
        # Save to database if requested
        if save_to_db:
            try:
                # Parse the message
                data = json.loads(message)
                
                # Create a database session
                db = SessionLocal()
                try:
                    # Determine user_id (if any)
                    user_id = data.get('data', {}).get('user_id')
                    
                    # Get the sender information
                    sender_id = None
                    sender_name = "System"
                    if 'user' in data:
                        sender_id = data['user'].get('id')
                        sender_name = data['user'].get('name', 'System')
                    
                    # Create notification
                    notification = Notification(
                        user_id=user_id,  # Can be None for broadcast to all
                        message=data.get('message', 'New notification'),
                        notification_type=data.get('type', 'system'),
                        is_read=False,
                        created_by=sender_id,
                        created_at=datetime.utcnow()
                    )
                    
                    db.add(notification)
                    db.commit()
                finally:
                    db.close()
            except Exception as e:
                print(f"Error saving notification to database: {e}")

manager = ConnectionManager()

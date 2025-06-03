from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models.models import Notification, User, UserRole
import json
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[int, List[WebSocket]] = {}  

    async def connect(self, websocket: WebSocket, user_id: int = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = []
            self.user_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        if user_id and user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            print(f"Error sending message: {e}")

    async def send_to_user(self, message: str, user_id: int):
        """Send a message to a specific user via all their connections."""
        if user_id in self.user_connections:
            for connection in self.user_connections[user_id]:
                await self.send_personal_message(message, connection)

    async def broadcast_to_admins(self, message: str, db: Session):
        """Broadcast a message to all admin users."""
        admin_users = db.query(User).filter(User.role == UserRole.ADMIN).all()
        for user in admin_users:
            await self.send_to_user(message, user.id)

    async def broadcast(self, message: str, save_to_db: bool = True):
        for connection in self.active_connections:
            await self.send_personal_message(message, connection)
        
        if save_to_db:
            try:
                data = json.loads(message)
                db = SessionLocal()
                try:
                    user_id = data.get('data', {}).get('user_id')
                    sender_id = None
                    sender_name = "System"
                    if 'user' in data:
                        sender_id = data['user'].get('id')
                        sender_name = data['user'].get('name', 'System')
                    
                    notification = Notification(
                        user_id=user_id,
                        message=data.get('message', 'New notification'),
                        notification_type=data.get('type', 'system'),
                        is_read=False,
                        created_by=sender_id,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    
                    db.add(notification)
                    db.commit()
                finally:
                    db.close()
            except Exception as e:
                print(f"Error saving notification to database: {e}")

manager = ConnectionManager()

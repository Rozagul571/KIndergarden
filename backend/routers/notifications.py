from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json

from ..database import get_db
from ..models.models import Notification, User, UserRole
from ..schemas.schemas import NotificationCreate, NotificationResponse, NotificationUpdate
from ..utils.auth import get_current_user
from ..websocket import manager

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.post("/", response_model=NotificationResponse)
async def create_notification(
    notification: NotificationCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Create a new notification.
    
    If user_id is not provided, the notification will be sent to all users.
    Admin and manager notifications are sent to all users with those roles.
    """
    # Create notification in database
    db_notification = Notification(
        user_id=notification.user_id,
        message=notification.message,
        notification_type=notification.notification_type,
        created_by=current_user.id
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    
    # Broadcast via WebSocket
    await manager.broadcast(json.dumps({
        "type": notification.notification_type,
        "message": notification.message,
        "data": {
            "id": db_notification.id,
            "user_id": db_notification.user_id,
            "created_by": current_user.name,
            "created_at": db_notification.created_at.isoformat()
        },
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "role": current_user.role
        },
        "timestamp": db_notification.created_at.isoformat()
    }))
    
    return db_notification

@router.get("/", response_model=List[NotificationResponse])
async def read_notifications(
    skip: int = 0, 
    limit: int = 100, 
    unread_only: bool = False,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Get notifications for the current user.
    
    Admins and managers can see all notifications.
    Other users can only see their own notifications.
    """
    query = db.query(Notification)
    
    # Filter by user unless admin/manager
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        query = query.filter(Notification.user_id == current_user.id)
    
    # Filter by read status if requested
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    # Order by creation date (newest first)
    query = query.order_by(Notification.created_at.desc())
    
    # Apply pagination
    notifications = query.offset(skip).limit(limit).all()
    
    return notifications

@router.get("/{notification_id}", response_model=NotificationResponse)
async def read_notification(
    notification_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Get a specific notification by ID."""
    db_notification = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Check if user has permission to view this notification
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER] and db_notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this notification")
    
    return db_notification

@router.put("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: int, 
    notification: NotificationUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Update a notification (mark as read/unread)."""
    db_notification = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Check if user has permission to update this notification
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER] and db_notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this notification")
    
    # Update notification
    if notification.is_read is not None:
        db_notification.is_read = notification.is_read
    
    db_notification.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_notification)
    
    return db_notification

@router.delete("/{notification_id}", response_model=NotificationResponse)
async def delete_notification(
    notification_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Delete a notification."""
    db_notification = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Check if user has permission to delete this notification
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER] and db_notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this notification")
    
    # Store notification data for return
    notification_data = NotificationResponse.from_orm(db_notification)
    
    # Delete notification
    db.delete(db_notification)
    db.commit()
    
    return notification_data

@router.put("/mark-all-read", response_model=dict)
async def mark_all_notifications_read(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read for the current user."""
    query = db.query(Notification).filter(Notification.is_read == False)
    
    # Filter by user unless admin/manager
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        query = query.filter(Notification.user_id == current_user.id)
    
    # Update all matching notifications
    count = query.count()
    query.update({"is_read": True, "updated_at": datetime.utcnow()})
    db.commit()
    
    return {"message": f"Marked {count} notifications as read"}

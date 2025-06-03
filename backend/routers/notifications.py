from fastapi import APIRouter, Depends, HTTPException, WebSocket
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
    
    If user_id is not provided, the notification will be sent to all admin users.
    """
    # Create notification in database
    db_notification = Notification(
        user_id=notification.user_id,
        message=notification.message,
        notification_type=notification.notification_type,
        created_by=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        is_read=False
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)

    # Determine recipients
    recipients = []
    if notification.user_id:
        recipients = [notification.user_id]
    else:
        # Get all admin users
        admin_users = db.query(User).filter(User.role == UserRole.ADMIN).all()
        recipients = [user.id for user in admin_users]

    # Broadcast via WebSocket to specific recipients
    for user_id in recipients:
        await manager.send_to_user(json.dumps({
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
        }), user_id)

    return NotificationResponse(
        id=db_notification.id,
        user_id=db_notification.user_id,
        message=db_notification.message,
        notification_type=db_notification.notification_type,
        is_read=db_notification.is_read,
        created_at=db_notification.created_at,
        updated_at=db_notification.updated_at,
        created_by=db_notification.created_by
    )

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
    
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        query = query.filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    query = query.order_by(Notification.created_at.desc())
    notifications = query.offset(skip).limit(limit).all()
    
    return [NotificationResponse.from_orm(n) for n in notifications]

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
    
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER] and db_notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this notification")
    
    return NotificationResponse.from_orm(db_notification)

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
    
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER] and db_notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this notification")
    
    if notification.is_read is not None:
        db_notification.is_read = notification.is_read
    
    db_notification.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_notification)
    
    return NotificationResponse.from_orm(db_notification)

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
    
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER] and db_notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this notification")
    
    notification_data = NotificationResponse.from_orm(db_notification)
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
    
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        query = query.filter(Notification.user_id == current_user.id)
    
    count = query.count()
    query.update({"is_read": True, "updated_at": datetime.utcnow()})
    db.commit()
    
    return {"message": f"Marked {count} notifications as read"}

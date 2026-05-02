from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.all import Notification
from app.schemas.all import NotificationBase, NotificationResponse
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
def get_user_notifications(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(50).all()

@router.post("/", response_model=NotificationResponse)
def create_notification(notif: NotificationBase, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_notif = Notification(**notif.model_dump())
    if not db_notif.user_id:
        db_notif.user_id = current_user.id
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif

@router.put("/{notif_id}/read")
def mark_as_read(notif_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if not db_notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db_notif.read = True
    db.commit()
    return {"ok": True}

@router.put("/read-all")
def mark_all_as_read(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.read == False).update({"read": True})
    db.commit()
    return {"ok": True}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.all import Discussion, DiscussionMessage
from app.schemas.all import DiscussionCreate, DiscussionResponse, DiscussionMessageCreate, DiscussionMessageResponse
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/client/{client_id}", response_model=List[DiscussionResponse])
def get_discussions_for_client(client_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    discussions = db.query(Discussion).filter(Discussion.client_id == client_id).all()
    return discussions

@router.post("/", response_model=DiscussionResponse)
def create_discussion(discussion: DiscussionCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_discussion = Discussion(**discussion.model_dump())
    db.add(db_discussion)
    db.commit()
    db.refresh(db_discussion)
    return db_discussion

@router.post("/{discussion_id}/messages", response_model=DiscussionMessageResponse)
def add_message(discussion_id: int, message: DiscussionMessageCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_msg = DiscussionMessage(
        discussion_id=discussion_id,
        user_id=current_user.id,
        content=message.content
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

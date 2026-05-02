from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.all import Deal
from app.schemas.all import DealCreate, DealResponse, DealBase
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[DealResponse])
def get_all_deals(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Deal).order_by(Deal.created_at.desc()).all()

@router.post("/", response_model=DealResponse)
def create_deal(deal: DealCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_deal = Deal(**deal.model_dump())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal

@router.put("/{deal_id}", response_model=DealResponse)
def update_deal(deal_id: int, deal: dict, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if 'stage' in deal:
        db_deal.stage = deal['stage']
    if 'amount' in deal:
        db_deal.amount = deal['amount']
    if 'title' in deal:
        db_deal.title = deal['title']
    db.commit()
    db.refresh(db_deal)
    return db_deal

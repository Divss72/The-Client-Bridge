from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.all import Lead, Client
from app.schemas.all import LeadCreate, LeadResponse, LeadBase
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[LeadResponse])
def get_all_leads(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Lead).order_by(Lead.created_at.desc()).all()

@router.post("/", response_model=LeadResponse)
def create_lead(lead: LeadCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_lead = Lead(**lead.model_dump())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(lead_id: int, lead: LeadBase, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    for var, value in vars(lead).items():
        setattr(db_lead, var, value) if value is not None else None
    db.commit()
    db.refresh(db_lead)
    return db_lead

@router.post("/{lead_id}/convert")
def convert_lead(lead_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    client = Client(
        company_name=db_lead.company_name,
        contact_name=db_lead.contact_name,
        email=db_lead.email,
        phone=db_lead.phone,
        industry=db_lead.industry,
        status="Active"
    )
    db.add(client)
    db_lead.status = "Converted"
    db.commit()
    return {"message": "Lead converted to client successfully."}

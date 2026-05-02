from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.all import Client, Lead, Deal, Task

router = APIRouter()

@router.get("/global")
def global_search(q: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not q:
        return {"clients": [], "leads": [], "deals": [], "tasks": []}
        
    term = f"%{q}%"
    
    clients = db.query(Client).filter(Client.company_name.ilike(term)).limit(5).all()
    leads = db.query(Lead).filter(Lead.company_name.ilike(term)).limit(5).all()
    deals = db.query(Deal).filter(Deal.title.ilike(term)).limit(5).all()
    tasks = db.query(Task).filter(Task.title.ilike(term)).limit(5).all()
    
    return {
        "clients": [{"id": c.id, "name": c.company_name, "type": "client"} for c in clients],
        "leads": [{"id": l.id, "name": l.company_name, "type": "lead"} for l in leads],
        "deals": [{"id": d.id, "name": d.title, "type": "deal"} for d in deals],
        "tasks": [{"id": t.id, "name": t.title, "type": "task"} for t in tasks],
    }

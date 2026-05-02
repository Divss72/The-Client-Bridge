from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.all import Client
from app.cruds.all import set_churn_score

router = APIRouter()

def calculate_churn_risk(client: Client) -> tuple[float, str]:
    """A simplistic rule-based + sentiment ML based engine"""
    score = 10.0
    reasons = []
    
    interactions = client.interactions
    if not interactions:
        return 50.0, "No interactions logged. Unknown relationship health."
        
    negative_count = sum(1 for i in interactions if i.sentiment == 'negative')
    if negative_count > 0:
        score += negative_count * 15
        reasons.append(f"{negative_count} negative interactions detected.")
        
    # Example logic: if total > 3 negative, very high risk
    if negative_count >= 3:
        score += 30
        reasons.append("Frequent complaints indicate high frustration.")
        
    score = min(max(score, 0), 100) # Clamp between 0-100
    
    if not reasons:
        reasons.append("Relationship appears stable.")
        
    return score, " | ".join(reasons)

@router.get("/evaluate/{client_id}")
def evaluate_churn(client_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        return {"error": "Client not found"}
        
    score, reason = calculate_churn_risk(client)
    
    # Store the calculated score
    churn_record = set_churn_score(db, client_id, score, reason)
    
    return churn_record

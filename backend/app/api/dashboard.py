from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.all import Client, Interaction, ChurnScore

router = APIRouter()

@router.get("/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    total_clients = db.query(Client).count()
    total_interactions = db.query(Interaction).count()
    
    # Calculate At-risk clients (score > 70)
    at_risk_clients = db.query(ChurnScore).filter(ChurnScore.score > 70).count()
    
    # Sentiment distribution
    positive = db.query(Interaction).filter(Interaction.sentiment == 'positive').count()
    negative = db.query(Interaction).filter(Interaction.sentiment == 'negative').count()
    neutral = db.query(Interaction).filter(Interaction.sentiment == 'neutral').count()
    
    # Complaints this month (naive string match or specific type matching)
    complaints = db.query(Interaction).filter(Interaction.sentiment == 'negative').count()
    
    # Mocking revenue for demo dashboard
    revenue_forecast = total_clients * 1250 # arbitrary calc
    
    # Growth data (Mocking historical for demo, but could be real query)
    growth_data = [
        {"name": "Jan", "clients": max(10, total_clients - 20)},
        {"name": "Feb", "clients": max(15, total_clients - 15)},
        {"name": "Mar", "clients": max(20, total_clients - 8)},
        {"name": "Apr", "clients": total_clients},
    ]

    return {
        "total_clients": total_clients,
        "total_interactions": total_interactions,
        "at_risk_clients": at_risk_clients,
        "revenue_forecast": f"₹{revenue_forecast:,}",
        "complaints_this_month": complaints,
        "sentiment_distribution": {
            "positive": positive,
            "negative": negative,
            "neutral": neutral
        },
        "growth_data": growth_data
    }

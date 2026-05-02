from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.all import InteractionCreate, InteractionResponse
from app.cruds.all import create_interaction, get_recent_interactions, get_client
from app.services.ai_service import analyze_sentiment, get_embedding
from app.services.qdrant_service import store_memory
from app.api.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=InteractionResponse)
def log_interaction(interaction: InteractionCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # 1. Verify client exists
    client = get_client(db, interaction.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    # 2. Analyze sentiment if not provided
    if not interaction.sentiment:
        sentiment, _ = analyze_sentiment(interaction.content)
        interaction.sentiment = sentiment

    # 3. Save to SQL DB
    db_interaction = create_interaction(db, interaction)
    
    # 4. Save to Vector Store (Qdrant)
    embedding = get_embedding(interaction.content)
    store_memory(
        client_id=interaction.client_id,
        text=interaction.content,
        source_type=interaction.type,
        embedding=embedding,
        sentiment=interaction.sentiment
    )
    
    return db_interaction

@router.get("/recent", response_model=List[InteractionResponse])
def get_recent(limit: int = 20, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return get_recent_interactions(db, limit)

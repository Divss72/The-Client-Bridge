from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.all import AIQueryRequest, AIQueryResponse
from app.api.auth import get_current_user
from app.services.ai_service import get_embedding, generate_rag_response, generate_summary
from app.services.qdrant_service import search_memories
from app.cruds.all import get_client

router = APIRouter()

@router.post("/query", response_model=AIQueryResponse)
def query_memories(request: AIQueryRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Vectorize query
    q_emb = get_embedding(request.query)
    
    # Retrieve from Qdrant
    memories = search_memories(request.client_id, q_emb, limit=10)
    
    if not memories:
        return AIQueryResponse(response="I couldn't find any relevant memories to answer your question.")
        
    # Generate RAG response
    answer = generate_rag_response(query=request.query, context=memories)
    
    return AIQueryResponse(response=answer)

@router.get("/summary/{client_id}")
def get_client_summary(client_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    client = get_client(db, client_id)
    if not client:
        return {"summary": "Client not found."}
        
    interactions = [i.content for i in client.interactions]
    if not interactions:
        return {"summary": "No interactions logged for this client yet."}
        
    combined_text = " ".join(interactions[:5]) # Top 5 latest
    summary = generate_summary(combined_text)
    
    return {"summary": summary}

from pydantic import BaseModel
class EmailRequest(BaseModel):
    context: str
    tone: str = "professional"

@router.post("/generate-email")
def generate_email(request: EmailRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    from app.services.ai_service import litellm
    import os
    
    prompt = f"Write a {request.tone} email based on the following context:\n{request.context}"
    
    try:
        response = litellm.completion(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            api_key=os.getenv("OPENAI_API_KEY", "dummy")
        )
        return {"content": response.choices[0].message.content}
    except Exception as e:
        return {"content": f"Dear Client,\n\n{request.context}\n\nBest regards,\n{current_user.name}"}

@router.get("/acquisition-insights")
def get_acquisition_insights(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Mocking acquisition insights for the demo
    insights = [
        {"industry": "Technology", "trend": "High demand for AI automation.", "suggestion": "Target mid-size tech firms looking to scale ops."},
        {"industry": "Healthcare", "trend": "Shift towards telemedicine.", "suggestion": "Pitch CRM for patient relationship management."},
        {"industry": "Finance", "trend": "Strict compliance tracking.", "suggestion": "Highlight our secure Document Manager and audit logs."}
    ]
    return {"insights": insights}

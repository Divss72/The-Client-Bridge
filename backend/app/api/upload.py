from fastapi import APIRouter, Depends, UploadFile, File as FastAPIFile, HTTPException
from sqlalchemy.orm import Session
import os
import shutil

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.all import File, User
from app.services.ai_service import get_embedding
from app.services.qdrant_service import store_memory

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def parse_text(file_path: str, file_type: str) -> str:
    # A basic text extractor
    if file_type == 'txt' or file_type == 'csv':
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    elif file_type == 'pdf':
        import fitz # PyMuPDF
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    return ""

def chunk_text(text: str, chunk_size: int = 1000):
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

@router.post("/")
def upload_file(client_id: int, file: UploadFile = FastAPIFile(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ["txt", "csv", "pdf"]:
        raise HTTPException(status_code=400, detail="Unsupported file type")
        
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    from app.services.ai_service import generate_summary
    
    # Process text and store in vector DB
    text = parse_text(file_path, file_ext)
    
    # Generate summary for the file
    summary_text = ""
    if len(text) > 50:
        summary_text = generate_summary(text[:2000]) # summarize first 2000 chars
        
    db_file = File(
        filename=file.filename, 
        type=file_ext, 
        uploaded_by=current_user.id,
        client_id=client_id,
        ai_summary=summary_text
    )
    db.add(db_file)
    db.commit()
    
    chunks = chunk_text(text)
    
    for chunk in chunks:
        if len(chunk.strip()) > 10:
            emb = get_embedding(chunk)
            store_memory(client_id=client_id, text=chunk, source_type=f"file_upload_{file_ext}", embedding=emb)
            
    return {"filename": file.filename, "summary": summary_text, "message": "File uploaded and indexed successfully"}

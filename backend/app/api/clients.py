from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.all import ClientBase, ClientCreate, ClientResponse, ClientWithDetails
from app.cruds.all import create_client, get_clients, get_client, delete_client
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ClientResponse])
def read_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return get_clients(db, skip=skip, limit=limit)

@router.post("/", response_model=ClientResponse)
def create_new_client(client: ClientCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return create_client(db=db, client=client)

@router.get("/{client_id}", response_model=ClientWithDetails)
def read_client(client_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_client = get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client

@router.put("/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, client: ClientBase, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_client = get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    for var, value in vars(client).items():
        setattr(db_client, var, value) if value else None
    db.commit()
    db.refresh(db_client)
    return db_client

@router.delete("/{client_id}")
def delete_client_endpoint(client_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    deleted = delete_client(db, client_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client deleted"}

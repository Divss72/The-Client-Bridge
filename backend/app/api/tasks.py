from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.all import Task
from app.schemas.all import TaskCreate, TaskResponse, TaskBase
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[TaskResponse])
def get_all_tasks(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Task).order_by(Task.due_date.asc(), Task.created_at.desc()).all()

@router.get("/client/{client_id}", response_model=List[TaskResponse])
def get_tasks_for_client(client_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Task).filter(Task.client_id == client_id).order_by(Task.due_date.asc()).all()

@router.post("/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Auto assign to current user if not specified
    db_task = Task(**task.model_dump())
    if not db_task.assigned_to:
        db_task.assigned_to = current_user.id
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_update: dict, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for key, value in task_update.items():
        if hasattr(db_task, key):
            setattr(db_task, key, value)
            
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"ok": True}

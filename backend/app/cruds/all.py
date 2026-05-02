from sqlalchemy.orm import Session
from app.models.all import User, Client, Interaction, Note, ChurnScore
from app.schemas.all import UserCreate, ClientCreate, InteractionCreate, NoteCreate
from app.core.security import get_password_hash

# --- User Base ---
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Client ---
def get_clients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Client).offset(skip).limit(limit).all()

def get_client(db: Session, client_id: int):
    return db.query(Client).filter(Client.id == client_id).first()

def create_client(db: Session, client: ClientCreate):
    db_client = Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def delete_client(db: Session, client_id: int):
    client = get_client(db, client_id)
    if client:
        db.delete(client)
        db.commit()
    return client

# --- Interactions ---
def create_interaction(db: Session, interaction: InteractionCreate):
    db_interaction = Interaction(**interaction.model_dump())
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

def get_recent_interactions(db: Session, limit: int = 100):
    return db.query(Interaction).order_by(Interaction.created_at.desc()).limit(limit).all()

# --- Churn Score ---
def set_churn_score(db: Session, client_id: int, score: float, reason: str):
    churn = db.query(ChurnScore).filter(ChurnScore.client_id == client_id).first()
    if churn:
        churn.score = score
        churn.reason = reason
    else:
        churn = ChurnScore(client_id=client_id, score=score, reason=reason)
        db.add(churn)
    db.commit()
    db.refresh(churn)
    return churn

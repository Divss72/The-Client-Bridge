from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="Admin") # Admin, Salesperson, Manager
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True)
    contact_name = Column(String)
    email = Column(String, index=True)
    phone = Column(String)
    industry = Column(String)
    status = Column(String, default="Active") # Active, Inactive, At Risk, Churned
    renewal_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Premium BI Fields
    personality_tags = Column(JSON, default=list) # e.g., ["Budget-sensitive", "Loyal"]
    last_activity = Column(DateTime(timezone=True), default=func.now())
    payment_status = Column(String, default="Up to date")
    engagement_score = Column(Float, default=100.0)
    total_revenue = Column(Float, default=0.0)
    churn_probability = Column(Float, default=0.0)
    health_status = Column(String, default="Good") # Good, Warning, Critical
    
    interactions = relationship("Interaction", back_populates="client", cascade="all, delete-orphan")
    churn_scores = relationship("ChurnScore", back_populates="client", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="client", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="client", cascade="all, delete-orphan")
    deals = relationship("Deal", back_populates="client", cascade="all, delete-orphan")
    discussions = relationship("Discussion", back_populates="client", cascade="all, delete-orphan")
    files = relationship("File", back_populates="client", cascade="all, delete-orphan")

class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True)
    contact_name = Column(String)
    email = Column(String, index=True)
    phone = Column(String)
    industry = Column(String)
    status = Column(String, default="New") # New, Contacted, Negotiation, Converted, Lost
    source = Column(String, default="Manual") # Manual, AI Suggested, Website
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Deal(Base):
    __tablename__ = "deals"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True) 
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    title = Column(String)
    amount = Column(Float, default=0.0)
    stage = Column(String, default="Prospecting") # Prospecting, Qualification, Proposal, Closing, Won, Lost
    expected_close_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    client = relationship("Client", back_populates="deals")

class Discussion(Base):
    __tablename__ = "discussions"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    title = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    client = relationship("Client", back_populates="discussions")
    messages = relationship("DiscussionMessage", back_populates="discussion", cascade="all, delete-orphan")

class DiscussionMessage(Base):
    __tablename__ = "discussion_messages"
    id = Column(Integer, primary_key=True, index=True)
    discussion_id = Column(Integer, ForeignKey("discussions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    discussion = relationship("Discussion", back_populates="messages")
    user = relationship("User")

class Interaction(Base):
    __tablename__ = "interactions"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    type = Column(String) # Call, Email, Meeting
    sentiment = Column(String, default="neutral") # positive, neutral, negative
    source = Column(String)
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    # Premium BI Fields
    action_items = Column(JSON, default=list)
    emotion_details = Column(JSON, default=dict) # Fine-grained emotion analysis
    competitor_mentions = Column(JSON, default=list) # Competitors mentioned in the interaction
    
    client = relationship("Client", back_populates="interactions")

class ChurnScore(Base):
    __tablename__ = "churn_scores"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    score = Column(Float)
    reason = Column(Text)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    client = relationship("Client", back_populates="churn_scores")

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    client = relationship("Client", back_populates="notes")

class File(Base):
    __tablename__ = "files"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    filename = Column(String)
    type = Column(String)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    client = relationship("Client", back_populates="files")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String)
    description = Column(Text)
    due_date = Column(DateTime(timezone=True))
    status = Column(String, default="Pending") # Pending, In Progress, Completed
    priority = Column(String, default="Normal") # High, Normal, Low
    is_ai_suggested = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    client = relationship("Client", back_populates="tasks")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    message = Column(Text)
    type = Column(String) # Alert, Info, Success, Warning
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

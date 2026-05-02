from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any, Dict
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "Admin"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# --- Lead Schemas ---
class LeadBase(BaseModel):
    company_name: str
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    industry: Optional[str] = None
    status: Optional[str] = "New"
    source: Optional[str] = "Manual"

class LeadCreate(LeadBase):
    pass

class LeadResponse(LeadBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Deal Schemas ---
class DealBase(BaseModel):
    client_id: Optional[int] = None
    lead_id: Optional[int] = None
    title: str
    amount: float = 0.0
    stage: str = "Prospecting"
    expected_close_date: Optional[datetime] = None

class DealCreate(DealBase):
    pass

class DealResponse(DealBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Client Schemas ---
class ClientBase(BaseModel):
    company_name: str
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    industry: Optional[str] = None
    status: Optional[str] = "Active"
    
    # Premium Fields
    personality_tags: Optional[List[str]] = []
    payment_status: Optional[str] = "Up to date"
    engagement_score: Optional[float] = 100.0
    total_revenue: Optional[float] = 0.0
    churn_probability: Optional[float] = 0.0
    health_status: Optional[str] = "Good"

class ClientCreate(ClientBase):
    pass

class ClientResponse(ClientBase):
    id: int
    created_at: datetime
    last_activity: Optional[datetime] = None
    renewal_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# --- Task Schemas ---
class TaskBase(BaseModel):
    client_id: int
    assigned_to: Optional[int] = None
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = "Pending"
    priority: Optional[str] = "Normal"
    is_ai_suggested: Optional[bool] = False

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Interaction Schemas ---
class InteractionBase(BaseModel):
    client_id: int
    type: str
    sentiment: str = "neutral"
    source: str
    content: str
    action_items: Optional[List[str]] = []
    emotion_details: Optional[Dict[str, Any]] = {}
    competitor_mentions: Optional[List[str]] = []

class InteractionCreate(InteractionBase):
    pass

class InteractionResponse(InteractionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Discussion Schemas ---
class DiscussionMessageBase(BaseModel):
    content: str

class DiscussionMessageCreate(DiscussionMessageBase):
    pass # user_id will be extracted from current user context usually

class DiscussionMessageResponse(DiscussionMessageBase):
    id: int
    discussion_id: int
    user_id: int
    created_at: datetime
    user: Optional[UserResponse] = None
    class Config:
        from_attributes = True

class DiscussionBase(BaseModel):
    client_id: int
    title: str

class DiscussionCreate(DiscussionBase):
    pass

class DiscussionResponse(DiscussionBase):
    id: int
    created_at: datetime
    messages: List[DiscussionMessageResponse] = []
    class Config:
        from_attributes = True

# --- Note & File Schemas ---
class NoteBase(BaseModel):
    client_id: int
    content: str

class NoteCreate(NoteBase):
    pass

class NoteResponse(NoteBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class FileResponse(BaseModel):
    id: int
    client_id: Optional[int] = None
    filename: str
    type: str
    uploaded_by: int
    ai_summary: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ClientWithDetails(ClientResponse):
    interactions: List[InteractionResponse] = []
    tasks: List[TaskResponse] = []
    notes: List[NoteResponse] = []
    deals: List[DealResponse] = []
    discussions: List[DiscussionResponse] = []
    files: List[FileResponse] = []
    
    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationBase(BaseModel):
    user_id: int
    title: str
    message: str
    type: Optional[str] = "Info"
    read: Optional[bool] = False

class NotificationResponse(NotificationBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- AI Schemas ---
class AIQueryRequest(BaseModel):
    client_id: int
    query: str

class AIQueryResponse(BaseModel):
    response: str

class AIEmailRequest(BaseModel):
    context: str
    tone: Optional[str] = "professional"

class AIEmailResponse(BaseModel):
    content: str

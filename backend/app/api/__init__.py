from fastapi import APIRouter
from app.api import auth, clients, interactions, ai, dashboard, upload, churn, leads, pipeline, discussions, search, tasks, notifications

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(clients.router, prefix="/clients", tags=["clients"])
router.include_router(interactions.router, prefix="/interactions", tags=["interactions"])
router.include_router(ai.router, prefix="/ai", tags=["ai"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
router.include_router(upload.router, prefix="/upload", tags=["upload"])
router.include_router(churn.router, prefix="/churn", tags=["churn"])
router.include_router(leads.router, prefix="/leads", tags=["leads"])
router.include_router(pipeline.router, prefix="/pipeline", tags=["pipeline"])
router.include_router(discussions.router, prefix="/discussions", tags=["discussions"])
router.include_router(search.router, prefix="/search", tags=["search"])
router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])

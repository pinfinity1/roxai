import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
import uvicorn

# --- Imports: Domain & Application ---
from backend.src.presentation.api.v1 import auth
from backend.src.application.services.auth_service import AuthService

# --- Imports: Infrastructure ---
from backend.src.infrastructure.cache.redis_client import RedisClient
from backend.src.infrastructure.db.setup import engine, get_db
from backend.src.infrastructure.db.models import Base 
from backend.src.infrastructure.db.models.user import UserModel 
from backend.src.infrastructure.repositories.postgres_user_repo import PostgresUserRepository
from backend.src.infrastructure.external.sms import ConsoleSmsService, RemoteSmsService
from backend.src.infrastructure.external.email import ConsoleEmailService, SmtpEmailService

# --- Global State ---
redis_client: Optional[RedisClient] = None

# --- Lifespan (Startup & Shutdown) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting Application...")
    
    global redis_client
    try:
        redis_client = RedisClient()
        await redis_client.client.ping()
        print("✅ Redis Connected Successfully")
    except Exception as e:
        print(f"❌ Redis Connection Failed: {e}")
    
    yield
    
    if redis_client:
        await redis_client.close()
        print("🛑 Redis Connection Closed")
    
    print("👋 Application Shutdown")

# --- Dependency Injection Implementation ---
async def get_auth_service_impl(db: AsyncSession = Depends(get_db)):
    """
    This function replaces `get_auth_service` in controllers.
    It constructs the service with DB, Redis, and real/test SMS & Email services.
    """
    if redis_client is None:
        raise RuntimeError("Redis client is not initialized")
    

    real_user_repo = PostgresUserRepository(session=db)
    
    env_mode = os.getenv("ENV_MODE", "development")
    
    if env_mode == "production":
        api_key = os.getenv("SMS_PROVIDER_API_KEY", "")
        sms_service = RemoteSmsService(api_key=api_key)
    else:
        sms_service = ConsoleSmsService()

    if env_mode == "production":
        email_service = SmtpEmailService()
    else:
        email_service = ConsoleEmailService()
    

    return AuthService(
        user_repo=real_user_repo, 
        redis_client=redis_client,
        sms_service=sms_service,
        email_service=email_service 
    )

# --- App Setup ---
app = FastAPI(
    title="Roxai API",
    version="1.0.0",
    docs_url="/docs",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")

app.dependency_overrides[auth.get_auth_service] = get_auth_service_impl

if __name__ == "__main__":
    uvicorn.run("backend.src.main:app", host="0.0.0.0", port=8000, reload=True)
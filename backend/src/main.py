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
# نکته: مطمئن شوید مدل User را اینجا ایمپورت می‌کنید تا در Base ثبت شود
from backend.src.infrastructure.db.models.user import UserModel 
from backend.src.infrastructure.repositories.postgres_user_repo import PostgresUserRepository

# --- Global State ---
redis_client: Optional[RedisClient] = None

# --- Lifespan (Startup & Shutdown) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting Application...")
    
    # 1. Database Setup (Auto-Create Tables)
    # در محیط پروداکشن واقعی، بهتر است از Alembic برای مایگریشن استفاده شود.
    try:
        async with engine.begin() as conn:
            # این دستور تمام جداولی که از Base ارث‌بری کرده‌اند (مثل UserModel) را می‌سازد
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Database Tables Verified/Created")
    except Exception as e:
        print(f"❌ Database Connection Failed: {e}")

    # 2. Redis Connection
    global redis_client
    try:
        redis_client = RedisClient()
        await redis_client.client.ping()
        print("✅ Redis Connected Successfully")
    except Exception as e:
        print(f"❌ Redis Connection Failed: {e}")
    
    yield  # برنامه اینجا اجرا می‌شود
    
    # Shutdown logic
    if redis_client:
        await redis_client.close()
        print("🛑 Redis Connection Closed")
    
    print("👋 Application Shutdown")

# --- Dependency Injection Implementation ---
async def get_auth_service_impl(db: AsyncSession = Depends(get_db)):
    """
    این تابع جایگزین `get_auth_service` در کنترلرها می‌شود.
    وظیفه آن ساخت سرویس با دیتابیس و ردیس واقعی است.
    """
    if redis_client is None:
        raise RuntimeError("Redis client is not initialized")
    
    # ساخت ریپازیتوری واقعی با سشن دیتابیس
    real_user_repo = PostgresUserRepository(session=db)
    
    # تزریق ریپازیتوری و ردیس به سرویس
    return AuthService(user_repo=real_user_repo, redis_client=redis_client)

# --- App Setup ---
app = FastAPI(
    title="Roxai API",
    version="1.0.0",
    docs_url="/docs",
    lifespan=lifespan
)

# تنظیمات CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # آدرس فرانت‌اند
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# اتصال روترها
app.include_router(auth.router, prefix="/api/v1")

# 🔥 Override: اتصال سرویس واقعی به روترها
# این خط باعث می‌شود هر جا در کنترلر (auth.py) از Depends(get_auth_service) استفاده شده،
# این تابع (get_auth_service_impl) اجرا شود.
app.dependency_overrides[auth.get_auth_service] = get_auth_service_impl

if __name__ == "__main__":
    uvicorn.run("backend.src.main:app", host="0.0.0.0", port=8000, reload=True)
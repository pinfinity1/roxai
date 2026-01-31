from typing import AsyncGenerator
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

# Database & Cache
from backend.src.infrastructure.db.session import get_db
from backend.src.infrastructure.cache.redis_client import RedisClient
from backend.src.infrastructure.db.repositories.postgres_user_repo import PostgresUserRepository

# Services
from backend.src.application.services.auth_service import AuthService
from backend.src.infrastructure.services.mock_sms_service import MockSmsService
from backend.src.infrastructure.services.mock_email_service import MockEmailService

# 1. Redis Dependency
async def get_redis_client() -> RedisClient:
    client = RedisClient()
    try:
        yield client
    finally:
        await client.close()

# 2. Repository Dependency
async def get_user_repo(db: AsyncSession = Depends(get_db)) -> PostgresUserRepository:
    return PostgresUserRepository(db)

# 3. Notification Services (فعلا Mock)
def get_sms_service():
    return MockSmsService()

def get_email_service():
    return MockEmailService()

# 4. ✅ AuthService Dependency (اینی که لازم داشتید)
async def get_auth_service(
    user_repo: PostgresUserRepository = Depends(get_user_repo),
    redis_client: RedisClient = Depends(get_redis_client),
    sms_service = Depends(get_sms_service),
    email_service = Depends(get_email_service)
) -> AuthService:
    return AuthService(
        user_repo=user_repo,
        redis_client=redis_client,
        sms_service=sms_service,
        email_service=email_service
    )
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.infrastructure.db.setup import get_db
from backend.src.infrastructure.cache.redis_client import RedisClient
from backend.src.infrastructure.repositories.user import SqlAlchemyUserRepository
from backend.src.infrastructure.external.sms import ConsoleSmsService
from backend.src.infrastructure.external.email import ConsoleEmailService
from backend.src.application.services.auth_service import AuthService, SECRET_KEY, ALGORITHM
from backend.src.domain.entities.user import UserRole

async def get_redis_client() -> RedisClient:
    return RedisClient.get_instance()

get_redis_dependency = get_redis_client


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# --- Authentication Helpers ---

async def verify_token_security(
    token: str = Depends(oauth2_scheme), 
    redis: RedisClient = Depends(get_redis_client)
) -> dict:
    """تابع کمکی برای بررسی امضا و بلک‌لیست توکن"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        jti = payload.get("jti")
        
        if not jti:
             raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing JTI")

        is_blacklisted = await redis.is_token_blacklisted(jti)
        if is_blacklisted:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Token has been revoked (Logged out)"
            )
            
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Could not validate credentials"
        )

async def get_current_user_role(
    token: str = Depends(oauth2_scheme),
    redis: RedisClient = Depends(get_redis_client) 
) -> str:
    """استخراج نقش کاربر با چک کردن بلک‌لیست"""
    payload = await verify_token_security(token, redis)
    
    role: str = payload.get("role")
    if role is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    return role

async def get_current_admin_id(
    token: str = Depends(oauth2_scheme),
    redis: RedisClient = Depends(get_redis_client)
) -> str:
    """استخراج ID ادمین با چک کردن بلک‌لیست"""
    payload = await verify_token_security(token, redis)
    
    user_id: str = payload.get("sub")
    return user_id

# --- Role Guards ---
async def require_admin(role: str = Depends(get_current_user_role)):
    if role not in [UserRole.ADMIN.value, UserRole.SUPPORT.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin privileges required."
        )
    return True

async def require_super_admin(role: str = Depends(get_current_user_role)):
    if role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Super Admin privileges required."
        )
    return True


async def get_user_repo(db: AsyncSession = Depends(get_db)) -> SqlAlchemyUserRepository:
    return SqlAlchemyUserRepository(db)

def get_sms_service():
    return ConsoleSmsService()

def get_email_service():
    return ConsoleEmailService()

async def get_auth_service(
    user_repo: SqlAlchemyUserRepository = Depends(get_user_repo),
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
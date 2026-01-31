# File: backend/src/presentation/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession

# ✅ ایمپورت دقیق از فایل موجود در درخت پروژه
from backend.src.infrastructure.db.setup import get_db
from backend.src.application.services.auth_service import SECRET_KEY, ALGORITHM
from backend.src.domain.entities.user import UserRole

# این مسیر در فایل auth.py شما وجود دارد
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user_role(token: str = Depends(oauth2_scheme)) -> str:
    """استخراج نقش کاربر از توکن JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role: str = payload.get("role")
        if role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid token payload"
            )
        return role
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Could not validate credentials"
        )

async def get_current_admin_id(token: str = Depends(oauth2_scheme)) -> str:
    """استخراج ID ادمین برای ثبت در Audit Log"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        return user_id
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

# --- Role Guards ---

async def require_admin(role: str = Depends(get_current_user_role)):
    """گارد: فقط ادمین و پشتیبانی"""
    if role not in [UserRole.ADMIN.value, UserRole.SUPPORT.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin privileges required."
        )
    return True

async def require_super_admin(role: str = Depends(get_current_user_role)):
    """گارد: فقط سوپر ادمین"""
    if role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Super Admin privileges required."
        )
    return True
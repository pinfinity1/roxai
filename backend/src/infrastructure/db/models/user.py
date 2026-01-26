# backend/src/infrastructure/db/models/user.py

from sqlalchemy import Column, String, Boolean, DateTime, Enum as SAEnum, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from backend.src.infrastructure.db.models import Base 
from backend.src.domain.entities.user import UserRole, AuthMethod

class UserModel(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # --- Identifiers (Hybrid) ---
    # کاربر حتماً باید یکی از این دو را داشته باشد.
    # در سطح اپلیکیشن (Pydantic/Service) چک می‌شود که هر دو null نباشند.
    email = Column(String, unique=True, index=True, nullable=True)
    mobile = Column(String, unique=True, index=True, nullable=True) # Normalized: 0912...
    
    # --- Security ---
    password_hash = Column(String, nullable=True) # Nullable for OAuth-only users
    
    # --- Profile ---
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True) # برای نمایش عکس پروفایل گوگل
    
    # --- RBAC & Status ---
    role = Column(SAEnum(UserRole), default=UserRole.FREE, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False) # مهم برای سناریوی Verify First
    is_active = Column(Boolean, default=True, nullable=False)
    
    # --- Audit ---
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True) # Soft Delete

    # --- Optimizations ---
    # ایندکس ترکیبی برای جستجوی سریع در زمان لاگین (اگر نیاز شد)
    # __table_args__ = (
    #     Index('ix_users_email_mobile', 'email', 'mobile'),
    # )
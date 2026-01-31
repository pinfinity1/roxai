# backend/src/infrastructure/db/models/user.py

from sqlalchemy import Column, String, Boolean, DateTime, Enum as SAEnum, Integer, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from backend.src.infrastructure.db.models.base import Base 
from backend.src.domain.entities.user import UserRole, AuthMethod

class UserModel(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # --- Identifiers (Hybrid) ---
    email = Column(String, unique=True, index=True, nullable=True)
    mobile = Column(String, unique=True, index=True, nullable=True) 
    
    # --- Security ---
    password_hash = Column(String, nullable=True) 
    
    # --- Profile ---
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True) 
    
    # --- Wallet / Ledger ---
    credit = Column(Integer, default=0, nullable=False)

    # --- RBAC & Status ---
    role = Column(SAEnum(UserRole), default=UserRole.FREE, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # --- Audit ---
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # --- Optimizations ---
    __table_args__ = (
        Index('ix_users_email_mobile', 'email', 'mobile'),
    )
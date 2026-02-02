from sqlalchemy import Column, String, Boolean, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from backend.src.infrastructure.db.models.base import Base

class FeatureFlagModel(Base):
    __tablename__ = "feature_flags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # کلید یکتا برای استفاده در کد (بدون Magic String)
    key = Column(String, unique=True, nullable=False, index=True)
    description = Column(String, nullable=True)
    
    # وضعیت کلی
    is_enabled = Column(Boolean, default=False, nullable=False)
    
    # قوانین هدف‌گذاری (Targeting Rules) - ذخیره به صورت JSON
    target_users = Column(JSONB, default=[], nullable=False)
    target_roles = Column(JSONB, default=[], nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # ایندکس برای سرعت بالا در جستجو با کلید
    __table_args__ = (
        Index('ix_feature_flags_key', 'key'),
    )
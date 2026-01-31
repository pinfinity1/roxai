from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from backend.src.infrastructure.db.models.base import Base

class AdminAuditLogModel(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # چه کسی انجام داده؟ (Admin)
    admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # روی چه کسی/چیزی انجام داده؟ (Target)
    target_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    
    # چه کاری انجام داده؟ (Action)
    action = Column(String, nullable=False, index=True)  # e.g., "CREDIT_ADJUSTMENT", "IMPERSONATE"
    
    # جزئیات (مبلغ، دلیل، تغییرات)
    details = Column(JSONB, nullable=False, default={})
    
    # یادداشت اجباری ادمین
    reason_note = Column(String, nullable=True)
    
    # IP ادمین (برای امنیت بیشتر)
    ip_address = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
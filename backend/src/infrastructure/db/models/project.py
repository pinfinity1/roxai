from sqlalchemy import Column, String, DateTime, Enum as SAEnum, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from backend.src.infrastructure.db.models.base import Base
from backend.src.domain.entities.project import ProjectStatus

class ProjectModel(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    folder_id = Column(UUID(as_uuid=True), ForeignKey("folders.id"), nullable=True)
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    title = Column(String, nullable=False)
    status = Column(SAEnum(ProjectStatus), default=ProjectStatus.DRAFT, nullable=False)
    thumbnail_url = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True) 

    __table_args__ = (
        Index('ix_projects_user_updated', 'user_id', 'updated_at'),
    )
from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import UUID, uuid4
from enum import Enum
from typing import Optional

# وضعیت‌های پروژه طبق مستندات
class ProjectStatus(str, Enum):
    DRAFT = "draft"         
    GENERATING = "generating" 
    DONE = "done"           
    FAILED = "failed"       

@dataclass
class Project:
    id: UUID = field(default_factory=uuid4)
    folder_id: Optional[UUID] = None
    user_id: UUID = field(default_factory=uuid4) 
    title: str = "پروژه بدون عنوان"
    status: ProjectStatus = ProjectStatus.DRAFT
    thumbnail_url: Optional[str] = None
    
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    deleted_at: Optional[datetime] = None 
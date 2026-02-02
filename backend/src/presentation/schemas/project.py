from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from backend.src.domain.entities.project import ProjectStatus

class ProjectResponse(BaseModel):
    id: UUID
    title: str
    status: ProjectStatus
    thumbnail_url: Optional[str] = None
    folder_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProjectListResponse(BaseModel):
    items: List[ProjectResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class CreateProjectRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)

class UpdateProjectRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    folder_id: Optional[UUID] = None

class BatchActionRequest(BaseModel):
    project_ids: List[UUID]
    action: str = Field(..., pattern="^(archive|delete)$") 
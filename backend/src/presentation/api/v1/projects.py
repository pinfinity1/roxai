from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import math
from datetime import datetime, timezone
from typing import Optional
from enum import Enum
from sqlalchemy import select
from backend.src.infrastructure.db.models.folder import FolderModel

from backend.src.infrastructure.db.setup import get_db
from backend.src.presentation.dependencies import verify_token_security
from backend.src.infrastructure.repositories.project import SqlAlchemyProjectRepository
from backend.src.domain.entities.project import Project, ProjectStatus
from backend.src.presentation.schemas.project import (
    ProjectListResponse, ProjectResponse, CreateProjectRequest, 
    UpdateProjectRequest, BatchActionRequest
)

class SortField(str, Enum):
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"
    TITLE = "title"
    STATUS = "status"

class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"

router = APIRouter(prefix="/projects", tags=["Projects"])

# Dependency Helper
async def get_project_repo(db: AsyncSession = Depends(get_db)):
    return SqlAlchemyProjectRepository(db)

async def get_current_user_id(token: dict = Depends(verify_token_security)) -> UUID:
    user_id = token.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID missing")
    return UUID(user_id)

@router.get("/", response_model=ProjectListResponse, operation_id="list_projects")
async def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    search: Optional[str] = Query(None),
    status: Optional[ProjectStatus] = Query(None),
    folder_id: Optional[UUID] = Query(None, description="Filter by specific folder ID"),
    is_root: bool = Query(False, description="If true, returns only projects NOT in any folder"), # ✨ پارامتر جدید
    sort_by: SortField = Query(SortField.UPDATED_AT), 
    sort_order: SortOrder = Query(SortOrder.DESC),    
    repo: SqlAlchemyProjectRepository = Depends(get_project_repo),
    user_id: UUID = Depends(get_current_user_id)
):
    """
    Get list of projects.
    - Use `folder_id` to see inside a folder.
    - Use `is_root=True` to see top-level files only.
    - Use neither to see ALL files (flat view).
    """
    items, total = await repo.get_all_by_user(
        user_id=user_id, page=page, page_size=page_size, 
        search=search, status=status,
        folder_id=folder_id,
        is_root=is_root, # ✨ پاس دادن به ریپازیتوری
        sort_by=sort_by.value, sort_order=sort_order.value
    )
    
    total_pages = math.ceil(total / page_size) if page_size > 0 else 0
    
    return ProjectListResponse(
        items=items, total=total, page=page, 
        page_size=page_size, total_pages=total_pages
    )

@router.post("/", response_model=ProjectResponse, operation_id="create_project")
async def create_project(
    data: CreateProjectRequest,
    repo: SqlAlchemyProjectRepository = Depends(get_project_repo),
    user_id: UUID = Depends(get_current_user_id)
):
    new_project = Project(
        user_id=user_id,
        title=data.title,
        status=ProjectStatus.DRAFT
    )
    return await repo.create(new_project)

@router.patch("/{project_id}", response_model=ProjectResponse, operation_id="update_project")
async def update_project(
    project_id: UUID,
    data: UpdateProjectRequest,
    repo: SqlAlchemyProjectRepository = Depends(get_project_repo),
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    project = await repo.get_by_id(project_id, user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = data.model_dump(exclude_unset=True)
    
    # 🛡️ Security Check: Folder Ownership
    if "folder_id" in update_data and update_data["folder_id"] is not None:
        target_folder_id = update_data["folder_id"]
        folder_check = await db.execute(
            select(FolderModel).where(FolderModel.id == target_folder_id, FolderModel.user_id == user_id)
        )
        if not folder_check.scalars().first():
            raise HTTPException(status_code=403, detail="Access denied to target folder")

    updated = False
    if "title" in update_data:
        project.title = update_data["title"]
        updated = True
        
    if "folder_id" in update_data:
        project.folder_id = update_data["folder_id"]
        updated = True
    
    if updated:
        project.updated_at = datetime.now(timezone.utc)
        return await repo.update(project)
    
    return project

@router.delete("/{project_id}", operation_id="archive_project")
async def archive_project(
    project_id: UUID,
    repo: SqlAlchemyProjectRepository = Depends(get_project_repo),
    user_id: UUID = Depends(get_current_user_id)
):
    project = await repo.get_by_id(project_id, user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project.deleted_at = datetime.now(timezone.utc)
    await repo.update(project)
    
    return {"status": "success", "message": "Project archived"}

@router.post("/{project_id}/duplicate", response_model=ProjectResponse, operation_id="duplicate_project")
async def duplicate_project(
    project_id: UUID,
    repo: SqlAlchemyProjectRepository = Depends(get_project_repo),
    user_id: UUID = Depends(get_current_user_id)
):
    new_project = await repo.duplicate(project_id, user_id)
    if not new_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return new_project

@router.post("/batch", operation_id="batch_projects_action")
async def batch_projects_action(
    data: BatchActionRequest,
    repo: SqlAlchemyProjectRepository = Depends(get_project_repo),
    user_id: UUID = Depends(get_current_user_id)
):
    if data.action == "archive":
        await repo.batch_archive(data.project_ids, user_id)
        return {"status": "success", "message": f"{len(data.project_ids)} projects archived."}
    
    raise HTTPException(status_code=400, detail="Action not supported")
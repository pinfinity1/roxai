from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from uuid import UUID
from pydantic import BaseModel
from typing import List

# Imports
from backend.src.infrastructure.db.setup import get_db
from backend.src.presentation.dependencies import verify_token_security
from backend.src.infrastructure.db.models.folder import FolderModel
from backend.src.infrastructure.db.models.project import ProjectModel

router = APIRouter(prefix="/folders", tags=["Folders"])

# --- Schemas ---
class CreateFolderRequest(BaseModel):
    name: str

class FolderResponse(BaseModel):
    id: UUID
    name: str
    
    class Config:
        from_attributes = True

# --- Dependency ---
async def get_current_user_id(token: dict = Depends(verify_token_security)) -> UUID:
    user_id = token.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID missing")
    return UUID(user_id)

# --- Endpoints ---

@router.post("/", response_model=FolderResponse, operation_id="create_folder")
async def create_folder(
    data: CreateFolderRequest, 
    db: AsyncSession = Depends(get_db), 
    user_id: UUID = Depends(get_current_user_id)
):
    """
    Create a new folder for the authenticated user.
    """
    folder = FolderModel(user_id=user_id, name=data.name)
    db.add(folder)
    await db.commit()
    await db.refresh(folder)
    return folder

@router.get("/", response_model=List[FolderResponse], operation_id="list_folders")
async def list_folders(
    db: AsyncSession = Depends(get_db), 
    user_id: UUID = Depends(get_current_user_id)
):
    """
    List all folders belonging to the user.
    """
    result = await db.execute(
        select(FolderModel)
        .where(FolderModel.user_id == user_id)
        .order_by(FolderModel.created_at)
    )
    return result.scalars().all()

@router.patch("/{folder_id}", response_model=FolderResponse, operation_id="update_folder")
async def update_folder(
    folder_id: UUID,
    name: str = Body(..., embed=True), # Expects JSON: {"name": "New Name"}
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    """
    Rename an existing folder.
    """
    # Check ownership
    result = await db.execute(
        select(FolderModel).where(FolderModel.id == folder_id, FolderModel.user_id == user_id)
    )
    folder = result.scalars().first()
    
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    folder.name = name
    await db.commit()
    await db.refresh(folder)
    return folder

@router.delete("/{folder_id}", operation_id="delete_folder")
async def delete_folder(
    folder_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    """
    Delete a folder. 
    Projects inside this folder will NOT be deleted; they will be moved to the root (Un-foldered).
    """
    # Check ownership
    result = await db.execute(
        select(FolderModel).where(FolderModel.id == folder_id, FolderModel.user_id == user_id)
    )
    folder = result.scalars().first()
    
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Safe Delete: Unlink projects first (Set folder_id = NULL)
    await db.execute(
        update(ProjectModel)
        .where(ProjectModel.folder_id == folder_id)
        .values(folder_id=None)
    )
    
    await db.delete(folder)
    await db.commit()
    
    return {"status": "success", "message": "Folder deleted, projects moved to root"}
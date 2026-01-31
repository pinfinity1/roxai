from pydantic import BaseModel, Field, EmailStr
from uuid import UUID
from typing import Optional, List
from datetime import datetime
from backend.src.domain.entities.user import UserRole

# --- Shared Schemas (موجود) ---
class AdminUserFilter(BaseModel):
    query: Optional[str] = Field(None, description="Search by email, mobile, or name")
    role: Optional[UserRole] = None
    page: int = 1
    page_size: int = 20

# --- Ledger Schemas (موجود) ---
class CreditAdjustmentRequest(BaseModel):
    target_user_id: UUID
    amount: int = Field(..., description="Amount to add (positive) or remove (negative)")
    reason_note: str = Field(..., min_length=5, description="Mandatory audit note")

# --- Impersonation Schemas (موجود) ---
class ImpersonateRequest(BaseModel):
    target_user_id: UUID
    reason: str = Field(..., min_length=3, description="Reason for impersonation access")

class ImpersonateResponse(BaseModel):
    impersonation_token: str
    redirect_url: str

# --- User List Schemas (جدید) ---
class AdminUserListItem(BaseModel):
    id: UUID
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: UserRole
    credit: int = Field(default=0, description="Current wallet balance")
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedUserResponse(BaseModel):
    items: List[AdminUserListItem]
    total: int
    page: int
    page_size: int
    total_pages: int
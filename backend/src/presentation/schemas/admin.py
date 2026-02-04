from pydantic import BaseModel, Field, EmailStr
from uuid import UUID
from typing import Optional, List, Dict, Any
from datetime import datetime
from backend.src.domain.entities.user import UserRole
from backend.src.domain.entities.project import ProjectStatus

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
    avatar_url: Optional[str] = None
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


class UserStatusChangeRequest(BaseModel):
    target_user_id: UUID
    is_active: bool = Field(..., description="True to activate/unban, False to ban/block")
    reason_note: str = Field(..., min_length=5, description="Mandatory audit note for status change")

# --- Audit Log Viewer Schemas (جدید) ---
class AuditLogResponseItem(BaseModel):
    id: UUID
    admin_id: UUID
    target_user_id: Optional[UUID]
    action: str
    details: Dict[str, Any]
    reason_note: Optional[str]
    ip_address: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class PaginatedAuditLogResponse(BaseModel):
    items: List[AuditLogResponseItem]
    total: int
    page: int
    page_size: int
    total_pages: int

# --- System Telemetry Schemas (جدید) ---
class SystemHealthResponse(BaseModel):
    database_status: str
    total_users: int
    active_users_24h: int
    pending_jobs_count: int
    system_load: str

# --- Role Management Schemas (جدید) ---
class ChangeRoleRequest(BaseModel):
    target_user_id: UUID
    new_role: UserRole
    reason_note: str = Field(..., min_length=5, description="Reason for promotion/demotion")



class FeatureFlagUpdateRequest(BaseModel):
    is_enabled: bool = Field(..., description="وضعیت کلی سوئیچ")
    
    target_users: List[UUID] = Field(
        default=[], 
        description="لیست شناسه کاربرانی که این ویژگی برایشان فعال است (Whitelisting)"
    )
    
    target_roles: List[UserRole] = Field(
        default=[], 
        description="لیست نقش‌هایی که به این ویژگی دسترسی دارند"
    )
    
    description: Optional[str] = Field(None, max_length=255)

class FeatureFlagResponse(BaseModel):
    id: UUID
    key: str
    description: Optional[str]
    is_enabled: bool
    target_users: List[UUID] 
    target_roles: List[UserRole]
    updated_at: datetime

    class Config:
        from_attributes = True



class AdminProjectListItem(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    status: ProjectStatus
    created_at: datetime
    updated_at: datetime
    user_email_or_mobile: Optional[str] = None # برای اینکه بدانیم مال چه کسی است

    class Config:
        from_attributes = True

class PaginatedProjectResponse(BaseModel):
    items: List[AdminProjectListItem]
    total: int
    page: int
    page_size: int
    total_pages: int
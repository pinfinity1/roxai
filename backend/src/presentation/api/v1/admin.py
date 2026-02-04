from datetime import datetime, timedelta, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func, desc, update
from jose import jwt
import uuid
import math
import logging

# Logger setup
logger = logging.getLogger(__name__)

# Dependencies
from backend.src.presentation.dependencies import (
    get_redis_dependency,
    require_admin, 
    require_super_admin, 
    get_current_admin_id
)
from backend.src.infrastructure.cache.redis_client import RedisClient

# DB Setup
from backend.src.infrastructure.db.setup import get_db
from backend.src.infrastructure.db.models.audit import AdminAuditLogModel
from backend.src.infrastructure.db.models.user import UserModel
from backend.src.infrastructure.db.models.feature import FeatureFlagModel
from backend.src.infrastructure.db.models.project import ProjectModel
from backend.src.domain.entities.user import UserRole


# Auth Config
from backend.src.application.services.auth_service import SECRET_KEY, ALGORITHM

# Schemas
from backend.src.presentation.schemas.admin import (
    ChangeRoleRequest,
    CreditAdjustmentRequest, 
    ImpersonateRequest, 
    ImpersonateResponse,
    PaginatedAuditLogResponse,
    PaginatedUserResponse,
    UserStatusChangeRequest,  
    AuditLogResponseItem,     
    SystemHealthResponse,
    FeatureFlagUpdateRequest, 
    FeatureFlagResponse,
    PaginatedProjectResponse,
    AdminProjectListItem
)


router = APIRouter(prefix="/admin", tags=["Admin Console"])

# --- Endpoint 0: List Users (Search & Filter) ---
@router.get("/users", response_model=PaginatedUserResponse, dependencies=[Depends(require_admin)], operation_id="list_users")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    query: Optional[str] = Query(None, description="Search by email, mobile, name or ID"),
    role: Optional[UserRole] = Query(None, description="Filter by user role"),
    is_active: Optional[bool] = Query(None, description="Filter by account status (Active/Banned)"),
    db: AsyncSession = Depends(get_db)
):
    sql_query = select(UserModel)

    if query:
        clean_query = query.strip()
        search_term = f"%{clean_query}%"
        
        # Optimize: Combine name for search
        full_name_concat = func.concat(UserModel.first_name, ' ', UserModel.last_name)

        filters = [
            UserModel.email.ilike(search_term),
            UserModel.mobile.ilike(search_term),
            full_name_concat.ilike(search_term),
            UserModel.first_name.ilike(search_term),
            UserModel.last_name.ilike(search_term)
        ]
        
        # Check if query is a valid UUID
        try:
            uuid_obj = uuid.UUID(clean_query)
            filters.append(UserModel.id == uuid_obj)
        except ValueError:
            pass
            
        sql_query = sql_query.where(or_(*filters))

    if role:
        sql_query = sql_query.where(UserModel.role == role)

    if is_active is not None:
        sql_query = sql_query.where(UserModel.is_active == is_active)

    # Count Total
    count_query = select(func.count()).select_from(sql_query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Pagination
    sql_query = sql_query.order_by(desc(UserModel.created_at))
    sql_query = sql_query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(sql_query)
    users = result.scalars().all()

    total_pages = math.ceil(total / page_size) if page_size > 0 else 0

    return PaginatedUserResponse(
        items=users,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


# --- Endpoint 1: Ledger Adjustment (Super Admin Only) ---
@router.post("/ledger/adjust", dependencies=[Depends(require_super_admin)], operation_id="adjust_user_credit")
async def adjust_user_credit(
    data: CreditAdjustmentRequest,
    db: AsyncSession = Depends(get_db),
    admin_id: str = Depends(get_current_admin_id)
):
    """
    Adjusts user wallet balance safely using atomic updates.
    """
    # 1. Check if user exists
    target_user = await db.get(UserModel, data.target_user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Atomic Update (CRITICAL FIX: Prevents Race Conditions)
    # We update the DB directly without reading into memory first for calculation
    stmt = (
        update(UserModel)
        .where(UserModel.id == data.target_user_id)
        .values(credit=UserModel.credit + data.amount)
        .returning(UserModel.credit)
    )
    
    result = await db.execute(stmt)
    new_balance = result.scalar_one()

    # 3. Create Audit Log
    audit_log = AdminAuditLogModel(
        admin_id=uuid.UUID(admin_id),
        target_user_id=data.target_user_id,
        action="CREDIT_ADJUSTMENT",
        details={
            "amount": data.amount,
            "new_balance": new_balance 
        },
        reason_note=data.reason_note
    )
    
    db.add(audit_log)
    await db.commit()
    
    return {
        "status": "success", 
        "message": "Credit adjusted successfully.", 
        "new_balance": new_balance
    }


# --- Endpoint 2: Impersonation (Support & Admin) ---
@router.post("/auth/impersonate", response_model=ImpersonateResponse, dependencies=[Depends(require_admin)], operation_id="impersonate_user")
async def impersonate_user(
    data: ImpersonateRequest,
    db: AsyncSession = Depends(get_db),
    admin_id: str = Depends(get_current_admin_id)
):
    target_user = await db.get(UserModel, data.target_user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    # Log action BEFORE token generation
    audit_log = AdminAuditLogModel(
        admin_id=uuid.UUID(admin_id),
        target_user_id=data.target_user_id,
        action="IMPERSONATE_SESSION",
        details={"target_user_email": target_user.email},
        reason_note=data.reason
    )
    db.add(audit_log)
    await db.commit()

    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    to_encode = {
        "sub": str(data.target_user_id),
        "role": target_user.role.value,
        "impersonator_id": admin_id,
        "type": "impersonation",
        "exp": expire
    }
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return ImpersonateResponse(
        impersonation_token=encoded_jwt,
        redirect_url=f"/dashboard?impersonate_token={encoded_jwt}"
    )


# --- Endpoint 3: Change User Status (Ban/Unban) ---
@router.patch("/users/status", dependencies=[Depends(require_super_admin)], operation_id="change_user_status")
async def change_user_status(
    data: UserStatusChangeRequest,
    db: AsyncSession = Depends(get_db),
    admin_id: str = Depends(get_current_admin_id)
):
    if str(data.target_user_id) == admin_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Operation rejected: You cannot ban yourself."
        )

    target_user = await db.get(UserModel, data.target_user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Handle undelete logic implicitly if unbanning
    if data.is_active and target_user.deleted_at is not None:
        target_user.deleted_at = None

    previous_status = target_user.is_active
    target_user.is_active = data.is_active
    
    action_type = "USER_UNBAN" if data.is_active else "USER_BAN"
    audit_log = AdminAuditLogModel(
        admin_id=uuid.UUID(admin_id),
        target_user_id=data.target_user_id,
        action=action_type,
        details={
            "previous_status": previous_status,
            "new_status": data.is_active,
            "reason": data.reason_note,
            "undeleted": target_user.deleted_at is None
        },
        reason_note=data.reason_note
    )
    
    db.add(audit_log)
    await db.commit()
    
    return {"status": "success", "message": f"User status changed to {data.is_active}"}


# --- Endpoint 4: Audit Logs ---
# --- Endpoint 4: Audit Logs ---
@router.get("/users/{user_id}/audit-logs", response_model=PaginatedAuditLogResponse, dependencies=[Depends(require_admin)], operation_id="get_user_audit_logs")
async def get_user_audit_logs(
    user_id: str,
    page: int = Query(1, ge=1),          # ✅ اضافه شد
    page_size: int = Query(20, ge=1, le=100), # ✅ اضافه شد
    db: AsyncSession = Depends(get_db)
):
    try:
        target_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")

    # 1. Base Query
    query = select(AdminAuditLogModel).where(AdminAuditLogModel.target_user_id == target_uuid)

    # 2. Count Total (برای صفحه‌بندی)
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # 3. Apply Pagination & Sort
    query = query.order_by(desc(AdminAuditLogModel.created_at))
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    # 4. Calculate Pages
    total_pages = math.ceil(total / page_size) if page_size > 0 else 0
    
    return PaginatedAuditLogResponse(
        items=logs,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


# --- Endpoint 5: System Health ---
@router.get("/telemetry/health", response_model=SystemHealthResponse, dependencies=[Depends(require_admin)], operation_id="get_system_health")
async def get_system_health(
    db: AsyncSession = Depends(get_db)
):
    # Total Users
    count_query = select(func.count()).select_from(UserModel)
    total_result = await db.execute(count_query)
    total_users = total_result.scalar_one()

    # Active Users (24h)
    yesterday = datetime.now(timezone.utc) - timedelta(hours=24)
    active_query = select(func.count()).select_from(UserModel).where(UserModel.last_login_at >= yesterday)
    active_result = await db.execute(active_query)
    active_users = active_result.scalar_one()

    # TODO: Connect to Temporal Client for real job count
    mock_pending_jobs = 0 
    
    return SystemHealthResponse(
        database_status="healthy", 
        total_users=total_users,
        active_users_24h=active_users,
        pending_jobs_count=mock_pending_jobs,
        system_load="normal"
    )


# --- Endpoint 6: Change User Role ---
@router.patch("/users/role", dependencies=[Depends(require_super_admin)], operation_id="change_user_role")
async def change_user_role(
    data: ChangeRoleRequest,
    db: AsyncSession = Depends(get_db),
    admin_id: str = Depends(get_current_admin_id)
):
    # 1. Self-Lockout Prevention
    if str(data.target_user_id) == admin_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Operation rejected: You cannot change your own role."
        )

    # 2. Fetch User
    target_user = await db.get(UserModel, data.target_user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # 3. Apply Role Change
    previous_role = target_user.role
    target_user.role = data.new_role
    
    # 4. Mandatory Audit Log
    audit_log = AdminAuditLogModel(
        admin_id=uuid.UUID(admin_id),
        target_user_id=data.target_user_id,
        action="ROLE_CHANGE",
        details={
            "previous_role": previous_role.value,
            "new_role": data.new_role.value
        },
        reason_note=data.reason_note
    )
    
    db.add(audit_log)
    await db.commit()
    
    return {
        "status": "success", 
        "message": f"User role changed from {previous_role.value} to {data.new_role.value}"
    }


# --- Endpoint 7: Soft Delete User ---
@router.delete("/users/{user_id}", dependencies=[Depends(require_super_admin)], operation_id="soft_delete_user")
async def soft_delete_user(
    user_id: str,
    reason: str = Query(..., min_length=3, description="Audit reason for deletion"),
    db: AsyncSession = Depends(get_db),
    admin_id: str = Depends(get_current_admin_id)
):
    if user_id == admin_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself.")

    try:
        target_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    target_user = await db.get(UserModel, target_uuid)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if target_user.deleted_at:
        raise HTTPException(status_code=400, detail="User is already deleted.")

    # Soft Delete Action
    target_user.deleted_at = datetime.now(timezone.utc)
    target_user.is_active = False 
    
    audit_log = AdminAuditLogModel(
        admin_id=uuid.UUID(admin_id),
        target_user_id=target_uuid,
        action="USER_SOFT_DELETE",
        details={"deleted_at": str(target_user.deleted_at)},
        reason_note=reason
    )
    
    db.add(audit_log)
    await db.commit()
    
    return {"status": "success", "message": "User soft-deleted successfully."}


# --- Endpoint 8: Feature Flags (Redis Integrated) ---
@router.get(
    "/feature-flags",
    response_model=List[FeatureFlagResponse],
    dependencies=[Depends(require_admin)],
    operation_id="list_feature_flags"
)
@router.post(
    "/feature-flags",
    response_model=FeatureFlagResponse,
    dependencies=[Depends(require_super_admin)],
    operation_id="create_feature_flag"
)
@router.put(
    "/feature-flags/{key}", 
    response_model=FeatureFlagResponse, 
    dependencies=[Depends(require_super_admin)], 
    operation_id="update_feature_flag" 
)
@router.delete(
    "/feature-flags/{key}",
    dependencies=[Depends(require_super_admin)],
    operation_id="delete_feature_flag"
)

# --- Endpoint 9: List Projects ---
@router.get("/projects", response_model=PaginatedProjectResponse, dependencies=[Depends(require_admin)], operation_id="admin_list_projects")
async def list_all_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: Optional[str] = Query(None, description="Filter by User ID"),
    status: Optional[str] = Query(None, description="Filter by Project Status"),
    db: AsyncSession = Depends(get_db)
):
    # Join with User to get owner details
    query = select(ProjectModel, UserModel).join(UserModel, ProjectModel.user_id == UserModel.id)

    if user_id:
        try:
            uid = uuid.UUID(user_id)
            query = query.where(ProjectModel.user_id == uid)
        except ValueError:
            pass
            
    if status:
        query = query.where(ProjectModel.status == status)

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Fetch
    query = query.order_by(desc(ProjectModel.created_at))
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    rows = result.all()

    items = []
    for proj, usr in rows:
        # Determine best identifier
        identifier = usr.email if usr.email else usr.mobile
        
        item = AdminProjectListItem(
            id=proj.id,
            user_id=proj.user_id,
            title=proj.title,
            status=proj.status,
            created_at=proj.created_at,
            updated_at=proj.updated_at,
            user_email_or_mobile=identifier # Make sure your Schema has this field
        )
        items.append(item)

    total_pages = math.ceil(total / page_size) if page_size > 0 else 0

    return PaginatedProjectResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


# --- Endpoint 10: Delete Project ---
@router.delete("/projects/{project_id}", dependencies=[Depends(require_super_admin)], operation_id="admin_delete_project")
async def admin_delete_project(
    project_id: str,
    reason: str = Query(..., min_length=3),
    db: AsyncSession = Depends(get_db),
    admin_id: str = Depends(get_current_admin_id)
):
    try:
        pid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    project = await db.get(ProjectModel, pid)
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.deleted_at = datetime.now(timezone.utc)
    
    audit = AdminAuditLogModel(
        admin_id=uuid.UUID(admin_id),
        target_user_id=project.user_id,
        action="PROJECT_FORCE_DELETE",
        details={"project_title": project.title, "project_id": str(pid)},
        reason_note=reason
    )
    db.add(audit)
    
    await db.commit()
    return {"status": "success", "message": "Project deleted by admin"}
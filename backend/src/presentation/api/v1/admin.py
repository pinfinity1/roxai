from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func, desc
from jose import jwt
import uuid
import math

# Dependencies
from backend.src.presentation.dependencies import (
    require_admin, 
    require_super_admin, 
    get_current_admin_id
)

# DB Setup
from backend.src.infrastructure.db.setup import get_db
from backend.src.infrastructure.db.models.audit import AdminAuditLogModel
from backend.src.infrastructure.db.models.user import UserModel
from backend.src.domain.entities.user import UserRole

# Auth Config
from backend.src.application.services.auth_service import SECRET_KEY, ALGORITHM

# Schemas
from backend.src.presentation.schemas.admin import (
    CreditAdjustmentRequest, 
    ImpersonateRequest, 
    ImpersonateResponse,
    PaginatedUserResponse,
    AdminUserListItem
)

router = APIRouter(prefix="/admin", tags=["Admin Console"])

# --- Endpoint 0: List Users (Search & Filter) ---
@router.get("/users", response_model=PaginatedUserResponse, dependencies=[Depends(require_admin)], operation_id="list_users")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    query: Optional[str] = Query(None, description="Search by email, mobile, name or ID"),
    role: Optional[UserRole] = Query(None, description="Filter by user role"),
    db: AsyncSession = Depends(get_db)
):
    """
    دریافت لیست کاربران با قابلیت جستجو و فیلتر.
    """
    
    # 1. ساخت کوئری پایه
    sql_query = select(UserModel)

    # 2. اعمال فیلتر جستجو (Search)
    if query:
        search_term = f"%{query}%"
        filters = [
            UserModel.email.ilike(search_term),
            UserModel.mobile.ilike(search_term),
            UserModel.first_name.ilike(search_term),
            UserModel.last_name.ilike(search_term)
        ]
        
        try:
            uuid_obj = uuid.UUID(query)
            filters.append(UserModel.id == uuid_obj)
        except ValueError:
            pass
            
        sql_query = sql_query.where(or_(*filters))

    # 3. اعمال فیلتر نقش (Role)
    if role:
        sql_query = sql_query.where(UserModel.role == role)

    # 4. محاسبه تعداد کل (Count)
    count_query = select(func.count()).select_from(sql_query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # 5. اعمال ترتیب و صفحه‌بندی
    sql_query = sql_query.order_by(desc(UserModel.created_at))
    sql_query = sql_query.offset((page - 1) * page_size).limit(page_size)

    # 6. اجرای نهایی
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
    # ✅ FIX 1: ابتدا کاربر را پیدا می‌کنیم
    target_user = await db.get(UserModel, data.target_user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # ✅ FIX 2: اعمال تغییر روی موجودی واقعی کاربر
    target_user.credit += data.amount
    
    # ثبت لاگ امنیتی
    audit_log = AdminAuditLogModel(
        admin_id=uuid.UUID(admin_id),
        target_user_id=data.target_user_id,
        action="CREDIT_ADJUSTMENT",
        details={
            "amount": data.amount,
            "new_balance": target_user.credit # ثبت موجودی جدید در لاگ برای اطمینان
        },
        reason_note=data.reason_note
    )
    
    db.add(audit_log)
    # چون target_user را از سشن گرفتیم و تغییر دادیم، با commit تغییراتش ذخیره می‌شود
    await db.commit()
    
    return {"status": "success", "message": "Credit adjusted and audit log created.", "new_balance": target_user.credit}


# --- Endpoint 2: Impersonation (Support & Admin) ---
@router.post("/auth/impersonate", response_model=ImpersonateResponse, dependencies=[Depends(require_admin)], operation_id="impersonate_user")
async def impersonate_user(
    data: ImpersonateRequest,
    db: AsyncSession = Depends(get_db),
    admin_id: str = Depends(get_current_admin_id)
):
    """
    تولید یک توکن موقت برای ورود به حساب کاربر بدون نیاز به پسورد.
    """
    
    # ✅ FIX 3: بررسی وجود کاربر و گرفتن نقش واقعی او
    target_user = await db.get(UserModel, data.target_user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    # ثبت لاگ
    audit_log = AdminAuditLogModel(
        admin_id=uuid.UUID(admin_id),
        target_user_id=data.target_user_id,
        action="IMPERSONATE_SESSION",
        details={"target_user": str(data.target_user_id)},
        reason_note=data.reason
    )
    db.add(audit_log)
    await db.commit()

    # تولید توکن
    expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode = {
        "sub": str(data.target_user_id),
        # ✅ FIX 4: استفاده از نقش واقعی کاربر به جای "free"
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
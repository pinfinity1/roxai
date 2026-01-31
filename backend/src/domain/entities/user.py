from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import UUID, uuid4
from enum import Enum
from typing import Optional

class UserRole(str, Enum):
    GUEST = "guest"
    FREE = "free"
    PRO = "pro"
    SUPPORT = "support" 
    ADMIN = "admin"

class AuthMethod(str, Enum):
    MOBILE = "mobile"
    EMAIL = "email"
    GOOGLE = "google"

@dataclass
class User:
    id: UUID = field(default_factory=uuid4)
    email: Optional[str] = None
    mobile: Optional[str] = None
    hashed_password: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole = UserRole.FREE
    credit: int = 0
    is_verified: bool = False
    is_active: bool = True
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    last_login_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
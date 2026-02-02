from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import UUID, uuid4
from typing import Optional, List
from enum import Enum

@dataclass
class FeatureFlag:
    id: UUID = field(default_factory=uuid4)
    key: str = "" 
    description: Optional[str] = None
    is_enabled: bool = False 
    
    target_users: List[str] = field(default_factory=list) 
    target_roles: List[str] = field(default_factory=list)
    
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
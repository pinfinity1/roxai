import uuid  
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.src.domain.interfaces import IUserRepository
from backend.src.domain.entities.user import User
from backend.src.infrastructure.db.models.user import UserModel

class SqlAlchemyUserRepository(IUserRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(select(UserModel).where(UserModel.email == email))
        user_model = result.scalars().first()
        
        if user_model:
            return self._to_entity(user_model)
        return None

    async def get_by_mobile(self, mobile: str) -> Optional[User]:
        result = await self.session.execute(select(UserModel).where(UserModel.mobile == mobile))
        user_model = result.scalars().first()
        
        if user_model:
            return self._to_entity(user_model)
        return None
    

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        result = await self.session.execute(select(UserModel).where(UserModel.id == user_id))
        user_model = result.scalars().first()
        
        if user_model:
            return self._to_entity(user_model)
        return None

    async def create(self, user: User) -> User:
        user_model = UserModel(
            id=user.id,
            email=user.email,
            mobile=user.mobile,
            password_hash=user.hashed_password,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            is_verified=user.is_verified,
            is_active=user.is_active,
            credit=user.credit,       
            avatar_url=user.avatar_url,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        
        self.session.add(user_model)
        await self.session.commit()
        await self.session.refresh(user_model)
        
        return self._to_entity(user_model)
    
    async def update(self, user: User) -> User:
        result = await self.session.execute(select(UserModel).where(UserModel.id == user.id))
        user_model = result.scalars().first()
        
        if not user_model:
            raise ValueError(f"User with id {user.id} not found to update")
        
        user_model.first_name = user.first_name
        user_model.last_name = user.last_name
        user_model.avatar_url = user.avatar_url
        user_model.password_hash = user.hashed_password
        user_model.role = user.role             
        user_model.is_active = user.is_active   
        user_model.is_verified = user.is_verified
        user_model.credit = user.credit         
        user_model.updated_at = user.updated_at
        user_model.deleted_at = user.deleted_at
        user_model.last_login_at = user.last_login_at

        await self.session.commit()
        await self.session.refresh(user_model)
        
        return self._to_entity(user_model)

    def _to_entity(self, model: UserModel) -> User:
        return User(
            id=model.id,
            email=model.email,
            mobile=model.mobile,
            hashed_password=model.password_hash,
            first_name=model.first_name,
            last_name=model.last_name,
            avatar_url=model.avatar_url,
            role=model.role,
            credit=model.credit,       
            is_verified=model.is_verified,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
            last_login_at=model.last_login_at,
            deleted_at=model.deleted_at
        )
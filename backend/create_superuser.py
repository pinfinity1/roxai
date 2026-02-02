# مسیر فایل: backend/create_superuser.py

import asyncio
import os
import sys
from dotenv import load_dotenv

sys.path.append(os.getcwd())
load_dotenv()

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from pwdlib import PasswordHash

from backend.src.infrastructure.db.setup import engine
from src.infrastructure.repositories.user import SqlAlchemyUserRepository
from backend.src.domain.entities.user import User, UserRole

async def create_super_admin():
    email = os.getenv("SUPER_ADMIN_EMAIL")
    password = os.getenv("SUPER_ADMIN_PASSWORD")

    if not email or not password:
        print("❌ Error: Env vars not set.")
        return

    async_session_factory = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session_factory() as session:
        repo = SqlAlchemyUserRepository(session)
        pwd_context = PasswordHash.recommended()
        
        print(f"🔍 Checking for: {email}")
        existing_user = await repo.get_by_email(email)
        
        hashed_pw = pwd_context.hash(password)

        if existing_user:
            print(f"♻️ User exists. Updating password & role from .env...")
            
            # بروزرسانی فیلدها روی موجودیت فعلی
            existing_user.hashed_password = hashed_pw
            existing_user.role = UserRole.ADMIN
            existing_user.is_verified = True
            existing_user.is_active = True
            
            # ذخیره تغییرات
            await repo.update(existing_user)
            print(f"✅ User Updated! Password reset to matches .env")
        else:
            print("🛠 Creating new Super Admin...")
            admin_user = User(
                email=email,
                hashed_password=hashed_pw,
                first_name="Super",
                last_name="Admin",
                role=UserRole.ADMIN,
                is_verified=True,
                is_active=True
            )
            await repo.create(admin_user)
            print(f"✅ Super Admin created successfully.")

if __name__ == "__main__":
    try:
        asyncio.run(create_super_admin())
    except Exception as e:
        print(f"❌ Error: {e}")
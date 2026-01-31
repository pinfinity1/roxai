import asyncio
import sys
import os
import random
from uuid import uuid4
from faker import Faker
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

# افزودن مسیر ریشه پروژه
sys.path.append(os.getcwd())

# تغییر ایمپورت: فقط engine را می‌گیریم
from backend.src.infrastructure.db.setup import engine
from backend.src.infrastructure.db.models.user import UserModel
from backend.src.domain.entities.user import UserRole
from pwdlib import PasswordHash

fake = Faker(['fa_IR', 'en_US'])
pwd_context = PasswordHash.recommended()

async def seed_fake_users():
    # ساختن دستی Factory مثل create_superuser.py
    async_session_factory = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session_factory() as db:
        print("🌱 Generating 50 fake users for testing...")
        
        users = []
        # رمز عبور ثابت برای تست راحت‌تر
        hashed_pw = pwd_context.hash("12345678") 
        
        for i in range(50):
            # تنوع در داده‌ها
            role = random.choice([UserRole.FREE, UserRole.FREE, UserRole.PRO])
            is_active = random.random() > 0.1 # 90% فعال
            credit = random.choice([0, 50000, 200000, -10000, 1000000])
            
            user = UserModel(
                id=uuid4(),
                email=f"user_{i}_{random.randint(1000,9999)}@example.com",
                mobile=f"09{random.randint(100000000, 999999999)}",
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                password_hash=hashed_pw,
                role=role,
                is_active=is_active,
                is_verified=True,
                credit=credit,
                avatar_url=None
            )
            users.append(user)
        
        db.add_all(users)
        await db.commit()
        print("✅ 50 Fake Users added successfully!")

if __name__ == "__main__":
    try:
        asyncio.run(seed_fake_users())
    except Exception as e:
        print(f"❌ Error: {e}")
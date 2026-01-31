import redis.asyncio as redis
from typing import Optional
import os

class RedisClient:
    def __init__(self):
        # خواندن آدرس از متغیرهای محیطی یا استفاده از مقدار پیش‌فرض داکر
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.client = redis.from_url(redis_url, encoding="utf-8", decode_responses=True)

    async def check_rate_limit(self, identifier: str, limit: int = 3, window_seconds: int = 600) -> bool:
        """
        بررسی محدودیت ارسال (Leaky Bucket ساده)
        اگر تعداد درخواست‌ها بیشتر از limit باشد، False برمی‌گرداند.
        """
        key = f"roxai:auth:rl:{identifier}"
        current = await self.client.incr(key)
        
        if current == 1:
            await self.client.expire(key, window_seconds)
            
        return current <= limit

    async def set_otp(self, identifier: str, code: str, ttl_seconds: int = 120):
        """ذخیره کد OTP با زمان انقضا"""
        key = f"roxai:auth:otp:{identifier}"
        await self.client.set(key, code, ex=ttl_seconds)

    async def get_otp(self, identifier: str) -> Optional[str]:
        """بازیابی کد OTP"""
        key = f"roxai:auth:otp:{identifier}"
        return await self.client.get(key)

    async def delete_otp(self, identifier: str):
        key = f"roxai:auth:otp:{identifier}"
        await self.client.delete(key)

    async def save_verification_token(self, token: str, identifier: str, ttl_seconds: int = 900):
        """
        ذخیره توکن موقت (Verification Token) که نشان می‌دهد کاربر موبایل/ایمیلش را تایید کرده.
        """
        key = f"roxai:auth:token:{token}"
        await self.client.set(key, identifier, ex=ttl_seconds)

    async def get_identifier_by_token(self, token: str) -> Optional[str]:
        key = f"roxai:auth:token:{token}"
        return await self.client.get(key)
        
    async def delete_verification_token(self, token: str):
        key = f"roxai:auth:token:{token}"
        await self.client.delete(key)

    async def set_refresh_token(self, token: str, user_id: str, ttl_seconds: int = 604800): # 7 روز
        """ذخیره رفرش توکن برای کاربر"""
        key = f"roxai:auth:rt:{token}"
        await self.client.set(key, user_id, ex=ttl_seconds)

    async def get_user_id_by_refresh_token(self, token: str) -> Optional[str]:
        """یافتن کاربر صاحب این رفرش توکن"""
        key = f"roxai:auth:rt:{token}"
        return await self.client.get(key)
    
    async def delete_refresh_token(self, token: str):
        """حذف رفرش توکن (سوزاندن توکن)"""
        key = f"roxai:auth:rt:{token}"
        await self.client.delete(key)


    async def add_to_blacklist(self, jti: str, ttl_seconds: int):
        """اضافه کردن JTI توکن اکسس به لیست سیاه"""
        key = f"roxai:auth:bl:{jti}"
        await self.client.set(key, "true", ex=ttl_seconds)

    async def is_token_blacklisted(self, jti: str) -> bool:
        """چک کردن اینکه آیا توکن در لیست سیاه است یا نه"""
        key = f"roxai:auth:bl:{jti}"
        result = await self.client.get(key)
        return result is not None

    async def close(self):
        await self.client.close()
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
        # پارامتر دوم را identifier نامیدم تا مشخص باشد چه چیزی ذخیره می‌شود
        await self.client.set(key, identifier, ex=ttl_seconds)

    # ✅ تغییر نام این متد برای هماهنگی با AuthService
    async def get_identifier_by_token(self, token: str) -> Optional[str]:
        key = f"roxai:auth:token:{token}"
        return await self.client.get(key)
        
    async def delete_verification_token(self, token: str):
        key = f"roxai:auth:token:{token}"
        await self.client.delete(key)

    async def close(self):
        await self.client.close()
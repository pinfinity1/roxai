import redis.asyncio as redis
from typing import Optional
import os

_redis_instance: Optional["RedisClient"] = None

class RedisClient:
    def __init__(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.pool = redis.ConnectionPool.from_url(redis_url, encoding="utf-8", decode_responses=True)
        self.client = redis.Redis(connection_pool=self.pool)

    @classmethod
    def get_instance(cls) -> "RedisClient":
        """این متد تضمین می‌کند که در کل برنامه فقط یک کلاینت داریم"""
        global _redis_instance
        if _redis_instance is None:
            _redis_instance = cls()
        return _redis_instance
    
    async def close(self):
        await self.client.aclose()
        await self.pool.disconnect()
        
    async def check_rate_limit(self, identifier: str, limit: int = 3, window_seconds: int = 600) -> bool:
        key = f"roxai:auth:rl:{identifier}"
        current = await self.client.incr(key)
        if current == 1:
            await self.client.expire(key, window_seconds)
        return current <= limit

    async def set_otp(self, identifier: str, code: str, ttl_seconds: int = 120):
        key = f"roxai:auth:otp:{identifier}"
        await self.client.set(key, code, ex=ttl_seconds)

    async def get_otp(self, identifier: str) -> Optional[str]:
        key = f"roxai:auth:otp:{identifier}"
        return await self.client.get(key)

    async def delete_otp(self, identifier: str):
        key = f"roxai:auth:otp:{identifier}"
        await self.client.delete(key)

    async def save_verification_token(self, token: str, identifier: str, ttl_seconds: int = 900):
        key = f"roxai:auth:token:{token}"
        await self.client.set(key, identifier, ex=ttl_seconds)

    async def get_identifier_by_token(self, token: str) -> Optional[str]:
        key = f"roxai:auth:token:{token}"
        return await self.client.get(key)
        
    async def delete_verification_token(self, token: str):
        key = f"roxai:auth:token:{token}"
        await self.client.delete(key)

    async def set_refresh_token(self, token: str, user_id: str, ttl_seconds: int = 604800):
        key = f"roxai:auth:rt:{token}"
        await self.client.set(key, user_id, ex=ttl_seconds)

    async def get_user_id_by_refresh_token(self, token: str) -> Optional[str]:
        key = f"roxai:auth:rt:{token}"
        return await self.client.get(key)
    
    async def delete_refresh_token(self, token: str):
        key = f"roxai:auth:rt:{token}"
        await self.client.delete(key)

    async def add_to_blacklist(self, jti: str, ttl_seconds: int):
        key = f"roxai:auth:bl:{jti}"
        await self.client.set(key, "true", ex=ttl_seconds)

    async def is_token_blacklisted(self, jti: str) -> bool:
        key = f"roxai:auth:bl:{jti}"
        result = await self.client.get(key)
        return result is not None
        
    async def get_feature_flag(self, key: str) -> Optional[dict]:
        cache_key = f"roxai:flags:{key}"
        data = await self.client.hgetall(cache_key)
        if not data: return None
        import json
        return {
            "is_enabled": data.get("is_enabled") == "1",
            "target_users": json.loads(data.get("target_users", "[]")),
            "target_roles": json.loads(data.get("target_roles", "[]"))
        }

    async def set_feature_flag(self, key: str, is_enabled: bool, users: list, roles: list):
        import json
        cache_key = f"roxai:flags:{key}"
        mapping = {
            "is_enabled": "1" if is_enabled else "0",
            "target_users": json.dumps(users),
            "target_roles": json.dumps(roles)
        }
        await self.client.hset(cache_key, mapping=mapping)
        await self.client.expire(cache_key, 3600)
        
    async def delete_feature_flag_cache(self, key: str):
        cache_key = f"roxai:flags:{key}"
        await self.client.delete(cache_key)
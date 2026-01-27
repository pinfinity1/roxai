import uuid
import secrets
import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from pwdlib import PasswordHash
from jose import jwt

# Google Auth Libraries
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from backend.src.domain.interfaces import IUserRepository
from backend.src.domain.entities.user import User, UserRole
from backend.src.infrastructure.cache.redis_client import RedisClient
from backend.src.presentation.schemas.auth import (
    IdentifyRequest, IdentifyResponse, RegisterRequest, 
    LoginRequest, TokenResponse, GoogleLoginRequest ,UserShortInfo
)
# ✅ ایمپورت جدید
from backend.src.application.dtos.service_result import ServiceResult

# تنظیمات امنیتی
SECRET_KEY = os.getenv("SECRET_KEY", "YOUR_SUPER_SECRET_KEY_CHANGE_THIS")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class AuthService:
    def __init__(self, user_repo: IUserRepository, redis_client: RedisClient):
        self.user_repo = user_repo
        self.redis = redis_client
        self.pwd_context = PasswordHash.recommended()

    async def identify_user(self, data: IdentifyRequest) -> IdentifyResponse:
        identifier = data.identifier
        
        if "@" in identifier:
            auth_type = "email"
            user = await self.user_repo.get_by_email(identifier)
        else:
            auth_type = "mobile"
            identifier = self._normalize_mobile(identifier)
            user = await self.user_repo.get_by_mobile(identifier)

        if not user:
            next_step = "register"
        elif not user.hashed_password:
            next_step = "otp"
        else:
            next_step = "password"

        return IdentifyResponse(
            exists=bool(user),
            detected_type=auth_type,
            next_step=next_step,
            masked_identifier=self._mask_identifier(identifier, auth_type)
        )

    async def send_otp(self, identifier: str) -> str:
        if "@" not in identifier:
            identifier = self._normalize_mobile(identifier)

        is_allowed = await self.redis.check_rate_limit(identifier)
        if not is_allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many attempts. Please try again later."
            )

        otp_code = str(secrets.randbelow(900000) + 100000)
        await self.redis.set_otp(identifier, otp_code)

        print(f"⚠️ [MOCK SMS] To {identifier}: Your Code is {otp_code}")
        return "OTP sent successfully"

    async def verify_otp(self, identifier: str, code: str) -> str:
        if "@" not in identifier:
            identifier = self._normalize_mobile(identifier)

        cached_code = await self.redis.get_otp(identifier)
        
        if not cached_code or cached_code != code:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP code.")

        # تولید توکن موقت (UUID)
        verification_token = str(uuid.uuid4())
        # ذخیره در ردیس: کلید=توکن، مقدار=شماره/ایمیل
        await self.redis.save_verification_token(verification_token, identifier)
        await self.redis.delete_otp(identifier)

        return verification_token

    async def register_user(self, data: RegisterRequest):
        # ✅ اصلاح مهم: بررسی توکن از ردیس (نه JWT)
        # چون در verify_otp ما یک UUID ساختیم و در ردیس ذخیره کردیم
        identifier = await self.redis.get_identifier_by_token(data.verification_token)
        
        if not identifier:
            return ServiceResult(False, "Invalid or expired verification token", status_code=400)

        # هش کردن رمز عبور
        hashed_pw = self.pwd_context.hash(data.password)

        # بررسی وجود کاربر (برای ادغام)
        existing_user = None
        if "@" in identifier:
            existing_user = await self.user_repo.get_by_email(identifier)
        else:
            existing_user = await self.user_repo.get_by_mobile(identifier)

        user_entity = None

        if existing_user:
            # ✅ سناریوی Merge
            print(f"♻️ Merging account for: {identifier}")
            existing_user.hashed_password = hashed_pw
            existing_user.first_name = data.first_name or existing_user.first_name
            existing_user.last_name = data.last_name or existing_user.last_name
            existing_user.is_verified = True
            
            user_entity = await self.user_repo.update(existing_user)
        else:
            # ✅ سناریوی Create
            print(f"🆕 Creating new account for: {identifier}")
            new_user = User(
                email=identifier if "@" in identifier else None,
                mobile=identifier if "@" not in identifier else None,
                hashed_password=hashed_pw,
                first_name=data.first_name,
                last_name=data.last_name,
                is_verified=True
            )
            user_entity = await self.user_repo.create(new_user)

        # پاک کردن توکن موقت بعد از استفاده موفق
        # await self.redis.delete_verification_token(data.verification_token)

        tokens = self._create_tokens(user_entity)
        return ServiceResult(True, tokens)

    async def login_user(self, data: LoginRequest) -> TokenResponse:
        identifier = data.identifier
        
        if "@" in identifier:
            user = await self.user_repo.get_by_email(identifier)
        else:
            identifier = self._normalize_mobile(identifier)
            user = await self.user_repo.get_by_mobile(identifier)

        if not user or not user.hashed_password:
            raise HTTPException(status_code=400, detail="Invalid credentials")

        if not self.pwd_context.verify(data.password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Invalid credentials")

        return self._create_tokens(user)

    async def login_with_google(self, data: GoogleLoginRequest) -> TokenResponse:
        google_user_data = self._verify_google_token(data.id_token)
        email = google_user_data["email"]

        user = await self.user_repo.get_by_email(email)

        if user:
            if not user.is_verified:
                user.is_verified = True
                await self.user_repo.update(user) # بروزرسانی وضعیت وریفای
            return self._create_tokens(user)
        else:
            new_user = User(
                email=email,
                first_name=google_user_data.get("given_name"),
                last_name=google_user_data.get("family_name"),
                is_verified=True,
                is_active=True,
                role=UserRole.FREE,
                hashed_password=None
            )
            created_user = await self.user_repo.create(new_user)
            return self._create_tokens(created_user)

    def _create_tokens(self, user: User) -> TokenResponse:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        expire = datetime.utcnow() + access_token_expires
        
        to_encode = {"sub": str(user.id), "role": user.role.value}
        to_encode.update({"exp": expire})
        
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        
        # ساخت آبجکت اطلاعات کاربر
        user_info = UserShortInfo(
            id=user.id,
            email=user.email,
            mobile=user.mobile,
            first_name=user.first_name,
            last_name=user.last_name,
            avatar_url=user.avatar_url,
            role=user.role.value
        )
        
        return TokenResponse(
            access_token=encoded_jwt,
            refresh_token="mock_refresh_token",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            role=user.role.value,
            user=user_info 
        )

    def _normalize_mobile(self, mobile: str) -> str:
        if mobile.startswith("+98"):
            return "0" + mobile[3:]
        return mobile

    def _mask_identifier(self, identifier: str, auth_type: str) -> str:
        if auth_type == "email":
            try:
                name, domain = identifier.split("@")
                return f"{name[:2]}***@{domain}"
            except:
                return identifier
        else:
            return f"{identifier[:4]}***{identifier[-4:]}"

    def _verify_google_token(self, token: str) -> dict:
        client_id = os.getenv("AUTH_GOOGLE_ID")
        if not client_id:
            # در حالت لوکال برای جلوگیری از خطا موقتاً هشدار می‌دهیم
            print("⚠️ WARNING: AUTH_GOOGLE_ID is not set in env.")
            # raise HTTPException(status_code=500, detail="Google Client ID not configured")

        try:
            # برای تست واقعی حتما کلاینت آیدی باید باشد، اما فعلا passthrough می‌کنیم اگر نبود
            if client_id:
                id_info = google_id_token.verify_oauth2_token(
                    token, 
                    google_requests.Request(), 
                    client_id
                )
                if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                    raise ValueError('Wrong issuer.')
                return id_info
            else:
                # فقط برای جلوگیری از کرش در محیط بدون env
                return {"email": "test@gmail.com", "given_name": "Test", "family_name": "User"}
            
        except ValueError as e:
            print(f"❌ Google Token Verification Failed: {e}")
            raise HTTPException(status_code=401, detail="Invalid Google Token")
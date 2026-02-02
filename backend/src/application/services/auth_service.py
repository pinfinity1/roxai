import uuid
import secrets
import os
from datetime import datetime, timedelta , timezone
from typing import Optional

from fastapi import HTTPException, status, Depends
from pwdlib import PasswordHash
from jose import jwt, JWTError

# Google Auth Libraries
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from google.auth.exceptions import TransportError

from backend.src.domain.interfaces import IUserRepository, ISmsService, IEmailService
from backend.src.domain.entities.user import User, UserRole
from backend.src.infrastructure.cache.redis_client import RedisClient
from backend.src.presentation.schemas.auth import (
    ChangePasswordRequest, IdentifyRequest, IdentifyResponse, RegisterRequest, 
    LoginRequest, TokenResponse, GoogleLoginRequest, UpdateProfileRequest, UserShortInfo,
    RefreshTokenRequest 
)
from backend.src.application.dtos.service_result import ServiceResult

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

class AuthService:

    def __init__(
        self, 
        user_repo: IUserRepository, 
        redis_client: RedisClient, 
        sms_service: ISmsService,
        email_service: IEmailService
    ):
        self.user_repo = user_repo
        self.redis = redis_client
        self.sms_service = sms_service
        self.email_service = email_service
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
        is_email = "@" in identifier
        if not is_email:
            identifier = self._normalize_mobile(identifier)

        # Rate Limiting for OTP
        is_allowed = await self.redis.check_rate_limit(f"otp:{identifier}", limit=3, window_seconds=600)
        if not is_allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="تعداد درخواست‌ها بیش از حد مجاز است. لطفا دقایقی دیگر تلاش کنید."
            )

        otp_code = str(secrets.randbelow(900000) + 100000)
        await self.redis.set_otp(identifier, otp_code)

        if is_email:
            await self.email_service.send_otp(identifier, otp_code)
        else:
            await self.sms_service.send_otp(identifier, otp_code)
        
        return "OTP sent successfully"

    async def verify_otp(self, identifier: str, code: str) -> str:
        if "@" not in identifier:
            identifier = self._normalize_mobile(identifier)

        cached_code = await self.redis.get_otp(identifier)
        
        if not cached_code or cached_code != code:
            raise HTTPException(status_code=400, detail="کد وارد شده نامعتبر یا منقضی شده است.")

        verification_token = str(uuid.uuid4())
        await self.redis.save_verification_token(verification_token, identifier)
        await self.redis.delete_otp(identifier)

        return verification_token

    async def register_user(self, data: RegisterRequest):
        identifier = await self.redis.get_identifier_by_token(data.verification_token)
        
        if not identifier:
            return ServiceResult(False, "توکن تایید نامعتبر است", status_code=400)

        hashed_pw = self.pwd_context.hash(data.password)

        existing_user = None
        if "@" in identifier:
            existing_user = await self.user_repo.get_by_email(identifier)
        else:
            existing_user = await self.user_repo.get_by_mobile(identifier)

        if existing_user:
            existing_user.hashed_password = hashed_pw
            if data.first_name: existing_user.first_name = data.first_name
            if data.last_name: existing_user.last_name = data.last_name
            existing_user.is_verified = True
            user_entity = await self.user_repo.update(existing_user)
        else:
            new_user = User(
                email=identifier if "@" in identifier else None,
                mobile=identifier if "@" not in identifier else None,
                hashed_password=hashed_pw,
                first_name=data.first_name,
                last_name=data.last_name,
                is_verified=True,
                role=UserRole.FREE
            )
            user_entity = await self.user_repo.create(new_user)

        tokens = await self._create_tokens(user_entity) # Await added
        return ServiceResult(True, tokens)

    async def login_user(self, data: LoginRequest) -> TokenResponse:
        identifier = data.identifier
        
        is_allowed = await self.redis.check_rate_limit(f"login:{identifier}", limit=5, window_seconds=60)
        if not is_allowed:
             raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="تعداد تلاش‌های ناموفق زیاد است. لطفا ۱ دقیقه صبر کنید."
            )

        if "@" in identifier:
            user = await self.user_repo.get_by_email(identifier)
        else:
            identifier = self._normalize_mobile(identifier)
            user = await self.user_repo.get_by_mobile(identifier)

        if not user or not user.hashed_password:
            raise HTTPException(status_code=400, detail="نام کاربری یا رمز عبور اشتباه است")
        
        
        if user.deleted_at is not None:
            raise HTTPException(
                status_code=400, 
                detail="حساب کاربری شما حذف شده است."
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=403, 
                detail="حساب کاربری شما مسدود شده است. لطفا با پشتیبانی تماس بگیرید."
            )

        if not self.pwd_context.verify(data.password, user.hashed_password):
            raise HTTPException(status_code=400, detail="نام کاربری یا رمز عبور اشتباه است")

        return await self._create_tokens(user)

    async def login_with_google(self, data: GoogleLoginRequest) -> TokenResponse:
        google_user_data = self._verify_google_token(data.id_token)
        email = google_user_data["email"]
        
        user = await self.user_repo.get_by_email(email)
        if not user:
             new_user = User(
                email=email,
                first_name=google_user_data.get("given_name"),
                last_name=google_user_data.get("family_name"),
                is_verified=True,
                role=UserRole.FREE,
                hashed_password=None # گوگل پسورد ندارد
            )
             user = await self.user_repo.create(new_user)

        return await self._create_tokens(user)


    async def refresh_access_token(self, data: RefreshTokenRequest) -> TokenResponse:
        # 1. جستجو در ردیس
        user_id_str = await self.redis.get_user_id_by_refresh_token(data.refresh_token)
        
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="نشست کاربری نامعتبر یا منقضی شده است."
            )

        # 2. دریافت کاربر از دیتابیس
        try:
            user_id = uuid.UUID(user_id_str)
            user = await self.user_repo.get_by_id(user_id)
        except ValueError:
             raise HTTPException(status_code=401, detail="اطلاعات کاربر مخدوش است.")

        if not user or not user.is_active:
             raise HTTPException(status_code=401, detail="کاربر یافت نشد یا غیرفعال شده است.")

        # 3. چرخش توکن (Token Rotation) - امنیتی
        # توکن قبلی را می‌سوزانیم
        await self.redis.delete_refresh_token(data.refresh_token)
        
        # 4. تولید توکن‌های جدید
        return await self._create_tokens(user)

    async def logout(self, token: str):
        """
        خروج کاربر: توکن را در بلک‌لیست ردیس می‌گذارد.
        """
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            jti = payload.get("jti")
            exp = payload.get("exp")
            
            if jti and exp:
                current_time = datetime.now(timezone.utc).timestamp()
                ttl = int(exp - current_time)
                
                if ttl > 0:
                    # ✅ استفاده از متد جدید در RedisClient
                    await self.redis.add_to_blacklist(jti, ttl)
                    
        except JWTError:
            pass 
        
        return True

    async def _create_tokens(self, user: User) -> TokenResponse:
        # 1. Access Token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        expire = datetime.now(timezone.utc) + access_token_expires
        jti = str(uuid.uuid4())
        
        to_encode = {
            "sub": str(user.id), 
            "role": user.role.value,
            "jti": jti 
        }
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        
        # 2. Refresh Token (تولید رشته امن و ذخیره در ردیس)
        refresh_token_str = secrets.token_urlsafe(64) 
        
        await self.redis.set_refresh_token(
            token=refresh_token_str, 
            user_id=str(user.id),
            ttl_seconds=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
        )
        
        user_info = UserShortInfo(
            id=user.id,
            email=user.email,
            mobile=user.mobile,
            first_name=user.first_name,
            last_name=user.last_name,
            avatar_url=user.avatar_url,
            role=user.role.value,
            credit=user.credit
        )
        
        return TokenResponse(
            access_token=encoded_jwt,
            refresh_token=refresh_token_str, 
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            role=user.role.value,
            user=user_info 
        )

    # ... Helper methods ...
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
        try:
            if client_id:
                id_info = google_id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
                return id_info
        except Exception as e:
            if os.getenv("ENV_MODE") == "production":
                raise HTTPException(status_code=400, detail="Google token validation failed")
            
            print(f"⚠️ Google Auth Failed (Dev Mode Fallback): {e}")
            return {"email": "test@gmail.com", "given_name": "Test", "family_name": "User"}
        
    async def update_profile(self, user_id: uuid.UUID, data: UpdateProfileRequest) -> UserShortInfo:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # ۱. آپدیت اطلاعات پایه
        if data.first_name is not None: user.first_name = data.first_name
        if data.last_name is not None: user.last_name = data.last_name
        if data.avatar_url is not None: user.avatar_url = data.avatar_url

        # ۲. آپدیت ایمیل (با چک کردن یکتایی)
        if data.email is not None and data.email != user.email:
            existing = await self.user_repo.get_by_email(data.email)
            if existing:
                raise HTTPException(status_code=409, detail="این ایمیل قبلاً ثبت شده است.")
            user.email = data.email
            # نکته امنیتی: در نسخه نهایی اینجا باید is_verified = False شود و ایمیل تایید ارسال شود.

        # ۳. آپدیت موبایل (با چک کردن یکتایی)
        if data.mobile is not None:
            mobile_normalized = self._normalize_mobile(data.mobile)
            if mobile_normalized != user.mobile:
                existing = await self.user_repo.get_by_mobile(mobile_normalized)
                if existing:
                    raise HTTPException(status_code=409, detail="این شماره موبایل قبلاً ثبت شده است.")
                user.mobile = mobile_normalized

        updated_user = await self.user_repo.update(user)

        return UserShortInfo(
            id=updated_user.id,
            email=updated_user.email,
            mobile=updated_user.mobile,
            first_name=updated_user.first_name,
            last_name=updated_user.last_name,
            avatar_url=updated_user.avatar_url,
            role=updated_user.role.value,
            credit=updated_user.credit
        )

    async def change_password(self, user_id: uuid.UUID, data: ChangePasswordRequest):
        """تغییر رمز عبور با بررسی رمز قبلی"""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        if not user.hashed_password:
             raise HTTPException(status_code=400, detail="این حساب رمز عبور ندارد (ورود با گوگل/OTP).")

        # بررسی رمز قدیمی
        if not self.pwd_context.verify(data.old_password, user.hashed_password):
            raise HTTPException(status_code=400, detail="رمز عبور فعلی اشتباه است.")
            
        # هش کردن و ذخیره رمز جدید
        user.hashed_password = self.pwd_context.hash(data.new_password)
        await self.user_repo.update(user)
        
        return ServiceResult(True, "رمز عبور با موفقیت تغییر کرد.")
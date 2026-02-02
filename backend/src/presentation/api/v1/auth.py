import uuid
from fastapi import APIRouter, Depends, status, HTTPException
from backend.src.presentation.schemas.auth import (
    IdentifyRequest, IdentifyResponse, 
    SendOtpRequest, UserShortInfo, VerifyOtpRequest, VerifyOtpResponse,
    RegisterRequest, LoginRequest, TokenResponse, 
    GoogleLoginRequest, RefreshTokenRequest , UpdateProfileRequest, 
    ChangePasswordRequest
)
from backend.src.application.services.auth_service import AuthService

from backend.src.presentation.dependencies import verify_token_security, get_user_repo

from backend.src.presentation.api.dependencies import get_auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post(
    "/identify", 
    response_model=IdentifyResponse,
    operation_id="identify_user"
)
async def identify_user(
    data: IdentifyRequest,
    service: AuthService = Depends(get_auth_service)
):
    return await service.identify_user(data)

@router.post(
    "/otp/send",
    operation_id="send_otp"
)
async def send_otp(
    data: SendOtpRequest,
    service: AuthService = Depends(get_auth_service)
):
    """ارسال کد تایید پیامکی"""
    return await service.send_otp(data.identifier)

@router.post(
    "/otp/verify", 
    response_model=VerifyOtpResponse,
    operation_id="verify_otp"
)
async def verify_otp(
    data: VerifyOtpRequest,
    service: AuthService = Depends(get_auth_service)
):
    """بررسی کد تایید و دریافت توکن ثبت‌نام"""
    token = await service.verify_otp(data.identifier, data.code)
    return VerifyOtpResponse(verification_token=token)

@router.post(
    "/register", 
    response_model=TokenResponse,
    operation_id="register_user"
)
async def register_user(
    data: RegisterRequest,
    service: AuthService = Depends(get_auth_service)
):
    """ثبت‌نام نهایی و دریافت توکن ورود"""
    result = await service.register_user(data)
    
    if not result.success:
        raise HTTPException(
            status_code=result.status_code, 
            detail=result.message
        )
    return result.data

@router.post(
    "/login", 
    response_model=TokenResponse,
    operation_id="login_user"
)
async def login_user(
    data: LoginRequest,
    service: AuthService = Depends(get_auth_service)
):
    """ورود با رمز عبور"""
    return await service.login_user(data)

@router.post(
    "/google",
    response_model=TokenResponse,
    operation_id="login_with_google"
)
async def login_with_google(
    data: GoogleLoginRequest,
    service: AuthService = Depends(get_auth_service)
):
    """ورود یا ثبت‌نام با حساب گوگل (OAuth)"""
    return await service.login_with_google(data)

@router.post(
    "/refresh",
    response_model=TokenResponse,
    operation_id="refresh_token"
)
async def refresh_token(
    data: RefreshTokenRequest,
    service: AuthService = Depends(get_auth_service)
):
    """تمدید نشست کاربری با استفاده از رفرش توکن"""
    return await service.refresh_access_token(data)


@router.get("/me/credit", response_model=int, operation_id="get_my_credit")
async def get_my_credit(
    token: dict = Depends(verify_token_security),
    user_repo = Depends(get_user_repo)
):
    """دریافت موجودی اعتبار فعلی کاربر (برای آپدیت UI)"""
    user_id = uuid.UUID(token.get("sub"))
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user.credit


@router.patch("/me", response_model=UserShortInfo, operation_id="update_my_profile")
async def update_my_profile(
    data: UpdateProfileRequest,
    token: dict = Depends(verify_token_security),
    service: AuthService = Depends(get_auth_service)
):
    """
    Update profile info (Name, Avatar, Email, Mobile).
    Checks for unique email/mobile before updating.
    """
    user_id = uuid.UUID(token.get("sub"))
    return await service.update_profile(user_id, data)

@router.post("/change-password", operation_id="change_password")
async def change_password(
    data: ChangePasswordRequest,
    token: dict = Depends(verify_token_security),
    service: AuthService = Depends(get_auth_service)
):
    """
    Securely change the account password.
    Requires the old password for verification.
    """
    user_id = uuid.UUID(token.get("sub"))
    result = await service.change_password(user_id, data)
    return {"status": "success", "message": result.message}
from fastapi import APIRouter, Depends, status, HTTPException
from backend.src.presentation.schemas.auth import (
    IdentifyRequest, IdentifyResponse, 
    SendOtpRequest, VerifyOtpRequest, VerifyOtpResponse,
    RegisterRequest, LoginRequest, TokenResponse, 
    GoogleLoginRequest
)
from backend.src.application.services.auth_service import AuthService

# Dependency Placeholder
def get_auth_service():
    raise NotImplementedError("Dependency not injected")

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
    # ✅ اصلاح مهم: دریافت ServiceResult و باز کردن آن
    result = await service.register_user(data)
    
    if not result.success:
        raise HTTPException(
            status_code=result.status_code, 
            detail=result.message
        )
    
    # اگر موفق بود، فقط بخش data (که TokenResponse است) برگردانده می‌شود
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
from pydantic import BaseModel, Field, field_validator, EmailStr 
from typing import Optional, Literal
import re
import uuid  # ✅ این خط اضافه شد

IR_MOBILE_REGEX = r"^(?:\+98|0)?9\d{9}$"

# --- Shared Models ---
class IdentifyRequest(BaseModel):
    identifier: str = Field(..., description="Email or Iranian Mobile Number")

    @field_validator("identifier")
    @classmethod
    def validate_identifier(cls, v):
        is_email = "@" in v
        is_mobile = re.match(IR_MOBILE_REGEX, v)
        if not is_email and not is_mobile:
            raise ValueError("Invalid format. Enter a valid Email or Iran Mobile number.")
        return v

class IdentifyResponse(BaseModel):
    exists: bool
    detected_type: Literal["email", "mobile"]
    next_step: Literal["password", "otp", "register"]
    masked_identifier: str 

# ✅ مدل جدید اطلاعات کاربر
class UserShortInfo(BaseModel):
    id: uuid.UUID
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str

# --- OTP Flow ---
class SendOtpRequest(BaseModel):
    identifier: str

class VerifyOtpRequest(BaseModel):
    identifier: str
    code: str = Field(..., min_length=4, max_length=6)

class VerifyOtpResponse(BaseModel):
    verification_token: str
    message: str = "OTP verified successfully. Proceed to registration."

# --- Registration Flow ---
class RegisterRequest(BaseModel):
    verification_token: str = Field(..., description="Token received from verify-otp endpoint")
    password: str = Field(..., min_length=8)
    first_name: Optional[str] = None
    last_name: Optional[str] = None

# --- Login Flow ---
class LoginRequest(BaseModel):
    identifier: str
    password: str

# --- Google Auth Flow ---
class GoogleLoginRequest(BaseModel):
    id_token: str = Field(..., description="Google ID Token received from Frontend")

# ✅ آپدیت شده برای شامل شدن user info
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    role: str
    user: UserShortInfo  
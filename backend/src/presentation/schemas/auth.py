from pydantic import BaseModel, Field, field_validator, EmailStr 
from typing import Optional, Literal
import re
import uuid 

IR_MOBILE_REGEX = r"^(?:\+98|0)?9\d{9}$"

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

class UserShortInfo(BaseModel):
    id: uuid.UUID
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    credit: int = 0

class SendOtpRequest(BaseModel):
    identifier: str

class VerifyOtpRequest(BaseModel):
    identifier: str
    code: str = Field(..., min_length=4, max_length=6)

class VerifyOtpResponse(BaseModel):
    verification_token: str
    message: str = "OTP verified successfully. Proceed to registration."

class RegisterRequest(BaseModel):
    verification_token: str = Field(..., description="Token received from verify-otp endpoint")
    password: str = Field(..., min_length=8)
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class LoginRequest(BaseModel):
    identifier: str
    password: str

class GoogleLoginRequest(BaseModel):
    id_token: str = Field(..., description="Google ID Token received from Frontend")

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    role: str
    user: UserShortInfo  


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = Field(None, min_length=2, max_length=50)
    last_name: Optional[str] = Field(None, min_length=2, max_length=50)
    avatar_url: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v):
        if v and not re.match(IR_MOBILE_REGEX, v):
             raise ValueError("Invalid mobile number format")
        return v

class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., min_length=8, description="رمز عبور فعلی")
    new_password: str = Field(..., min_length=8, description="رمز عبور جدید")
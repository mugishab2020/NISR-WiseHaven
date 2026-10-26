"""User and authentication request/response schemas."""

import re
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, EmailStr


class UserRegistrationRequest(BaseModel):
    """Request schema for user registration."""
    phone_number: str = Field(..., description="Phone number in Rwanda format (+250...)")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, max_length=128, description="User password")
    emergency_contact: str | None = Field(None, description="Emergency contact phone number")
    
    @field_validator('phone_number', 'emergency_contact')
    @classmethod
    def validate_phone_number(cls, v):
        """Validate phone number format for Rwanda (+250[0-9]{9})."""
        if v is None:
            return v
        pattern = r'^\+250[0-9]{9}$'
        if not re.match(pattern, v):
            raise ValueError('Phone number must be in format +250XXXXXXXXX')
        return v


class VerifyOTPRequest(BaseModel):
    """Request schema for OTP verification."""
    email: EmailStr = Field(..., description="Email address")
    otp_code: str = Field(..., min_length=6, max_length=6, description="6-digit OTP code")
    purpose: str = Field(..., description="OTP purpose (REGISTER, LOGIN, etc.)")


class LoginRequest(BaseModel):
    """Request schema for user login."""
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., description="User password")


class LoginResponse(BaseModel):
    """Response schema for login requiring MFA."""
    requires_mfa: bool = Field(..., description="Whether MFA is required")
    message: str = Field(..., description="Response message")
    user_id: str | None = Field(None, description="User ID (only if MFA required)")


class TokenResponse(BaseModel):
    """Response schema for authentication token."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 86400  # 24 hours in seconds


class UserResponse(BaseModel):
    """Response schema for user information."""
    id: str
    phone_number: str
    email: str
    created_at: datetime
    first_sweep_percentage: float
    preferred_notification: str
    emergency_contact: str | None
    is_active: bool
    mfa_enabled: bool
    emergency_vault_id: str | None = None


class UserUpdateRequest(BaseModel):
    """Request schema for updating user settings."""
    first_sweep_percentage: float | None = Field(None, ge=5.0, le=10.0, description="Emergency vault percentage (5-10%)")
    preferred_notification: str | None = Field(None, description="Notification preference (EMAIL, SMS, BOTH)")
    emergency_contact: str | None = Field(None, description="Emergency contact phone number")
    
    @field_validator('emergency_contact')
    @classmethod
    def validate_phone_number(cls, v):
        """Validate phone number format."""
        if v is None:
            return v
        pattern = r'^\+250[0-9]{9}$'
        if not re.match(pattern, v):
            raise ValueError('Phone number must be in format +250XXXXXXXXX')
        return v


class EnableMFARequest(BaseModel):
    """Request schema for enabling MFA."""
    password: str = Field(..., description="Current password for confirmation")


class ResendOTPRequest(BaseModel):
    """Request schema for resending OTP."""
    email: EmailStr = Field(..., description="Email address")
    purpose: str = Field(..., description="OTP purpose")

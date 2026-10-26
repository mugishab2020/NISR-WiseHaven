"""Authentication controller with registration and login endpoints."""

from fastapi import APIRouter, HTTPException, status, Depends
from views.user_schemas import (
    UserRegistrationRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    UserUpdateRequest,
    VerifyOTPRequest,
    LoginResponse,
    EnableMFARequest,
    ResendOTPRequest
)
from services.auth_service import AuthService
from models import db
from utils.dependencies import get_current_user_id

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(request: UserRegistrationRequest):
    """Register a new user account.
    
    Creates a new user with:
    - Unique phone number and email
    - Hashed password (bcrypt)
    - Automatic Emergency Vault creation
    - Default 5% first-sweep percentage
    - Sends OTP to email for verification
    """
    service = AuthService(db)
    
    try:
        user = await service.register_user(
            phone_number=request.phone_number,
            email=request.email,
            password=request.password,
            emergency_contact=request.emergency_contact
        )
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(request: VerifyOTPRequest):
    """Verify OTP after registration.
    
    Completes registration by verifying the OTP sent to email during signup.
    Issues JWT token upon successful verification.
    """
    service = AuthService(db)
    
    try:
        result = await service.verify_registration_otp(
            email=request.email,
            otp_code=request.otp_code
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=LoginResponse | TokenResponse)
async def login(request: LoginRequest):
    """Authenticate user (Step 1: Credentials validation).
    
    If MFA is enabled: Returns LoginResponse with requires_mfa=True and sends OTP to email
    If MFA is disabled: Returns TokenResponse with JWT token
    """
    service = AuthService(db)
    
    try:
        result = await service.login_step1_credentials(
            email=request.email,
            password=request.password
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


@router.post("/verify-login-otp", response_model=TokenResponse)
async def verify_login_otp(request: VerifyOTPRequest):
    """Verify OTP for login (Step 2: MFA verification).
    
    Completes login by verifying the OTP sent to email during login attempt.
    Issues JWT token upon successful verification.
    """
    service = AuthService(db)
    
    try:
        result = await service.login_step2_verify_otp(
            email=request.email,
            otp_code=request.otp_code
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


@router.post("/resend-otp", status_code=status.HTTP_200_OK)
async def resend_otp(request: ResendOTPRequest):
    """Resend OTP code to email.
    
    Generates and sends a new OTP for the specified purpose.
    Useful when OTP expires or user doesn't receive it.
    """
    service = AuthService(db)
    
    try:
        result = await service.resend_otp(
            email=request.email,
            purpose=request.purpose
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/mfa/enable", status_code=status.HTTP_200_OK)
async def enable_mfa(
    request: EnableMFARequest,
    user_id: str = Depends(get_current_user_id)
):
    """Enable Multi-Factor Authentication.
    
    Requires password confirmation. Sends test OTP upon successful enablement.
    """
    service = AuthService(db)
    
    try:
        result = await service.enable_mfa(
            user_id=user_id,
            password=request.password
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


@router.post("/mfa/disable", status_code=status.HTTP_200_OK)
async def disable_mfa(
    request: EnableMFARequest,
    user_id: str = Depends(get_current_user_id)
):
    """Disable Multi-Factor Authentication.
    
    Requires password confirmation.
    """
    service = AuthService(db)
    
    try:
        result = await service.disable_mfa(
            user_id=user_id,
            password=request.password
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(user_id: str = Depends(get_current_user_id)):
    """Refresh JWT token.
    
    Requires valid JWT token in Authorization header.
    Returns new token with extended expiration.
    """
    from utils.security import generate_jwt_token
    
    # Get user
    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Generate new token
    access_token = generate_jwt_token(user.id, user.email)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 86400
    }


@router.patch("/users/me", response_model=UserResponse)
async def update_user_settings(
    request: UserUpdateRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Update user settings.
    
    Allows updating:
    - first_sweep_percentage (5-10%)
    - preferred_notification (SMS, PUSH, BOTH)
    - emergency_contact
    """
    service = AuthService(db)
    
    try:
        user = await service.update_user_settings(
            user_id=user_id,
            first_sweep_percentage=request.first_sweep_percentage,
            preferred_notification=request.preferred_notification,
            emergency_contact=request.emergency_contact
        )
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/users/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    password: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete user account with ledger preservation.
    
    Anonymizes personal data while preserving transaction history.
    Requires password confirmation.
    """
    service = AuthService(db)
    
    try:
        await service.delete_account(user_id=user_id, password=password)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

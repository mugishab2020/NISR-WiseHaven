"""User profile controller for Clerk-authenticated users."""

from fastapi import APIRouter, HTTPException, status, Depends
from models import get_db
from prisma import Prisma
from services.user_sync_service import UserSyncService
from utils.dependencies import get_current_user_id
from pydantic import BaseModel, Field


router = APIRouter(prefix="/users", tags=["Users"])


class UserProfileResponse(BaseModel):
    """User profile response."""
    id: str
    clerk_id: str
    email: str | None
    phone_number: str | None
    first_sweep_percentage: float
    preferred_notification: str
    emergency_contact: str | None
    is_active: bool


class UpdateProfileRequest(BaseModel):
    """Update user profile request."""
    first_sweep_percentage: float | None = Field(None, ge=0.05, le=0.10, description="First-sweep percentage (5-10%)")
    preferred_notification: str | None = Field(None, description="Notification preference: EMAIL, SMS, PUSH, BOTH")
    emergency_contact: str | None = Field(None, description="Emergency contact information")


@router.get("/me", response_model=UserProfileResponse)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Get current authenticated user profile.
    
    Returns user profile from local database.
    If user doesn't exist (first time), creates it from Clerk data.
    """
    try:
        user_sync_service = UserSyncService(db)
        user = await user_sync_service.get_user_profile(user_id)
        return UserProfileResponse(**user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user profile: {str(e)}"
        )


@router.patch("/me", response_model=UserProfileResponse)
async def update_current_user(
    request: UpdateProfileRequest,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Update current user profile.
    
    Can update:
    - first_sweep_percentage (5-10%)
    - preferred_notification (EMAIL, SMS, PUSH, BOTH)
    - emergency_contact
    
    Note: Email and phone_number are managed by Clerk and cannot be updated here.
    """
    try:
        user_sync_service = UserSyncService(db)
        user = await user_sync_service.update_user_profile(
            clerk_id=user_id,
            first_sweep_percentage=request.first_sweep_percentage,
            preferred_notification=request.preferred_notification,
            emergency_contact=request.emergency_contact
        )
        return UserProfileResponse(**user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user profile: {str(e)}"
        )


@router.delete("/me")
async def deactivate_current_user(
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Deactivate current user account (soft delete).
    
    Preserves transaction history but marks account as inactive.
    Does NOT delete Clerk account - user must do that in Clerk.
    """
    try:
        user_sync_service = UserSyncService(db)
        result = await user_sync_service.deactivate_user(user_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deactivate user: {str(e)}"
        )

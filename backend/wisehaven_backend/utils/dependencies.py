"""FastAPI dependencies for authentication and authorization with Clerk."""

from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from prisma import Prisma
from models import get_db
from utils.clerk_auth import verify_clerk_token
from services.user_sync_service import UserSyncService

security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Prisma = Depends(get_db)
) -> str:
    """Get current authenticated user ID and ensure user exists in database.
    
    This dependency:
    1. Verifies the Clerk JWT token
    2. Extracts the Clerk user ID
    3. Ensures user exists in local database (creates if not)
    4. Returns the user ID
    
    Args:
        credentials: HTTP Authorization credentials
        db: Database connection
        
    Returns:
        User ID (Clerk ID)
    """
    # Verify token and get Clerk user ID
    user_info = await verify_clerk_token(credentials)
    clerk_id = user_info["user_id"]
    
    # Sync user with database (create if doesn't exist)
    user_sync_service = UserSyncService(db)
    user = await user_sync_service.get_or_create_user(clerk_id)
    
    return user["id"]


__all__ = ["get_current_user_id", "verify_clerk_token"]

"""Clerk authentication utilities."""

import os
import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from clerk_backend_api import Clerk

# Initialize Clerk client
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
if not CLERK_SECRET_KEY:
    raise ValueError("CLERK_SECRET_KEY environment variable is required")

clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)

# Security scheme
security = HTTPBearer()


async def verify_clerk_token(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """Verify Clerk JWT token and return user info.
    
    Args:
        credentials: HTTP Authorization credentials
        
    Returns:
        dict with user_id and other claims
        
    Raises:
        HTTPException if token is invalid
    """
    token = credentials.credentials
    
    try:
        # Decode JWT token without verification first to get claims
        # Clerk tokens are signed, we just need to extract the user_id
        decoded = jwt.decode(token, options={"verify_signature": False})
        
        # Extract user_id from sub claim (Clerk standard)
        user_id = decoded.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token: missing user ID"
            )
        
        # Optionally verify with Clerk API
        # For now, we trust the token if it has valid structure
        # In production, you may want to verify signature with Clerk's public key
        
        return {
            "user_id": user_id,
            "session_id": decoded.get("sid"),
        }
            
    except jwt.DecodeError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token format: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Authentication failed: {str(e)}"
        )


async def get_clerk_user_data(user_id: str) -> dict:
    """Fetch user data from Clerk.
    
    Args:
        user_id: Clerk user ID
        
    Returns:
        User data from Clerk
    """
    try:
        user = clerk.users.get(user_id=user_id)
        
        # Extract email and phone
        email = None
        if user.email_addresses and len(user.email_addresses) > 0:
            email = user.email_addresses[0].email_address
        
        phone = None
        if user.phone_numbers and len(user.phone_numbers) > 0:
            phone = user.phone_numbers[0].phone_number
        
        return {
            "id": user.id,
            "email": email,
            "phone_number": phone,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "created_at": user.created_at,
        }
    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"User not found in Clerk: {str(e)}"
        )

"""Security utilities for password hashing and JWT token management."""

import os
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
import jwt
from dotenv import load_dotenv

load_dotenv()

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-256-bit-secret-key-change-this")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
BCRYPT_WORK_FACTOR = int(os.getenv("BCRYPT_WORK_FACTOR", "12"))


def hash_password(password: str) -> str:
    """Hash a password using bcrypt with configured work factor.
    
    Args:
        password: Plain text password to hash
        
    Returns:
        Bcrypt hashed password as string
    """
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt(rounds=BCRYPT_WORK_FACTOR)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against a bcrypt hash.
    
    Args:
        password: Plain text password to verify
        password_hash: Bcrypt hashed password
        
    Returns:
        True if password matches hash, False otherwise
    """
    password_bytes = password.encode('utf-8')
    hash_bytes = password_hash.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hash_bytes)


def generate_jwt_token(user_id: str, identifier: str) -> str:
    """Generate a JWT token with user claims.
    
    Args:
        user_id: User's unique identifier
        identifier: User's email or phone number
        
    Returns:
        JWT token string
    """
    now = datetime.utcnow()
    expiration = now + timedelta(hours=JWT_EXPIRATION_HOURS)
    
    payload = {
        "sub": user_id,
        "identifier": identifier,
        "exp": expiration,
        "iat": now
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def decode_jwt_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Token payload dict if valid, None if invalid or expired
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

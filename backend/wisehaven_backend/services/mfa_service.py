"""Multi-Factor Authentication service for OTP generation and validation."""

import random
import string
from datetime import datetime, timedelta, timezone
from prisma import Prisma


class MFAService:
    """Service for MFA/OTP operations."""
    
    def __init__(self, db: Prisma):
        self.db = db
        self.otp_length = 6
        self.otp_expiry_minutes = 10
        self.max_attempts = 3
    
    def _get_utc_now(self) -> datetime:
        """Get current UTC time with timezone info.
        
        Returns:
            Timezone-aware datetime in UTC
        """
        return datetime.now(timezone.utc)
    
    def generate_otp_code(self) -> str:
        """Generate a 6-digit OTP code.
        
        Returns:
            6-digit OTP code as string
        """
        return ''.join(random.choices(string.digits, k=self.otp_length))
    
    async def create_otp(
        self,
        user_id: str,
        purpose: str
    ) -> dict:
        """Create and store OTP code for user.
        
        Args:
            user_id: User's ID
            purpose: OTP purpose (LOGIN, REGISTER, RESET_PASSWORD, EMERGENCY_WITHDRAWAL)
            
        Returns:
            dict with code and expiry information
        """
        # Generate OTP
        code = self.generate_otp_code()
        expires_at = self._get_utc_now() + timedelta(minutes=self.otp_expiry_minutes)
        
        # Invalidate any existing unused OTPs for this purpose
        await self.db.otpcode.update_many(
            where={
                "user_id": user_id,
                "purpose": purpose,
                "is_used": False
            },
            data={"is_used": True}
        )
        
        # Create new OTP
        otp = await self.db.otpcode.create(
            data={
                "user_id": user_id,
                "code": code,
                "purpose": purpose,
                "expires_at": expires_at,
                "is_used": False,
                "attempts": 0
            }
        )
        
        return {
            "code": code,
            "expires_at": expires_at,
            "otp_id": otp.id
        }
    
    async def verify_otp(
        self,
        user_id: str,
        code: str,
        purpose: str
    ) -> tuple[bool, str]:
        """Verify OTP code.
        
        Args:
            user_id: User's ID
            code: OTP code to verify
            purpose: Expected OTP purpose
            
        Returns:
            Tuple of (is_valid: bool, message: str)
        """
        # Find the OTP
        otp = await self.db.otpcode.find_first(
            where={
                "user_id": user_id,
                "purpose": purpose,
                "is_used": False
            },
            order={"created_at": "desc"}
        )
        
        if not otp:
            return False, "No valid OTP found"
        
        # Check if expired
        if otp.expires_at < self._get_utc_now():
            await self.db.otpcode.update(
                where={"id": otp.id},
                data={"is_used": True}
            )
            return False, "OTP has expired"
        
        # Check attempts
        if otp.attempts >= self.max_attempts:
            await self.db.otpcode.update(
                where={"id": otp.id},
                data={"is_used": True}
            )
            return False, "Maximum attempts exceeded"
        
        # Increment attempts
        await self.db.otpcode.update(
            where={"id": otp.id},
            data={"attempts": otp.attempts + 1}
        )
        
        # Verify code
        if otp.code != code:
            return False, f"Invalid OTP code. {self.max_attempts - otp.attempts - 1} attempts remaining"
        
        # Mark as used
        await self.db.otpcode.update(
            where={"id": otp.id},
            data={"is_used": True}
        )
        
        return True, "OTP verified successfully"
    
    async def enable_mfa(self, user_id: str) -> None:
        """Enable MFA for user.
        
        Args:
            user_id: User's ID
        """
        await self.db.user.update(
            where={"id": user_id},
            data={"mfa_enabled": True}
        )
    
    async def disable_mfa(self, user_id: str) -> None:
        """Disable MFA for user.
        
        Args:
            user_id: User's ID
        """
        await self.db.user.update(
            where={"id": user_id},
            data={"mfa_enabled": False, "mfa_secret": None}
        )
    
    async def is_mfa_enabled(self, user_id: str) -> bool:
        """Check if MFA is enabled for user.
        
        Args:
            user_id: User's ID
            
        Returns:
            True if MFA is enabled, False otherwise
        """
        user = await self.db.user.find_unique(where={"id": user_id})
        return user.mfa_enabled if user else False
    
    async def cleanup_expired_otps(self) -> int:
        """Clean up expired OTP codes.
        
        Returns:
            Number of OTPs deleted
        """
        result = await self.db.otpcode.delete_many(
            where={
                "expires_at": {"lt": self._get_utc_now()}
            }
        )
        return result

"""Authentication and user management service with MFA support."""

from datetime import datetime
from prisma import Prisma
from utils.security import hash_password, verify_password, generate_jwt_token
from services.mfa_service import MFAService
from services.email_service import EmailService


class AuthService:
    """Service for user authentication and management with MFA."""
    
    def __init__(self, db: Prisma):
        self.db = db
        self.mfa_service = MFAService(db)
        self.email_service = EmailService(db)
    
    async def register_user(
        self,
        phone_number: str,
        email: str,
        password: str,
        emergency_contact: str | None = None
    ) -> dict:
        """Register a new user with OTP verification.
        
        Args:
            phone_number: User's phone number (unique)
            email: User's email address (unique)
            password: Plain text password (will be hashed)
            emergency_contact: Optional emergency contact number
            
        Returns:
            dict with user info and OTP sent status
            
        Raises:
            ValueError if phone number or email already exists
        """
        # Check if phone number already exists
        existing_user = await self.db.user.find_unique(
            where={"phone_number": phone_number}
        )
        if existing_user:
            raise ValueError("Phone number already registered")
        
        # Check if email already exists
        existing_email = await self.db.user.find_unique(
            where={"email": email}
        )
        if existing_email:
            raise ValueError("Email already registered")
        
        # Hash password
        password_hash = hash_password(password)
        
        # Create user
        user = await self.db.user.create(
            data={
                "phone_number": phone_number,
                "email": email,
                "password_hash": password_hash,
                "emergency_contact": emergency_contact,
                "first_sweep_percentage": 0.05,  # Default 5%
                "preferred_notification": "EMAIL",
                "is_active": True,
                "mfa_enabled": False  # MFA optional on registration
            }
        )
        
        # Create Emergency Vault automatically
        emergency_vault = await self.db.envelope.create(
            data={
                "user_id": user.id,
                "name": "Emergency Vault",
                "category": "Custom",
                "description": "Automatic emergency savings (first-sweep allocation)",
                "balance": 0,
                "is_active": True,
                "is_emergency_vault": True
            }
        )
        
        # Create Wallet automatically
        wallet = await self.db.wallet.create(
            data={
                "user_id": user.id,
                "balance": 0,
                "total_deposited": 0,
                "total_allocated": 0,
                "version": 0
            }
        )
        
        # Generate and send OTP for email verification
        otp_data = await self.mfa_service.create_otp(user.id, "REGISTER")
        await self.email_service.send_otp_email(
            email=email,
            otp_code=otp_data["code"],
            purpose="REGISTER"
        )
        
        return {
            "id": user.id,
            "phone_number": user.phone_number,
            "email": user.email,
            "created_at": user.created_at,
            "first_sweep_percentage": user.first_sweep_percentage,
            "preferred_notification": user.preferred_notification,
            "emergency_contact": user.emergency_contact,
            "is_active": user.is_active,
            "mfa_enabled": user.mfa_enabled,
            "emergency_vault_id": emergency_vault.id,
            "otp_sent": True,
            "requires_verification": True
        }
    
    async def verify_registration_otp(
        self,
        email: str,
        otp_code: str
    ) -> dict:
        """Verify OTP and activate user account.
        
        Args:
            email: User's email address
            otp_code: OTP code to verify
            
        Returns:
            dict with verification status and token
        """
        # Find user
        user = await self.db.user.find_unique(where={"email": email})
        if not user:
            raise ValueError("User not found")
        
        # Verify OTP
        is_valid, message = await self.mfa_service.verify_otp(
            user_id=user.id,
            code=otp_code,
            purpose="REGISTER"
        )
        
        if not is_valid:
            raise ValueError(message)
        
        # Send welcome email
        await self.email_service.send_welcome_email(email, email)
        
        # Generate JWT token
        access_token = generate_jwt_token(user.id, user.email)
        
        return {
            "verified": True,
            "message": "Registration completed successfully",
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 86400
        }
    
    async def login_step1_credentials(
        self,
        email: str,
        password: str
    ) -> dict:
        """Step 1: Validate credentials and send OTP if MFA enabled.
        
        Args:
            email: User's email address
            password: Plain text password
            
        Returns:
            dict indicating if MFA is required or token if MFA disabled
        """
        # Find user by email
        user = await self.db.user.find_unique(
            where={"email": email}
        )
        
        if not user or not user.is_active:
            raise ValueError("Invalid credentials")
        
        # Verify password
        if not verify_password(password, user.password_hash):
            raise ValueError("Invalid credentials")
        
        # Check if MFA is enabled
        if user.mfa_enabled:
            # Generate and send OTP
            otp_data = await self.mfa_service.create_otp(user.id, "LOGIN")
            await self.email_service.send_otp_email(
                email=email,
                otp_code=otp_data["code"],
                purpose="LOGIN"
            )
            
            return {
                "requires_mfa": True,
                "message": "OTP sent to your email. Please verify to complete login.",
                "user_id": user.id
            }
        else:
            # MFA not enabled, issue token directly
            access_token = generate_jwt_token(user.id, user.email)
            return {
                "requires_mfa": False,
                "message": "Login successful",
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": 86400
            }
    
    async def login_step2_verify_otp(
        self,
        email: str,
        otp_code: str
    ) -> dict:
        """Step 2: Verify OTP and issue token.
        
        Args:
            email: User's email address
            otp_code: OTP code to verify
            
        Returns:
            dict with access token
        """
        # Find user
        user = await self.db.user.find_unique(where={"email": email})
        if not user:
            raise ValueError("User not found")
        
        # Verify OTP
        is_valid, message = await self.mfa_service.verify_otp(
            user_id=user.id,
            code=otp_code,
            purpose="LOGIN"
        )
        
        if not is_valid:
            raise ValueError(message)
        
        # Generate JWT token
        access_token = generate_jwt_token(user.id, user.email)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 86400
        }
    
    async def resend_otp(
        self,
        email: str,
        purpose: str
    ) -> dict:
        """Resend OTP code.
        
        Args:
            email: User's email address
            purpose: OTP purpose
            
        Returns:
            dict with status
        """
        user = await self.db.user.find_unique(where={"email": email})
        if not user:
            raise ValueError("User not found")
        
        # Generate new OTP
        otp_data = await self.mfa_service.create_otp(user.id, purpose)
        
        # Send email
        await self.email_service.send_otp_email(
            email=email,
            otp_code=otp_data["code"],
            purpose=purpose
        )
        
        return {
            "success": True,
            "message": "OTP resent successfully"
        }
    
    async def enable_mfa(
        self,
        user_id: str,
        password: str
    ) -> dict:
        """Enable MFA for user after password confirmation.
        
        Args:
            user_id: User's ID
            password: Password for confirmation
            
        Returns:
            dict with status and OTP sent
        """
        # Verify password
        user = await self.db.user.find_unique(where={"id": user_id})
        if not user or not verify_password(password, user.password_hash):
            raise ValueError("Invalid password")
        
        # Enable MFA
        await self.mfa_service.enable_mfa(user_id)
        
        # Send confirmation OTP
        otp_data = await self.mfa_service.create_otp(user_id, "LOGIN")
        await self.email_service.send_otp_email(
            email=user.email,
            otp_code=otp_data["code"],
            purpose="LOGIN"
        )
        
        return {
            "mfa_enabled": True,
            "message": "MFA enabled successfully. Test OTP sent to your email."
        }
    
    async def disable_mfa(
        self,
        user_id: str,
        password: str
    ) -> dict:
        """Disable MFA for user.
        
        Args:
            user_id: User's ID
            password: Password for confirmation
            
        Returns:
            dict with status
        """
        user = await self.db.user.find_unique(where={"id": user_id})
        if not user or not verify_password(password, user.password_hash):
            raise ValueError("Invalid password")
        
        await self.mfa_service.disable_mfa(user_id)
        
        return {
            "mfa_enabled": False,
            "message": "MFA disabled successfully"
        }
    
    async def update_user_settings(
        self,
        user_id: str,
        first_sweep_percentage: float | None = None,
        preferred_notification: str | None = None,
        emergency_contact: str | None = None
    ) -> dict:
        """Update user settings.
        
        Args:
            user_id: User's ID
            first_sweep_percentage: Emergency vault percentage (5-10%)
            preferred_notification: Notification preference
            emergency_contact: Emergency contact number
            
        Returns:
            Updated user info
        """
        update_data = {}
        
        if first_sweep_percentage is not None:
            if not (5.0 <= first_sweep_percentage <= 10.0):
                raise ValueError("First sweep percentage must be between 5% and 10%")
            update_data["first_sweep_percentage"] = first_sweep_percentage
        
        if preferred_notification is not None:
            if preferred_notification not in ["SMS", "PUSH", "BOTH"]:
                raise ValueError("Preferred notification must be SMS, PUSH, or BOTH")
            update_data["preferred_notification"] = preferred_notification
        
        if emergency_contact is not None:
            update_data["emergency_contact"] = emergency_contact
        
        user = await self.db.user.update(
            where={"id": user_id},
            data=update_data
        )
        
        return {
            "id": user.id,
            "phone_number": user.phone_number,
            "email": user.email,
            "created_at": user.created_at,
            "first_sweep_percentage": user.first_sweep_percentage,
            "preferred_notification": user.preferred_notification,
            "emergency_contact": user.emergency_contact,
            "is_active": user.is_active,
            "mfa_enabled": user.mfa_enabled
        }
    
    async def delete_account(self, user_id: str, password: str) -> None:
        """Delete user account with ledger preservation.
        
        Anonymizes personal data while preserving transaction history.
        
        Args:
            user_id: User's ID
            password: Password for confirmation
            
        Raises:
            ValueError if password is incorrect
        """
        # Verify password
        user = await self.db.user.find_unique(where={"id": user_id})
        if not user or not verify_password(password, user.password_hash):
            raise ValueError("Invalid password")
        
        # Anonymize user data
        await self.db.user.update(
            where={"id": user_id},
            data={
                "phone_number": f"DELETED_{user_id[:8]}",
                "emergency_contact": None,
                "is_active": False
            }
        )
        # Transaction ledger is preserved automatically

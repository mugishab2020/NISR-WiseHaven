"""SMS service for sending OTP codes."""

import os
from prisma import Prisma


class SMSService:
    """Service for sending SMS messages."""
    
    def __init__(self, db: Prisma):
        self.db = db
        self.momo_api_enabled = os.getenv("MOMO_API_KEY") != "your-momo-api-key"
    
    async def send_otp_sms(
        self,
        phone_number: str,
        otp_code: str,
        purpose: str
    ) -> bool:
        """Send OTP code via SMS.
        
        Args:
            phone_number: Recipient phone number
            otp_code: OTP code to send
            purpose: Purpose of OTP (for message customization)
            
        Returns:
            True if SMS sent successfully, False otherwise
        """
        # Customize message based on purpose
        messages = {
            "REGISTER": f"Welcome to WiseHaven! Your verification code is: {otp_code}. Valid for 10 minutes.",
            "LOGIN": f"WiseHaven login code: {otp_code}. Valid for 10 minutes. If you didn't request this, contact support.",
            "RESET_PASSWORD": f"WiseHaven password reset code: {otp_code}. Valid for 10 minutes.",
            "EMERGENCY_WITHDRAWAL": f"WiseHaven emergency withdrawal verification: {otp_code}. Valid for 10 minutes."
        }
        
        message = messages.get(purpose, f"Your WiseHaven verification code is: {otp_code}")
        
        # TODO: Integrate with MoMo API for actual SMS sending
        # For now, just log the OTP (development mode)
        if not self.momo_api_enabled:
            print(f"\n{'='*60}")
            print(f"📱 SMS to {phone_number}")
            print(f"Purpose: {purpose}")
            print(f"Message: {message}")
            print(f"{'='*60}\n")
            return True
        
        # In production, call MoMo API here
        # try:
        #     response = await momo_client.send_sms(
        #         to=phone_number,
        #         message=message
        #     )
        #     return response.status == "sent"
        # except Exception as e:
        #     print(f"Failed to send SMS: {e}")
        #     return False
        
        return True
    
    async def send_welcome_sms(self, phone_number: str, user_name: str) -> bool:
        """Send welcome SMS to new user.
        
        Args:
            phone_number: User's phone number
            user_name: User's name or phone number
            
        Returns:
            True if SMS sent successfully
        """
        message = (
            f"Welcome to WiseHaven! Your smart envelope wallet is ready. "
            f"Start saving with automatic emergency fund allocation. "
            f"Visit https://wisehaven.rw for more info."
        )
        
        if not self.momo_api_enabled:
            print(f"\n{'='*60}")
            print(f"📱 Welcome SMS to {phone_number}")
            print(f"Message: {message}")
            print(f"{'='*60}\n")
            return True
        
        # TODO: Integrate with MoMo API
        return True

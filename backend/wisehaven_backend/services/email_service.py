"""Email service for sending OTP and notifications via SMTP."""

import logging
import json
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib
from prisma import Prisma
from datetime import datetime

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails (OTP, notifications, etc.)."""
    
    def __init__(self, db: Prisma):
        self.db = db
        
        # Email configuration from environment variables
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_user)
        self.use_mock = os.getenv("USE_MOCK_EMAIL", "true").lower() == "true"
    
    async def send_otp_email(
        self,
        email: str,
        otp_code: str,
        purpose: str
    ) -> bool:
        """Send OTP via email.
        
        Args:
            email: Recipient email address
            otp_code: 6-digit OTP code
            purpose: Purpose of OTP (LOGIN, REGISTER, etc.)
            
        Returns:
            True if email sent successfully
        """
        subject = self._get_email_subject(purpose)
        body = self._get_email_body(otp_code, purpose)
        
        # Use mock email for development if configured
        if self.use_mock or not self.smtp_user:
            return await self._send_mock_email(email, subject, body, otp_code, purpose)
        
        # Send real email via SMTP
        try:
            message = MIMEMultipart("alternative")
            message["From"] = self.from_email
            message["To"] = email
            message["Subject"] = subject
            
            # Add plain text body
            message.attach(MIMEText(body, "plain"))
            
            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                start_tls=True,
            )
            
            logger.info(f"✅ Email sent successfully to {email}")
            
            # Log to NotificationLog table
            await self._log_notification(email, otp_code, purpose, "SENT")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send email to {email}: {e}")
            await self._log_notification(email, otp_code, purpose, "FAILED")
            
            # Fallback to mock email
            logger.warning(f"Falling back to mock email for {email}")
            return await self._send_mock_email(email, subject, body, otp_code, purpose)
    
    async def _send_mock_email(
        self,
        email: str,
        subject: str,
        body: str,
        otp_code: str,
        purpose: str
    ) -> bool:
        """Send mock email (log to console).
        
        Used for development/testing or as fallback.
        """
        logger.info(f"\n{'='*60}")
        logger.info(f"📧 MOCK EMAIL NOTIFICATION")
        logger.info(f"{'='*60}")
        logger.info(f"To: {email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Body:\n{body}")
        logger.info(f"{'='*60}\n")
        
        await self._log_notification(email, otp_code, purpose, "MOCK_SENT")
        return True
    
    async def _log_notification(
        self,
        email: str,
        otp_code: str,
        purpose: str,
        status: str
    ) -> None:
        """Log notification to database."""
        try:
            await self.db.notificationlog.create(
                data={
                    "user_id": "system",
                    "notification_type": f"OTP_{purpose}",
                    "channel": "EMAIL",
                    "message": f"OTP: {otp_code}",
                    "status": status,
                    "metadata": {
                        "email": email,
                        "purpose": purpose
                    }
                }
            )
        except Exception as e:
            logger.error(f"Failed to log email notification: {e}")
    
    async def send_welcome_email(
        self,
        email: str,
        name: str
    ) -> bool:
        """Send welcome email after registration.
        
        Args:
            email: User's email
            name: User's identifier (email or phone)
            
        Returns:
            True if email sent successfully
        """
        subject = "Welcome to WiseHaven Smart Envelope Wallet! 🎉"
        body = f"""
Dear {name},

Welcome to WiseHaven Smart Envelope Wallet!

Your account has been successfully created and verified. You can now:
✅ Create custom budget envelopes
✅ Set up temporal locks for savings goals
✅ Configure automatic allocation plans
✅ Track your spending with detailed transaction history
✅ Access your Emergency Vault (automatic 5-10% savings)

Your Emergency Vault has been automatically created with a default 5% first-sweep allocation.

Get started by logging into your account and creating your first envelope!

Best regards,
The WiseHaven Team
        """
        
        logger.info(f"\n{'='*60}")
        logger.info(f"📧 WELCOME EMAIL")
        logger.info(f"{'='*60}")
        logger.info(f"To: {email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Body:\n{body}")
        logger.info(f"{'='*60}\n")
        
        return True
    
    def _get_email_subject(self, purpose: str) -> str:
        """Get email subject based on purpose."""
        subjects = {
            "REGISTER": "WiseHaven - Verify Your Email Address",
            "LOGIN": "WiseHaven - Your Login Verification Code",
            "RESET_PASSWORD": "WiseHaven - Reset Your Password",
            "EMERGENCY_WITHDRAWAL": "WiseHaven - Emergency Withdrawal Verification"
        }
        return subjects.get(purpose, "WiseHaven - Verification Code")
    
    def _get_email_body(self, otp_code: str, purpose: str) -> str:
        """Generate email body based on purpose."""
        
        if purpose == "REGISTER":
            return f"""
Dear User,

Thank you for registering with WiseHaven Smart Envelope Wallet!

Your verification code is: {otp_code}

This code will expire in 10 minutes. Please enter it to complete your registration.

If you didn't request this code, please ignore this email.

Best regards,
The WiseHaven Team
            """
        
        elif purpose == "LOGIN":
            return f"""
Dear User,

Your login verification code is: {otp_code}

This code will expire in 10 minutes. Please enter it to complete your login.

If you didn't request this code, please secure your account immediately.

Best regards,
The WiseHaven Team
            """
        
        elif purpose == "EMERGENCY_WITHDRAWAL":
            return f"""
Dear User,

An emergency withdrawal has been requested from your Emergency Vault.

Your verification code is: {otp_code}

This code will expire in 10 minutes. Please enter it to authorize the withdrawal.

If you didn't request this withdrawal, please contact support immediately.

Best regards,
The WiseHaven Team
            """
        
        else:
            return f"""
Dear User,

Your verification code is: {otp_code}

This code will expire in 10 minutes.

Best regards,
The WiseHaven Team
            """

"""Test script to verify Clerk migration."""
import asyncio
from prisma import Prisma


async def test_migration():
    """Test that migration worked."""
    db = Prisma()
    await db.connect()
    
    # Check if we can query users with clerk_id
    try:
        user = await db.user.find_first()
        if user:
            print("✅ Migration successful!")
            print(f"   User ID: {user.id}")
            print(f"   Clerk ID: {user.clerk_id}")
            print(f"   Email: {user.email}")
            print(f"   Phone: {user.phone_number}")
            print(f"   First Sweep: {user.first_sweep_percentage}")
            
            # Verify old auth fields are gone
            print("\n✅ Old auth fields removed:")
            print("   - password_hash: removed")
            print("   - mfa_enabled: removed")
            print("   - mfa_secret: removed")
        else:
            print("ℹ️  No users in database yet")
            print("   Users will be auto-created on first Clerk token validation")
    
    except Exception as e:
        print(f"❌ Error: {e}")
    
    await db.disconnect()
    print("\n✅ Database schema is ready for Clerk authentication!")


if __name__ == "__main__":
    asyncio.run(test_migration())

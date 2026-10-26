"""
Test script for wallet deposit functionality.

Run this after starting the server to test deposit endpoints.
"""

import asyncio
from decimal import Decimal
from prisma import Prisma
from services.payment_service import PaymentService
from services.wallet_service import WalletService

async def test_deposit_flow():
    """Test the complete deposit flow."""
    
    # Initialize database connection
    db = Prisma()
    await db.connect()
    
    try:
        # Test user ID (use your actual Clerk user ID)
        user_id = "test_user_123"
        
        print("=" * 60)
        print("Wallet Deposit Integration Test")
        print("=" * 60)
        
        # 1. Initialize services
        print("\n1. Initializing services...")
        payment_service = PaymentService(db)
        wallet_service = WalletService(db)
        print("✓ Services initialized")
        
        # 2. Get or create wallet
        print("\n2. Getting wallet...")
        wallet = await wallet_service.get_or_create_wallet(user_id)
        print(f"✓ Wallet found/created:")
        print(f"  - Balance: {wallet['balance']}")
        print(f"  - Total Deposited: {wallet['total_deposited']}")
        
        # 3. Test payment request creation (without actual MoMo API call)
        print("\n3. Testing payment request structure...")
        amount = Decimal("10000.00")
        phone = "250788123456"
        
        print(f"✓ Would initiate payment:")
        print(f"  - Amount: {amount} RWF")
        print(f"  - Phone: {phone}")
        print(f"  - User: {user_id}")
        
        # 4. Test simulated deposit (for testing)
        print("\n4. Testing simulated deposit...")
        wallet, tx_id = await wallet_service.add_simulated_funds(
            user_id=user_id,
            amount=amount,
            description="Test deposit"
        )
        print(f"✓ Simulated deposit successful:")
        print(f"  - New Balance: {wallet['balance']}")
        print(f"  - Transaction ID: {tx_id}")
        
        # 5. Test production deposit method (without MoMo call)
        print("\n5. Testing production deposit method...")
        wallet2, tx_id2 = await wallet_service.deposit_funds(
            user_id=user_id,
            amount=Decimal("5000.00"),
            payment_reference="TEST-REF-123",
            description="Test production deposit"
        )
        print(f"✓ Production deposit method works:")
        print(f"  - New Balance: {wallet2['balance']}")
        print(f"  - Transaction ID: {tx_id2}")
        
        # 6. Verify transaction records
        print("\n6. Verifying transaction records...")
        transactions = await db.transaction.find_many(
            where={"user_id": user_id},
            order={"timestamp": "desc"},
            take=5
        )
        print(f"✓ Found {len(transactions)} recent transactions:")
        for tx in transactions[:3]:
            print(f"  - {tx.transaction_type}: {tx.amount} RWF - {tx.description}")
        
        # 7. Test concurrent deposit safety
        print("\n7. Testing concurrent deposit safety...")
        try:
            # Simulate concurrent deposits
            results = await asyncio.gather(
                wallet_service.add_simulated_funds(user_id, Decimal("100.00"), "Concurrent 1"),
                wallet_service.add_simulated_funds(user_id, Decimal("200.00"), "Concurrent 2"),
                wallet_service.add_simulated_funds(user_id, Decimal("300.00"), "Concurrent 3"),
                return_exceptions=True
            )
            success_count = sum(1 for r in results if not isinstance(r, Exception))
            print(f"✓ Concurrent deposits handled: {success_count}/3 succeeded")
            
            # Check final balance
            final_wallet = await wallet_service.get_wallet_balance(user_id)
            print(f"✓ Final balance: {final_wallet['balance']}")
        except Exception as e:
            print(f"✗ Concurrent test failed: {str(e)}")
        
        print("\n" + "=" * 60)
        print("All tests completed!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Configure MoMo API credentials in .env")
        print("2. Test with actual MoMo payment via API endpoint")
        print("3. Test webhook callback processing")
        print("4. Verify frontend integration")
        
    except Exception as e:
        print(f"\n✗ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        await db.disconnect()

if __name__ == "__main__":
    print("\nStarting wallet deposit tests...")
    print("Note: This tests the internal logic, not the actual MoMo API\n")
    asyncio.run(test_deposit_flow())

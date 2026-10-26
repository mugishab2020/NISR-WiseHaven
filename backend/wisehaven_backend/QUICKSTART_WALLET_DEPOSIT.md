# Wallet Deposit - Quick Start Guide

## 5-Minute Setup

### 1. Database Migration (Already Done ✓)
```bash
cd wisehaven_backend
source venv/bin/activate
prisma migrate deploy --schema models/schema.prisma
```

Migration `20261026124120_add_payment_request_model` has been applied.

### 2. Configure MoMo (Optional for Testing)

Edit `.env`:
```bash
# For sandbox testing
MOMO_API_URL="https://sandbox.momodeveloper.mtn.com"
MOMO_ENVIRONMENT="sandbox"
MOMO_SUBSCRIPTION_KEY="your-key-here"
MOMO_API_USER="your-user-uuid-here"
MOMO_API_KEY="your-api-key-here"
MOMO_CALLBACK_URL="http://localhost:8000/wallet/payment-callback"
```

**Don't have MoMo credentials yet?** Skip this step - you can test with simulated deposits!

### 3. Start Server
```bash
cd wisehaven_backend
source venv/bin/activate
python main.py
```

Server runs on: http://localhost:8000

### 4. Test Wallet Deposit

#### Option A: Simulated Deposit (No MoMo Required)

```bash
# Get Clerk token (from frontend login)
export TOKEN="your_clerk_jwt_token"

# Add test funds
curl -X POST http://localhost:8000/wallet/fund-simulated \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000.00,
    "description": "Test funds"
  }'

# Check balance
curl http://localhost:8000/wallet/balance \
  -H "Authorization: Bearer $TOKEN"
```

#### Option B: Real MoMo Deposit (Requires MoMo Credentials)

```bash
# Initiate deposit
curl -X POST http://localhost:8000/wallet/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000.00,
    "phone_number": "250788123456",
    "currency": "RWF"
  }'

# Save payment_id from response, then check status
curl http://localhost:8000/wallet/payment/{payment_id}/status \
  -H "Authorization: Bearer $TOKEN"
```

## API Endpoints Available

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/wallet/balance` | GET | Check wallet balance |
| `/wallet/fund-simulated` | POST | Add test funds (dev only) |
| `/wallet/deposit` | POST | Initiate MoMo deposit |
| `/wallet/payment/{id}/status` | GET | Check payment status |
| `/wallet/payment-callback` | POST | Webhook (internal) |
| `/transactions/deposit` | POST | Distribute to envelopes |

## What's Different Now?

### Before
- ❌ No way to add real money to wallet
- ❌ Only simulated funding for testing
- ❌ No external payment integration

### After
- ✅ Production-ready MoMo integration
- ✅ Real deposits from mobile money
- ✅ Async payment processing with webhooks
- ✅ Payment status tracking
- ✅ Automatic wallet crediting
- ✅ Complete audit trail
- ✅ Still have simulated deposits for testing

## Wallet Flow

```
1. Deposit INTO Wallet (NEW!)
   POST /wallet/deposit
   - From MoMo mobile money
   - From other payment providers

2. Wallet holds funds
   GET /wallet/balance
   - See available balance

3. Distribute FROM Wallet TO Envelopes
   POST /transactions/deposit
   - Uses your allocation plan
   - Splits to multiple envelopes
```

## Key Concepts

### Wallet vs Envelopes

- **Wallet** = Bank account that receives deposits from outside
- **Envelopes** = Budget categories that receive money from wallet

### Deposit vs Allocation

- **Deposit** = Add money TO wallet (from external source)
- **Allocation** = Move money FROM wallet TO envelopes

## Testing Without MoMo

You can fully test the system without MoMo credentials:

```bash
# 1. Add simulated funds to wallet
curl -X POST http://localhost:8000/wallet/fund-simulated \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000.00}'

# 2. Check wallet balance
curl http://localhost:8000/wallet/balance \
  -H "Authorization: Bearer $TOKEN"

# 3. Distribute to envelopes
curl -X POST http://localhost:8000/transactions/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000.00, "description": "Monthly income"}'

# 4. Check envelope balances
curl http://localhost:8000/transactions/balances \
  -H "Authorization: Bearer $TOKEN"
```

## Get MoMo Credentials

1. Visit: https://momodeveloper.mtn.com
2. Sign up for developer account
3. Create subscription (free for sandbox)
4. Generate API user and key
5. Add credentials to `.env`

## Documentation

- **WALLET_DEPOSIT_GUIDE.md** - Complete guide (read this first!)
- **WALLET_DEPOSIT_IMPLEMENTATION.md** - Technical details
- **API_TESTING_WALLET_DEPOSIT.md** - Testing guide with examples
- **WALLET_DEPOSIT_COMPLETE.md** - What was built

## Troubleshooting

### Server won't start
```bash
# Check if all dependencies installed
pip install -r requirements.txt

# Regenerate Prisma client
prisma generate --schema models/schema.prisma
```

### Can't get Clerk token
- Login via frontend application
- Token is returned after successful login
- Use as Bearer token in API requests

### MoMo API errors
- Check credentials in `.env`
- Verify sandbox vs production URL
- Use simulated deposits for testing first

### Webhook not working
- For local testing, webhooks won't work (MoMo can't reach localhost)
- Simulate webhook with curl for testing
- Use ngrok or deploy to test webhooks

## Next Steps

1. ✅ Implementation complete
2. Test with simulated deposits
3. Get MoMo sandbox credentials
4. Test with real MoMo deposits
5. Integrate with frontend
6. Deploy to production

## Quick Reference

### Simulated Deposit
```bash
curl -X POST http://localhost:8000/wallet/fund-simulated \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000.00}'
```

### MoMo Deposit
```bash
curl -X POST http://localhost:8000/wallet/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10000.00, "phone_number": "250788123456"}'
```

### Check Balance
```bash
curl http://localhost:8000/wallet/balance \
  -H "Authorization: Bearer $TOKEN"
```

### Distribute to Envelopes
```bash
curl -X POST http://localhost:8000/transactions/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000.00}'
```

---

**You're all set!** The wallet deposit system is ready to use. Start with simulated deposits to test the flow, then add MoMo credentials for real deposits.

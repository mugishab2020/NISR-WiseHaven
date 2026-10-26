# Current Wisehaven Backend Setup

## ⚠️ IMPORTANT: Manual Deposits are REAL Deposits

The manual deposit endpoint (`POST /wallet/deposit`) performs **REAL deposits** to user wallets:
- ✅ Updates actual wallet balance in PostgreSQL database
- ✅ Increases total_deposited tracking
- ✅ Creates immutable transaction records
- ✅ Money can be distributed to envelopes and spent
- ✅ NOT a simulation - these are real funds managed by the system

The term "manual" means the admin manually triggers the deposit after verifying external payment (bank transfer, cash, etc.), but the deposit itself is 100% real and tracked in the database.

---

## Overview

The Wisehaven backend is fully functional with **manual wallet deposits**. MoMo integration code is in place but **commented out** for future enablement.

## Current Workflow

### 1. User Registration
- Frontend uses Clerk for authentication
- Backend automatically creates User, Emergency Vault, and Wallet on first API request
- No registration endpoint needed

### 2. Manual Wallet Deposits (Current Method) - REAL DEPOSITS

**IMPORTANT:** These are **REAL deposits** to the user's actual wallet, not simulations!

**How it works:**
- Users deposit money externally (bank transfer, cash, mobile money, etc.)
- Admin/system verifies the external deposit
- Admin manually credits the user's wallet via API
- Money is **ACTUALLY added to the user's wallet balance** in the database
- Transaction is recorded in the immutable ledger
- User can then distribute these real funds to envelopes

**Endpoint:**
```bash
POST /wallet/deposit
Authorization: Bearer {clerk_jwt_token}
Content-Type: application/json

{
  "amount": 50000.00,
  "description": "Bank transfer deposit - Ref: TXN123456"
}
```

**What happens internally:**
1. ✅ User's wallet `balance` is increased by the amount
2. ✅ User's wallet `total_deposited` is increased
3. ✅ Transaction record is created (type: MANUAL_DEPOSIT)
4. ✅ Optimistic locking ensures no race conditions
5. ✅ Changes are committed to PostgreSQL database

**Response:**
```json
{
  "success": true,
  "message": "Successfully deposited 50000.00 to wallet",
  "wallet": {
    "id": "uuid",
    "user_id": "clerk_user_id",
    "balance": 50000.00,
    "total_deposited": 50000.00,
    "total_allocated": 0.00,
    ...
  },
  "transaction_id": "tx_uuid"
}
```

**This is NOT a simulation** - the money is really in the user's wallet and can be:
- Distributed to envelopes
- Used for disbursements
- Tracked in transaction history
- Audited via transaction records

### 3. Distribute to Envelopes

After wallet is credited, user distributes funds to envelopes:

```bash
POST /transactions/deposit
Authorization: Bearer {clerk_jwt_token}
Content-Type: application/json

{
  "amount": 50000.00,
  "description": "Monthly income allocation"
}
```

This uses the active allocation plan to automatically distribute:
- 5-10% to Emergency Vault (first sweep)
- Remaining amount to other envelopes per percentages
- Creates immutable transaction records

### 4. Spend from Envelopes

Users can then:
- Transfer between envelopes
- Make disbursements to payees
- Withdraw from Emergency Vault (with cooling-off period)

## Available API Endpoints

### Wallet Management
- `GET /wallet/` - Get wallet info
- `GET /wallet/balance` - Get current balance
- `POST /wallet/deposit` - **Manual deposit (REAL deposits to user wallet)**

### Envelopes
- `GET /envelopes` - List user envelopes
- `POST /envelopes` - Create envelope
- `GET /envelopes/{id}` - Get envelope details
- `PATCH /envelopes/{id}` - Update envelope
- `DELETE /envelopes/{id}` - Delete envelope
- `POST /envelopes/{id}/temporal-lock` - Add temporal lock

### Transactions
- `POST /transactions/deposit` - Distribute from wallet to envelopes
- `GET /transactions` - Get transaction history
- `GET /transactions/balances` - Get all envelope balances

### Allocation Plans
- `GET /allocations` - List allocation plans
- `POST /allocations` - Create allocation plan
- `GET /allocations/{id}` - Get plan details
- `PATCH /allocations/{id}` - Update plan
- `DELETE /allocations/{id}` - Delete plan
- `POST /allocations/{id}/activate` - Activate plan

### Disbursements
- `POST /disbursements/request` - Request disbursement
- `POST /disbursements/approve/{id}` - Approve disbursement
- `POST /disbursements/emergency-withdrawal` - Emergency vault withdrawal
- `GET /disbursements` - List disbursement requests
- `GET /disbursements/{id}` - Get disbursement details

### Payees
- `GET /payees` - List payees
- `POST /payees` - Create payee
- `GET /payees/{id}` - Get payee details
- `PATCH /payees/{id}` - Update payee
- `DELETE /payees/{id}` - Delete payee

### User Management
- `GET /users/me` - Get current user
- `PATCH /users/me` - Update current user
- `DELETE /users/me` - Delete current user

## Authentication

All endpoints require Clerk JWT token:
```bash
Authorization: Bearer {clerk_jwt_token}
```

Get token from Clerk after frontend login.

## Testing

### Start Server
```bash
cd wisehaven_backend
source venv/bin/activate
python main.py
```

Server runs on: http://localhost:8000

### Test Manual Deposit
```bash
# Get Clerk token from frontend login
export TOKEN="your_clerk_jwt_token"

# Check initial balance
curl http://localhost:8000/wallet/balance \
  -H "Authorization: Bearer $TOKEN"

# Add REAL funds via manual deposit
curl -X POST http://localhost:8000/wallet/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000.00,
    "description": "Bank transfer - Ref: TXN123456"
  }'

# Check new balance (will show real increase)
curl http://localhost:8000/wallet/balance \
  -H "Authorization: Bearer $TOKEN"

# Distribute real funds to envelopes
curl -X POST http://localhost:8000/transactions/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000.00,
    "description": "Monthly income"
  }'

# Check envelope balances (real money in envelopes)
curl http://localhost:8000/transactions/balances \
  -H "Authorization: Bearer $TOKEN"
```

## Database

**PostgreSQL** connection:
```bash
Database: wisehaven
User: edson
Password: edson
Host: localhost
Port: 5432
```

**Connection string:**
```
DATABASE_URL="postgresql://edson:edson@localhost:5432/wisehaven"
```

## Key Features

✅ **User Management**
- Clerk authentication
- Auto user sync on first request
- User profile management

✅ **Wallet System**
- Manual deposits (current method)
- Balance tracking
- Transaction history
- Optimistic locking for concurrency

✅ **Envelope Budgeting**
- Create custom envelopes
- Automatic distribution via allocation plans
- Temporal locks for savings goals
- Emergency vault with cooling-off period

✅ **Disbursements**
- Request-approve workflow
- Temporal lock enforcement
- Balance validation
- Transaction audit trail

✅ **Allocation Plans**
- Define percentage-based distributions
- Activate/deactivate plans
- First sweep to Emergency Vault (5-10%)

## MoMo Integration (Commented Out)

MoMo payment provider integration is **ready but commented out**. When ready to enable:

### Files with MoMo Code
- `services/payment_service.py` - MoMo API integration (ready but unused)
- `controllers/wallet_controller.py` - Endpoints commented out
- `views/wallet_schemas.py` - Schemas available
- `models/schema.prisma` - PaymentRequest model in database

### Commented Endpoints
- `POST /wallet/deposit` - Initiate MoMo deposit
- `GET /wallet/payment/{id}/status` - Check payment status
- `POST /wallet/payment-callback` - Webhook for MoMo

### To Enable MoMo Later

1. **Uncomment endpoints** in `controllers/wallet_controller.py`
2. **Uncomment imports** at the top of the file
3. **Configure MoMo credentials** in `.env`:
   ```bash
   MOMO_API_URL="https://sandbox.momodeveloper.mtn.com"
   MOMO_ENVIRONMENT="sandbox"
   MOMO_SUBSCRIPTION_KEY="your-key"
   MOMO_API_USER="your-user-uuid"
   MOMO_API_KEY="your-api-key"
   MOMO_CALLBACK_URL="http://localhost:8000/wallet/payment-callback"
   ```
4. **Restart server**
5. **Test MoMo deposits**

## Environment Variables

Required in `.env`:
```bash
# Database
DATABASE_URL="postgresql://edson:edson@localhost:5432/wisehaven"

# Clerk Authentication
CLERK_SECRET_KEY="your-clerk-secret-key"

# Application
ENVIRONMENT="development"
LOG_LEVEL="INFO"

# Business Rules
FIRST_SWEEP_DEFAULT_PERCENTAGE=5.0
FIRST_SWEEP_MIN_PERCENTAGE=5.0
FIRST_SWEEP_MAX_PERCENTAGE=10.0
EMERGENCY_VAULT_MAX_WITHDRAWAL_PERCENTAGE=50.0
EMERGENCY_VAULT_COOLING_OFF_HOURS=24
```

MoMo variables are **optional** (only needed when MoMo is enabled).

## Complete Flow Example

1. **User registers via frontend** → Clerk handles authentication
2. **First API request** → Backend creates User, Emergency Vault, Wallet
3. **User deposits externally** → Bank transfer, cash, mobile money, etc. to your account
4. **Admin verifies deposit** → Checks bank statement, receipt, etc.
5. **Admin credits wallet** → `POST /wallet/deposit` (REAL deposit to user's wallet)
6. **User distributes** → `POST /transactions/deposit` (to envelopes)
7. **User spends** → Disbursements, transfers, withdrawals from REAL money

## Documentation Files

- `CURRENT_SETUP.md` - This file (current state)
- `README.md` - General project overview
- `QUICKSTART.md` - Quick start guide
- `SERVICES_STATUS.md` - Service implementation status
- `CORE_FUNCTIONALITY_GUIDE.md` - Core feature guide
- `CORE_TESTING_GUIDE.md` - Testing guide

MoMo-specific docs (for future):
- `WALLET_DEPOSIT_GUIDE.md` - Complete MoMo integration guide
- `WALLET_DEPOSIT_IMPLEMENTATION.md` - Technical details
- `API_TESTING_WALLET_DEPOSIT.md` - MoMo testing guide

## Support

### Common Issues

**Server won't start:**
```bash
cd wisehaven_backend
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

**Database connection error:**
```bash
# Check PostgreSQL is running
psql -U edson -d wisehaven -c "SELECT 1"

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

**Can't get Clerk token:**
- Login via frontend application
- Token is returned after successful login
- Use as Bearer token in API requests

### Next Steps

1. ✅ Server is ready
2. Test manual deposits
3. Integrate with frontend
4. Deploy to staging/production
5. Enable MoMo when ready

---

**Status:** Fully functional with manual deposits. MoMo integration ready but disabled for now.

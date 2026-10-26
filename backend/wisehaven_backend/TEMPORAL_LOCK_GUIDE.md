# Temporal Lock Feature Guide

## Overview

**Every envelope** in Wisehaven can optionally lock funds until a specific date/time. This feature is **already fully implemented and working!**

## What is a Temporal Lock?

A temporal lock prevents users from spending money from an envelope until a specified "unlock date" (maturity timestamp) is reached.

### Use Cases

- **Rent Savings**: Lock funds until rent is due
- **School Fees**: Lock tuition money until payment deadline
- **Emergency Fund**: Prevent impulse spending from emergency savings
- **Goal-based Savings**: Lock money for vacation, wedding, car, etc.
- **Debt Payments**: Ensure loan payment funds are available

## How It Works

### 1. Create Any Envelope

```bash
POST /envelopes
Authorization: Bearer {clerk_jwt_token}
Content-Type: application/json

{
  "name": "Annual Rent",
  "category": "Housing",
  "description": "Saving for December rent payment"
}
```

**Response:**
```json
{
  "id": "envelope_uuid",
  "user_id": "user_id",
  "name": "Annual Rent",
  "category": "Housing",
  "description": "Saving for December rent payment",
  "balance": 0.00,
  "is_active": true,
  "is_emergency_vault": false,
  "temporal_lock": null,
  "created_at": "2026-10-26T...",
  "updated_at": "2026-10-26T..."
}
```

### 2. Add Funds to the Envelope

Deposit to wallet, then distribute to envelopes:

```bash
# Deposit to wallet
POST /wallet/deposit
{
  "amount": 500000.00,
  "description": "Salary"
}

# Distribute to envelopes
POST /transactions/deposit
{
  "amount": 500000.00,
  "description": "Monthly allocation"
}
```

Now your "Annual Rent" envelope has funds based on your allocation plan.

### 3. Lock the Envelope

```bash
POST /envelopes/{envelope_id}/lock
Authorization: Bearer {clerk_jwt_token}
Content-Type: application/json

{
  "maturity_timestamp": "2026-12-01T00:00:00Z"
}
```

**Response:**
```json
{
  "id": "lock_uuid",
  "envelope_id": "envelope_uuid",
  "maturity_timestamp": "2026-12-01T00:00:00Z",
  "status": "LOCKED",
  "created_at": "2026-10-26T..."
}
```

### 4. What Happens Now?

**While Locked (before Dec 1, 2026):**
- ✅ User can **see** the balance
- ✅ User can **add** more money to the envelope
- ❌ User **CANNOT** spend from the envelope
- ❌ Disbursement requests are **REJECTED**
- ❌ Transfers OUT are **BLOCKED**

**After Unlock Date (Dec 1, 2026):**
- ✅ User receives **notification** that funds are available
- ✅ All spending restrictions **removed**
- ✅ User can make disbursements
- ✅ User can transfer funds

## API Endpoints

### Get Envelope with Lock Status

```bash
GET /envelopes/{envelope_id}
Authorization: Bearer {clerk_jwt_token}
```

**Response:**
```json
{
  "id": "envelope_uuid",
  "name": "Annual Rent",
  "balance": 150000.00,
  "temporal_lock": {
    "id": "lock_uuid",
    "maturity_timestamp": "2026-12-01T00:00:00Z",
    "status": "LOCKED"
  }
}
```

### List All Envelopes (shows lock status)

```bash
GET /envelopes
Authorization: Bearer {clerk_jwt_token}
```

**Response:**
```json
{
  "envelopes": [
    {
      "id": "envelope1_uuid",
      "name": "Annual Rent",
      "balance": 150000.00,
      "temporal_lock": {
        "status": "LOCKED",
        "maturity_timestamp": "2026-12-01T00:00:00Z"
      }
    },
    {
      "id": "envelope2_uuid",
      "name": "Groceries",
      "balance": 50000.00,
      "temporal_lock": null
    },
    {
      "id": "envelope3_uuid",
      "name": "School Fees",
      "balance": 200000.00,
      "temporal_lock": {
        "status": "RELEASED",
        "maturity_timestamp": "2026-10-15T00:00:00Z"
      }
    }
  ]
}
```

### Try to Spend from Locked Envelope

```bash
POST /disbursements/request
{
  "envelope_id": "locked_envelope_uuid",
  "amount": 50000.00,
  "payee_id": "payee_uuid",
  "description": "Rent payment"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Envelope is locked until 2026-12-01T00:00:00Z"
}
```

## Lock Status Values

| Status | Description | Can Spend? |
|--------|-------------|-----------|
| `null` | No lock on envelope | ✅ Yes |
| `"LOCKED"` | Before maturity date | ❌ No |
| `"RELEASED"` | After maturity date | ✅ Yes |

## Database Schema

Temporal locks are stored in the `TemporalLock` table:

```prisma
model TemporalLock {
  id                 String   @id @default(uuid())
  envelope_id        String   @unique
  maturity_timestamp DateTime
  created_at         DateTime @default(now())
  notified           Boolean  @default(false)
  
  envelope Envelope @relation(...)
}
```

**Key points:**
- One lock per envelope (`envelope_id` is unique)
- Lock remains even after maturity (for audit trail)
- `notified` flag tracks if user was notified when lock matured

## Implementation Details

### Lock Validation Flow

```
User requests disbursement
        ↓
DisbursementService.request_disbursement()
        ↓
LockService.validate_withdrawal_allowed(envelope_id)
        ↓
Check: maturity_timestamp > now()?
        ↓
    Yes → Return (False, "Locked until {date}")
    No  → Return (True, "Allowed")
        ↓
Proceed with disbursement or reject
```

### Files Involved

1. **`services/lock_service.py`**
   - `create_temporal_lock()` - Add lock to envelope
   - `check_lock_status()` - Get current lock status
   - `validate_withdrawal_allowed()` - Check if spending allowed
   - `get_matured_locks()` - Find locks ready for notification
   - `mark_notified()` - Mark user as notified

2. **`services/disbursement_service.py`**
   - Validates temporal lock before approving disbursements
   - Rejects requests if envelope is locked

3. **`controllers/envelope_controller.py`**
   - `POST /{envelope_id}/lock` - Create temporal lock endpoint

4. **`views/envelope_schemas.py`**
   - `TemporalLockRequest` - Lock creation request schema
   - `TemporalLockResponse` - Lock information response

## Testing Examples

### Example 1: Lock Rent Money

```bash
TOKEN="your_clerk_token"

# Create rent envelope
ENVELOPE_RESPONSE=$(curl -s -X POST http://localhost:8000/envelopes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "December Rent",
    "category": "Housing",
    "description": "Rent payment due Dec 1"
  }')

ENVELOPE_ID=$(echo $ENVELOPE_RESPONSE | jq -r '.id')

# Add funds (via wallet deposit + distribution)
curl -X POST http://localhost:8000/wallet/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 500000.00, "description": "Salary"}'

curl -X POST http://localhost:8000/transactions/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 500000.00, "description": "Monthly allocation"}'

# Lock until December 1
curl -X POST http://localhost:8000/envelopes/$ENVELOPE_ID/lock \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"maturity_timestamp": "2026-12-01T00:00:00Z"}'

# Try to spend (will be rejected!)
curl -X POST http://localhost:8000/disbursements/request \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"envelope_id\": \"$ENVELOPE_ID\",
    \"amount\": 50000.00,
    \"payee_id\": \"some_payee_id\",
    \"description\": \"Early rent payment attempt\"
  }"

# Expected: 400 Bad Request - "Envelope is locked until 2026-12-01T00:00:00Z"
```

### Example 2: View Lock Status

```bash
# Get specific envelope
curl http://localhost:8000/envelopes/$ENVELOPE_ID \
  -H "Authorization: Bearer $TOKEN"

# Get all envelopes (shows all locks)
curl http://localhost:8000/envelopes \
  -H "Authorization: Bearer $TOKEN"
```

## Business Rules

### Lock Creation Rules
1. ✅ Maturity timestamp must be in the **future**
2. ✅ Each envelope can have **at most one** lock
3. ✅ Lock persists even after maturity (for audit)
4. ✅ Can lock any envelope (including Emergency Vault)

### During Lock Period
1. ❌ **Cannot** create disbursements from locked envelope
2. ❌ **Cannot** transfer funds OUT of locked envelope
3. ✅ **Can** view balance
4. ✅ **Can** add more funds to locked envelope

### After Maturity
1. ✅ All restrictions removed
2. ✅ User notified when lock matures
3. ✅ Lock record remains (not deleted)
4. ✅ Can create new lock if needed

## Notification System

When a lock matures:

1. Background job checks for matured locks
2. User is notified via:
   - SMS (if phone number available)
   - Email (if email available)
   - Push notification (if mobile app)
3. Lock marked as `notified = true`
4. Funds become available for spending

Check `LockService.get_matured_locks()` for implementation.

## Emergency Vault Special Case

The Emergency Vault can also be locked:

```bash
POST /envelopes/{emergency_vault_id}/lock
{
  "maturity_timestamp": "2027-01-01T00:00:00Z"
}
```

**Effect:**
- Emergency withdrawal requests are **rejected** during lock period
- Provides extra protection against impulsive withdrawals
- Can be used as a "forced savings" mechanism

## Frontend Integration Tips

### Display Lock Status

```typescript
interface Envelope {
  id: string;
  name: string;
  balance: number;
  temporal_lock: {
    status: "LOCKED" | "RELEASED";
    maturity_timestamp: string;
  } | null;
}

function EnvelopeCard({ envelope }: { envelope: Envelope }) {
  const isLocked = envelope.temporal_lock?.status === "LOCKED";
  
  return (
    <div>
      <h3>{envelope.name}</h3>
      <p>Balance: {envelope.balance}</p>
      {isLocked && (
        <p>🔒 Locked until {envelope.temporal_lock.maturity_timestamp}</p>
      )}
    </div>
  );
}
```

### Disable Spend Button When Locked

```typescript
<Button 
  disabled={envelope.temporal_lock?.status === "LOCKED"}
  onClick={handleSpend}
>
  {envelope.temporal_lock?.status === "LOCKED" ? "🔒 Locked" : "Spend"}
</Button>
```

### Lock Creation Form

```typescript
<Form onSubmit={handleLockEnvelope}>
  <DatePicker 
    label="Lock until date"
    minDate={new Date()}
    onChange={setMaturityDate}
  />
  <Button type="submit">Lock Envelope</Button>
</Form>
```

## Summary

✅ **Feature Status**: Fully implemented and working
✅ **Available for**: All envelopes
✅ **Enforcement**: Disbursements automatically blocked
✅ **Notification**: User notified when lock matures
✅ **Audit Trail**: Lock records preserved in database

**Next Steps:**
1. Test the endpoints with your frontend
2. Integrate lock status in UI
3. Add lock creation flow for users
4. Display lock countdown/status badges

The temporal lock feature is production-ready! 🎉

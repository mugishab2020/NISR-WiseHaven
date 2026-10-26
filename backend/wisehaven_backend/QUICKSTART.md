# WiseHaven Backend - Quick Start Guide

## 🚀 Setup (5 minutes)

### 1. Install Dependencies

```bash
cd wisehaven_backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Setup Database

Create a PostgreSQL database:

```bash
# Using psql
createdb wisehaven

# Or using Docker
docker run --name wisehaven-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=wisehaven -p 5432:5432 -d postgres
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set:
```
DATABASE_URL="postgresql://user:password@localhost:5432/wisehaven"
JWT_SECRET="your-secure-random-secret-key-here"
```

### 4. Generate Prisma Client & Run Migrations

```bash
prisma generate
prisma migrate dev --name init
```

### 5. Start the Server

```bash
python main.py
```

Server runs at: **http://localhost:8000**

## 📖 API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Test the API

### 1. Register a User

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+250788123456",
    "password": "SecurePass123!",
    "emergency_contact": "+250788654321"
  }'
```

**Response:**
```json
{
  "id": "uuid",
  "phone_number": "+250788123456",
  "created_at": "2024-01-15T10:30:00Z",
  "first_sweep_percentage": 0.05,
  "preferred_notification": "SMS",
  "emergency_contact": "+250788654321",
  "is_active": true,
  "emergency_vault_id": "uuid"
}
```

### 2. Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+250788123456",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### 3. Access Protected Endpoints

Use the token from login:

```bash
export TOKEN="your-access-token-here"

curl -X GET http://localhost:8000/envelopes \
  -H "Authorization: Bearer $TOKEN"
```

## 📁 Project Structure

```
wisehaven_backend/
├── models/           # Prisma schema & database client
├── views/            # Pydantic request/response schemas
├── controllers/      # FastAPI route handlers
├── services/         # Business logic layer
├── utils/            # Security, validators, helpers
├── tasks/            # Celery async tasks (TODO)
├── integrations/     # External APIs (MoMo, USSD) (TODO)
└── tests/            # Unit, property, integration tests (TODO)
```

## ✅ Working Endpoints

### Authentication
- ✅ `POST /auth/register` - Register new user
- ✅ `POST /auth/login` - Login and get JWT token
- ✅ `POST /auth/refresh` - Refresh JWT token
- ✅ `PATCH /auth/users/me` - Update user settings
- ✅ `DELETE /auth/users/me` - Delete account

### Envelopes
- 🚧 `GET /envelopes` - Get all envelopes (TODO)
- 🚧 `POST /envelopes` - Create envelope (TODO)
- 🚧 `PATCH /envelopes/{id}` - Update envelope (TODO)
- 🚧 `POST /envelopes/{id}/lock` - Create temporal lock (TODO)

### Transactions
- 🚧 `POST /transactions/deposit` - Deposit income (TODO)
- 🚧 `GET /transactions` - Get transaction history (TODO)
- 🚧 `GET /transactions/balances` - Get all balances (TODO)

### Allocation Plans
- 🚧 `GET /allocation-plans` - List plans (TODO)
- 🚧 `POST /allocation-plans` - Create plan (TODO)
- 🚧 `POST /allocation-plans/{id}/activate` - Activate plan (TODO)

### Payees
- 🚧 `GET /payees` - List payees (TODO)
- 🚧 `POST /payees` - Create payee (TODO)
- 🚧 `PATCH /payees/{id}` - Update payee (TODO)

### Disbursements
- 🚧 `POST /disbursements` - Create disbursement (TODO)
- 🚧 `POST /disbursements/emergency-vault` - Request emergency withdrawal (TODO)
- 🚧 `POST /disbursements/emergency-vault/{id}/approve` - Approve emergency withdrawal (TODO)

## 🔧 Development

### Run in Development Mode

```bash
python main.py
```

Server auto-reloads on file changes.

### Generate New Migration

After changing `models/schema.prisma`:

```bash
prisma migrate dev --name your_migration_name
```

### Reset Database

```bash
prisma migrate reset
```

## 🎯 Next Steps

1. Implement remaining controllers (envelopes, transactions, etc.)
2. Add MoMo API integration
3. Add USSD gateway integration
4. Implement Celery tasks for maturity monitoring
5. Add comprehensive test suite
6. Add rate limiting and security middleware

## 📝 Notes

- Authentication uses JWT with 24-hour expiration
- Passwords are hashed with bcrypt (work factor 12)
- Emergency Vault is created automatically on registration
- Default first-sweep percentage is 5%
- All monetary values use 2 decimal precision

## 🐛 Troubleshooting

### "Prisma Client not generated"
```bash
prisma generate
```

### "Database connection failed"
Check your `DATABASE_URL` in `.env` file

### "Module not found"
```bash
pip install -r requirements.txt
```

### "Port 8000 already in use"
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9
```

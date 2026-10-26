# WiseHaven Backend API

Smart Time-Locked Envelope Wallet for Rwanda - FastAPI Backend with MVC Architecture

## Features

- **Envelope Budgeting**: Create categorized budget envelopes with temporal locks
- **First-Sweep Allocation**: Automatic 5-10% emergency savings allocation
- **Temporal Locks**: Time-based withdrawal prevention until maturity
- **MoMo Integration**: SMS notifications and mobile money transfers
- **USSD Support**: Feature phone access via USSD gateway
- **Immutable Ledger**: Complete audit trail of all transactions

## Tech Stack

- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with Prisma ORM
- **Task Queue**: Celery with Redis
- **Authentication**: JWT with bcrypt password hashing
- **Testing**: pytest, Hypothesis for property-based testing

## Project Structure

```
wisehaven_backend/
├── models/           # Prisma schema
├── views/            # Pydantic request/response schemas
├── controllers/      # FastAPI route handlers
├── services/         # Business logic
├── tasks/            # Celery async tasks
├── utils/            # Utilities (security, validators)
├── integrations/     # External APIs (MoMo, USSD)
└── tests/            # Unit, property, integration tests
```

## Setup

1. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Generate Prisma client**:
```bash
prisma generate
```

5. **Run migrations**:
```bash
prisma migrate dev
```

6. **Start the server**:
```bash
python main.py
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=wisehaven_backend

# Run only unit tests
pytest tests/unit/

# Run only property-based tests
pytest tests/property/
```

## Development

The project follows MVC architecture:
- **Models**: Prisma schema defines database entities
- **Views**: Pydantic models for API serialization
- **Controllers**: FastAPI routers handle HTTP requests
- **Services**: Business logic and transaction management

## License

Proprietary - WiseHaven Team

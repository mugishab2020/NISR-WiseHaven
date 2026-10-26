# Database Setup Guide

You have PostgreSQL already running, but we need to configure it properly.

## Option 1: Use Your Existing PostgreSQL (Recommended)

### Step 1: Set up PostgreSQL user and database

Run these commands in your terminal:

```bash
sudo -u postgres psql
```

Then in the PostgreSQL shell:

```sql
-- Create user
CREATE USER wisehaven WITH PASSWORD 'wisehaven123';

-- Create database
CREATE DATABASE wisehaven OWNER wisehaven;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE wisehaven TO wisehaven;

-- Exit
\q
```

### Step 2: Update .env file

The `.env` file is already configured with:
```
DATABASE_URL="postgresql://wisehaven:wisehaven123@localhost:5432/wisehaven"
```

### Step 3: Run migrations

```bash
cd wisehaven_backend
source venv/bin/activate
prisma migrate dev --name init --schema=models/schema.prisma
```

### Step 4: Start the server

```bash
python main.py
```

## Option 2: Use Docker (if PostgreSQL port is free)

```bash
# Stop your local PostgreSQL first
sudo service postgresql stop

# Start Docker container
docker run --name wisehaven-postgres \
  -e POSTGRES_USER=wisehaven \
  -e POSTGRES_PASSWORD=wisehaven123 \
  -e POSTGRES_DB=wisehaven \
  -p 5432:5432 \
  -d postgres:15-alpine

# Wait for it to start (5 seconds)
sleep 5

# Run migrations
source venv/bin/activate
prisma migrate dev --name init --schema=models/schema.prisma

# Start server
python main.py
```

## Troubleshooting

### Check if PostgreSQL is running
```bash
sudo service postgresql status
```

### Check what's using port 5432
```bash
sudo lsof -i :5432
```

### Connect to PostgreSQL manually
```bash
psql -U wisehaven -d wisehaven -h localhost
# Password: wisehaven123
```

### Reset everything and start fresh
```bash
# Stop Docker container if running
docker stop wisehaven-postgres
docker rm wisehaven-postgres

# Or stop local PostgreSQL
sudo service postgresql stop

# Delete database and recreate
sudo -u postgres psql -c "DROP DATABASE IF EXISTS wisehaven;"
sudo -u postgres psql -c "DROP USER IF EXISTS wisehaven;"
sudo -u postgres psql -c "CREATE USER wisehaven WITH PASSWORD 'wisehaven123';"
sudo -u postgres psql -c "CREATE DATABASE wisehaven OWNER wisehaven;"
```

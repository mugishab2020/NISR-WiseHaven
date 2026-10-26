#!/bin/bash
# Run Prisma migrations with correct PostgreSQL auth

echo "🔧 Running database migrations..."
echo ""

# Set password for non-interactive authentication
export PGPASSWORD=dson

# Run migrations
source venv/bin/activate
prisma migrate dev --name init --schema=models/schema.prisma

echo ""
echo "✅ Migrations complete!"

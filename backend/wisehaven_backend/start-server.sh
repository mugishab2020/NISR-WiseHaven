#!/usr/bin/env bash
# Start the Render web service after the build has generated the Prisma client.

set -e

echo "==> Current directory: $(pwd)"
echo "==> Python version: $(python --version)"

echo "==> Checking environment variables:"
echo "DATABASE_URL: ${DATABASE_URL:+SET}"
echo "CLERK_SECRET_KEY: ${CLERK_SECRET_KEY:+SET}"
echo "ENVIRONMENT: $ENVIRONMENT"
echo "PORT: $PORT"

echo "==> Verifying generated Prisma client..."
python -c "from prisma import Prisma; Prisma()"

echo "==> Running database migrations:"
prisma migrate deploy --schema models/schema.prisma

echo "==> Starting uvicorn server..."
exec python -m uvicorn main:app --host 0.0.0.0 --port "$PORT"

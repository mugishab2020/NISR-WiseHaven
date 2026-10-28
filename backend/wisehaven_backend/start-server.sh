#!/usr/bin/env bash
# Startup script for Render with Prisma binary management

set -e

echo "==> Current directory: $(pwd)"
echo "==> Python version: $(python --version)"

echo "==> Checking environment variables:"
echo "DATABASE_URL: ${DATABASE_URL:0:30}..."
echo "CLERK_SECRET_KEY: ${CLERK_SECRET_KEY:+SET}"
echo "ENVIRONMENT: $ENVIRONMENT"
echo "PORT: $PORT"

echo "==> Fetching Prisma binaries (ensuring they exist)..."
prisma py fetch || echo "⚠️  Fetch failed, trying to continue..."

echo "==> Regenerating Prisma client..."
prisma generate --schema models/schema.prisma || echo "⚠️  Generate failed, trying to continue..."

echo "==> Checking for binary files:"
find /opt/render/.cache/prisma-python/ -name "prisma-query-engine*" 2>/dev/null || echo "No binaries found in cache"

echo "==> Setting execute permissions on binaries:"
find /opt/render/.cache/prisma-python/ -name "prisma-query-engine*" -exec chmod +x {} \; 2>/dev/null || echo "Could not set permissions"

echo "==> Running database migrations:"
prisma migrate deploy --schema models/schema.prisma || echo "⚠️  Migration failed or database already up to date"

echo "==> Starting uvicorn server..."
exec python -m uvicorn main:app --host 0.0.0.0 --port "$PORT"

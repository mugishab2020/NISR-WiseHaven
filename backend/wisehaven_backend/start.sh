#!/usr/bin/env bash
# Render start script with binary check

set -o errexit

echo "==> Checking for Prisma binaries..."

# Check if binary exists, if not fetch it
if ! python -c "from prisma import Prisma" 2>/dev/null; then
    echo "==> Prisma client not found, fetching..."
    prisma py fetch
    prisma generate --schema models/schema.prisma
fi

echo "==> Starting server..."
python -m uvicorn main:app --host 0.0.0.0 --port $PORT

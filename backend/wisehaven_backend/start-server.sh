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

echo "==> Ensuring Prisma query engine is executable..."
find /opt/render/.cache/prisma-python/binaries -type f -name '*query-engine-*' -exec chmod u+x {} +

echo "==> Verifying generated Prisma client..."
python -c "import os; from pathlib import Path; from prisma import Prisma; from prisma.client import BINARY_PATHS; from prisma.binaries import platform; target = platform.binary_platform(); raw = BINARY_PATHS.query_engine.get(target); assert raw, f'No Prisma query engine configured for {target}'; engine = Path(raw); assert engine.is_file() and os.access(engine, os.X_OK), f'Prisma query engine missing or not executable: {engine}'; assert hasattr(Prisma(), 'transaction'); print(f'Prisma query engine ready: {engine}')"

echo "==> Running database migrations:"
prisma migrate deploy --schema models/schema.prisma

echo "==> Starting uvicorn server..."
exec python -m uvicorn main:app --host 0.0.0.0 --port "$PORT"

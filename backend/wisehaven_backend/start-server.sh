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
export PRISMA_QUERY_ENGINE_BINARY="$PWD/$(python -c 'from prisma.engine.utils import query_engine_name; print(query_engine_name())')"
python -c "import os; from pathlib import Path; from prisma import Prisma; engine = Path(os.environ['PRISMA_QUERY_ENGINE_BINARY']); assert engine.is_file() and os.access(engine, os.X_OK), f'Bundled Prisma query engine missing or not executable: {engine}'; assert hasattr(Prisma(), 'transaction'); print(f'Prisma query engine ready: {engine}')"

echo "==> Running database migrations:"
prisma migrate deploy --schema models/schema.prisma

echo "==> Starting uvicorn server..."
exec python -m uvicorn main:app --host 0.0.0.0 --port "$PORT"

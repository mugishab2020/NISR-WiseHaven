#!/usr/bin/env bash
# Render build script for Prisma Python

set -o errexit  # Exit on error

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Generating Prisma client..."
prisma generate --schema models/schema.prisma

echo "==> Fetching Prisma query engine binaries..."
prisma py fetch

echo "==> Ensuring Prisma query engine is executable..."
find /opt/render/.cache/prisma-python/binaries -type f -name '*query-engine-*' -exec chmod u+x {} +

echo "==> Verifying generated client and query engine..."
python -c "import os; from pathlib import Path; from prisma import Prisma; from prisma.client import BINARY_PATHS; from prisma.binaries import platform; target = platform.binary_platform(); raw = BINARY_PATHS.query_engine.get(target); assert raw, f'No Prisma query engine configured for {target}'; engine = Path(raw); assert engine.is_file() and os.access(engine, os.X_OK), f'Prisma query engine missing or not executable: {engine}'; assert hasattr(Prisma(), 'transaction'); print(f'Generated Prisma client and query engine ready: {engine}')"

echo "==> Build complete!"

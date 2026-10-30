#!/usr/bin/env bash
# Render build script for Prisma Python

set -o errexit  # Exit on error

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Generating Prisma client..."
prisma generate --schema models/schema.prisma

echo "==> Fetching Prisma query engine binaries..."
prisma py fetch

echo "==> Verifying binary exists..."
python -c "from prisma import Prisma; assert hasattr(Prisma(), 'transaction'); print('Generated Prisma transaction client loaded successfully')"

echo "==> Build complete!"

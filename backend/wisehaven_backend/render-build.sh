#!/usr/bin/env bash
# Render build script for Prisma Python

set -o errexit  # Exit on error

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Generating Prisma client..."
prisma generate --schema models/schema.prisma

echo "==> Fetching Prisma query engine binaries..."
prisma py fetch

echo "==> Bundling Prisma query engine with the deployed service..."
python -c "import shutil; from pathlib import Path; from prisma import Prisma; from prisma.client import BINARY_PATHS; from prisma.binaries import platform; from prisma.engine.utils import query_engine_name; target = platform.binary_platform(); raw = BINARY_PATHS.query_engine.get(target); assert raw, f'No Prisma query engine configured for {target}'; source = Path(raw); assert source.is_file(), f'Fetched Prisma query engine is missing: {source}'; engine = Path.cwd() / query_engine_name(); shutil.copy2(source, engine); engine.chmod(0o755); assert engine.is_file() and hasattr(Prisma(), 'transaction'); print(f'Bundled Prisma query engine: {engine}')"

echo "==> Build complete!"

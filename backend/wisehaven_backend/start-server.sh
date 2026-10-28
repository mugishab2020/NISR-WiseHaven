#!/usr/bin/env bash
# Diagnostic startup script for Render

set -e

echo "==> Current directory: $(pwd)"
echo "==> Python version: $(python --version)"
echo "==> Pip packages:"
pip list | grep -E "(prisma|fastapi|uvicorn|clerk)"

echo "==> Checking if main.py exists:"
ls -la main.py

echo "==> Checking environment variables:"
echo "DATABASE_URL: ${DATABASE_URL:0:20}..."
echo "CLERK_SECRET_KEY: ${CLERK_SECRET_KEY:+SET}"
echo "ENVIRONMENT: $ENVIRONMENT"
echo "PORT: $PORT"

echo "==> Checking Prisma cache directory:"
ls -la /opt/render/.cache/prisma-python/binaries/ 2>/dev/null || echo "Cache directory not found"
ls -la /opt/render/.cache/prisma-python/binaries/5.4.2/*/ 2>/dev/null || echo "Binaries subdirectory not found"

echo "==> Checking Prisma binary:"
if ! python -c "from prisma import Prisma; print('✅ Prisma client loaded')" 2>/dev/null; then
    echo "❌ Prisma client failed - attempting to fetch binaries"
    prisma py fetch
    prisma generate --schema models/schema.prisma
    
    # Try again
    if python -c "from prisma import Prisma; print('✅ Prisma client loaded after fetch')" 2>/dev/null; then
        echo "✅ Successfully recovered Prisma"
    else
        echo "❌ Prisma still failing after fetch - checking permissions"
        find /opt/render/.cache/prisma-python/ -name "prisma-query-engine*" -exec ls -la {} \;
        find /opt/render/.cache/prisma-python/ -name "prisma-query-engine*" -exec chmod +x {} \;
    fi
fi

echo "==> Testing imports:"
python -c "from models import connect_db, disconnect_db; print('✅ Models imported')" || echo "❌ Models import failed"
python -c "from controllers.user_controller import router; print('✅ Controllers imported')" || echo "❌ Controllers import failed"

echo "==> Starting uvicorn server..."
exec python -m uvicorn main:app --host 0.0.0.0 --port "$PORT"

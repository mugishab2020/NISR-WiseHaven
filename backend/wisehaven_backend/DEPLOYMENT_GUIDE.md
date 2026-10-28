# Deployment Guide - Render.com

## Issue: Prisma Binary Not Found

The error you're seeing is because Prisma's query engine binaries need to be explicitly fetched during the build process.

## Solution

### 1. Use the Build Script

I've created `render-build.sh` which:
- Installs Python dependencies
- Generates Prisma client
- Fetches Prisma query engine binaries

### 2. Update Render Configuration

**In your Render Dashboard:**

1. Go to your service settings
2. Update **Build Command** to:
   ```bash
   bash render-build.sh
   ```

3. Update **Start Command** to:
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

4. Set **Root Directory** to:
   ```
   backend/wisehaven_backend
   ```
   (Or whatever your actual path is relative to repo root)

### 3. Environment Variables

Make sure these are set in Render:

```bash
# Required
DATABASE_URL=<from_render_postgres>
CLERK_SECRET_KEY=<your_clerk_key>

# Optional
PYTHON_VERSION=3.11.11
ENVIRONMENT=production
LOG_LEVEL=INFO
FIRST_SWEEP_DEFAULT_PERCENTAGE=5.0
FIRST_SWEEP_MIN_PERCENTAGE=5.0
FIRST_SWEEP_MAX_PERCENTAGE=10.0
EMERGENCY_VAULT_MAX_WITHDRAWAL_PERCENTAGE=50.0
EMERGENCY_VAULT_COOLING_OFF_HOURS=24
```

### 4. Alternative: Manual Prisma Fetch in Build Command

If the script doesn't work, use this as Build Command directly:

```bash
pip install -r requirements.txt && prisma generate --schema models/schema.prisma && prisma py fetch
```

### 5. Database Migration

After successful deployment, run migrations:

```bash
# In Render shell or locally with production DATABASE_URL
prisma migrate deploy --schema models/schema.prisma
```

## Common Issues

### Binary Platform Mismatch

If you still get binary errors, explicitly set the binary platform:

Add to `models/schema.prisma`:

```prisma
generator client {
  provider             = "prisma-client-py"
  interface            = "asyncio"
  enable_experimental_decimal = true
  binaryTargets        = ["native", "debian-openssl-3.0.x"]
}
```

Then rebuild.

### Path Issues

Make sure Render is running commands from the correct directory. Check:
- Root Directory setting in Render
- All paths in commands are relative to that root

### Python Version

Render uses Python 3.7 by default. Specify Python 3.11:

In Render Dashboard → Environment:
```
PYTHON_VERSION=3.11.11
```

## Testing Deployment

After deployment:

```bash
# Health check
curl https://your-app.onrender.com/

# Test endpoint (replace with your Clerk token)
curl https://your-app.onrender.com/wallet/balance \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

## Render YAML (Alternative)

If using `render.yaml` for infrastructure as code, I've created one. To use it:

1. Commit `render.yaml` to your repo
2. In Render Dashboard:
   - New → Blueprint
   - Connect your repo
   - Render will auto-detect `render.yaml`

## Quick Fix Commands

If deployment fails, try these in Render Shell:

```bash
# 1. Fetch Prisma binaries manually
prisma py fetch

# 2. Generate client
prisma generate --schema models/schema.prisma

# 3. Check if binary exists
ls -la ~/.cache/prisma-python/binaries/

# 4. Restart service
# (Use Render dashboard)
```

## Current Deployment Command Summary

**Build Command:**
```bash
bash render-build.sh
```

**Start Command:**
```bash
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Root Directory:**
```
backend/wisehaven_backend
```
(Adjust based on your repo structure)

This should resolve the Prisma binary not found error!

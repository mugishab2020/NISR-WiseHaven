# Prisma Binary Fix - Version 2

## The Real Problem (Updated)

After investigating the logs, the issue is clear:

1. ✅ **Build phase works** - Binaries ARE being downloaded
2. ✅ **Binary location confirmed**: `/opt/render/.cache/prisma-python/binaries/5.4.2/ac9d7041ed77bcc8a8dbd2ab6616b39013829574/`
3. ❌ **Runtime issue** - Binary not accessible or missing execute permissions when app starts

## Root Cause

The build cache might not persist between build and runtime, OR the binary doesn't have execute permissions.

## The Solution

Updated `start-server.sh` to:
- Check if Prisma binary is accessible
- If not, fetch it at startup (adds ~5 seconds)
- Fix permissions if needed
- Show detailed diagnostics

## What Changed

**start-server.sh**:
```bash
# Check if Prisma works
if ! python -c "from prisma import Prisma; ..."  then
    # Fetch binaries at startup
    prisma py fetch
    prisma generate --schema models/schema.prisma
    
    # Fix permissions if needed
    chmod +x /opt/render/.cache/prisma-python/.../prisma-query-engine*
fi
```

## Deploy Now

```bash
git add wisehaven_backend/start-server.sh wisehaven_backend/render.yaml wisehaven_backend/PRISMA_FIX_V2.md
git commit -m "Fix: Fetch Prisma binaries at startup with permission fix"
git push
```

Then in Render: Manual Deploy (no need to clear cache)

## Expected Behavior

**Scenario 1: Binaries persist from build**
```
==> Checking Prisma binary:
✅ Prisma client loaded
==> Starting uvicorn server...
```

**Scenario 2: Binaries need to be fetched**
```
==> Checking Prisma binary:
❌ Prisma client failed - attempting to fetch binaries
Downloaded binaries to /opt/render/.cache/...
✅ Prisma client loaded after fetch
==> Starting uvicorn server...
```

**Scenario 3: Permission issue**
```
==> Checking Prisma binary:
❌ Prisma client failed - attempting to fetch binaries
❌ Prisma still failing after fetch - checking permissions
-rw-r--r-- 1 render render ... prisma-query-engine-debian-openssl-3.0.x
✅ Successfully recovered Prisma
==> Starting uvicorn server...
```

## Why This Works

- **Startup fetch**: Guarantees binary exists at runtime
- **Permission fix**: Ensures binary is executable
- **Diagnostics**: Shows exactly what's happening
- **Graceful degradation**: Adds minimal startup time only when needed

## Alternative: Pre-Deploy Command

If startup fetch is too slow, you can use Render's Pre-Deploy Command instead:

In render.yaml:
```yaml
services:
  - type: web
    preDeployCommand: prisma py fetch && chmod +x /opt/render/.cache/prisma-python/binaries/5.4.2/*/prisma-query-engine*
```

This runs after build but before start, ensuring binaries are ready.

## Monitoring

Watch the startup logs to see which scenario occurs:
- If binaries persist → fast startup
- If fetching at startup → ~5 second delay
- If permission issue → automatically fixed

Once deployed successfully, the binaries should persist and startup will be fast.

---

**Status**: Ready to deploy with automatic binary fetch and permission fix at startup.

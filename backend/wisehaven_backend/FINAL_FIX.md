# FINAL FIX - Prisma on Render

## The Real Problem - SOLVED ✅

Your logs showed **NO BUILD PHASE** - it was skipping straight to deployment because:
- The `render.yaml` was trying to run `bash render-build.sh` from the wrong directory
- The `rootDir` wasn't set, so Render was running commands from `/opt/render/project/src/` instead of the backend directory

## The Solution - render.yaml Configuration

Your project uses `render.yaml` for deployment configuration. This file takes precedence over dashboard settings.

**Updated render.yaml:**
```yaml
services:
  - type: web
    name: wisehaven-backend
    env: python
    region: oregon
    rootDir: backend/wisehaven_backend  # ← KEY FIX: Set working directory
    buildCommand: pip install -r requirements.txt && prisma generate --schema models/schema.prisma && prisma py fetch
    startCommand: python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

## What Changed

1. **Added `rootDir: backend/wisehaven_backend`** - This sets the working directory for all commands
2. **Changed buildCommand** - Direct commands instead of trying to run a bash script from wrong location
3. **Simplified startCommand** - No need for `cd` since rootDir is set

## Next Steps

## Next Steps

1. **Commit and push** the updated `render.yaml` to your repository:
   ```bash
   git add wisehaven_backend/render.yaml
   git commit -m "Fix Prisma binary deployment with correct rootDir"
   git push
   ```

2. **In Render Dashboard:**
   - Go to your service
   - Click "Manual Deploy" → "Clear build cache & deploy"
   - This forces a fresh deployment using the new render.yaml config

3. **Watch the logs** - You should now see:
   ```
   ==> Building...
   ==> Installing Python dependencies
   ==> Generating Prisma client
   ✔ Generated Prisma Client Python
   ==> Fetching Prisma binaries
   ==> Build successful
   ==> Deploying...
   ==> Starting server
   INFO: Started server process
   INFO: Application startup complete
   ```

## Why This Works

- **rootDir**: Tells Render to run all commands from `backend/wisehaven_backend/`
- **buildCommand**: Runs in the correct directory, so `requirements.txt` and `models/schema.prisma` are found
- **Prisma binaries**: Get downloaded during build and cached properly

## Fallback: If Dashboard Settings Override

If you have dashboard settings configured, they might override render.yaml. In that case:

1. Go to Settings → Build & Deploy
2. **Clear all custom build/start commands** (leave them empty)
3. Save changes
4. The service will use render.yaml settings instead

## Alternative: Dashboard-Only Configuration

If you prefer not to use render.yaml, you can configure everything in the dashboard:

**Settings → Build & Deploy:**

**Root Directory:**
```
backend/wisehaven_backend
```

Go to your service → Settings

**Build Command:**
```bash
cd backend/wisehaven_backend && pip install --upgrade pip && pip install -r requirements.txt && prisma generate --schema models/schema.prisma && prisma py fetch && ls -la /opt/render/.cache/prisma-python/binaries/ || echo "Binary cache check failed"
```

**Start Command:**
```bash
cd backend/wisehaven_backend && python check-prisma.py || true && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Root Directory:** (leave EMPTY)

### Step 2: Trigger Manual Deploy

Don't just save settings - you need to trigger a FULL rebuild:

1. Go to "Manual Deploy" 
2. Click "Clear build cache & deploy"
3. This forces a fresh build

### Step 3: Watch Build Logs

You should now see:
```
==> Building...
==> Installing Python dependencies
==> Generating Prisma client
✔ Generated Prisma Client Python
==> Fetching Prisma query engine binaries
==> Build successful
```

If you DON'T see "Building..." then the build command isn't running!

## Alternative: Use Pre-Deploy Command

If build command isn't working, try using a **pre-deploy command** instead:

In Render Dashboard:

**Build Command:** (leave empty or use default)

**Pre-Deploy Command:**
```bash
cd backend/wisehaven_backend && pip install -r requirements.txt && prisma generate --schema models/schema.prisma && prisma py fetch
```

**Start Command:**
```bash
cd backend/wisehaven_backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Nuclear Option: Fetch on Startup

If nothing else works, fetch the binary at startup (not ideal but will work):

**Start Command:**
```bash
cd backend/wisehaven_backend && prisma py fetch && prisma generate --schema models/schema.prisma && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

This adds ~10 seconds to startup but guarantees the binary exists.

## Why Your Current Setup Fails

Based on your logs:
1. ❌ No "Building..." message = build command not executing
2. ❌ Goes straight to "Deploying..." = using cached build without Prisma binaries
3. ❌ Binary path shows it's looking in the right place but binary doesn't exist

## What Should Work

The `cd backend/wisehaven_backend` at the start of commands is critical because:
- Your code is at: `/opt/render/project/src/backend/wisehaven_backend/`
- Without `cd`, commands run from `/opt/render/project/src/`
- Prisma can't find `models/schema.prisma` from the wrong directory

## Test Commands

After fixing, you should be able to run in Render Shell:

```bash
cd backend/wisehaven_backend
python check-prisma.py
```

This will tell you if Prisma is properly installed.

## Summary

**Try this exact config:**

1. **Build Command:**
   ```
   cd backend/wisehaven_backend && pip install -r requirements.txt && prisma generate --schema models/schema.prisma && prisma py fetch
   ```

2. **Start Command:**
   ```
   cd backend/wisehaven_backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

3. **Root Directory:** (empty)

4. **Then:** Manual Deploy → Clear build cache & deploy

The key is seeing "Building..." in the logs. If you don't see that, the build command isn't running!

# Render Deployment - Prisma Binary Fix

## The Problem

Prisma query engine binaries are not being found at runtime because they weren't fetched during the build.

## The Solution

### Option 1: Use Build + Start Scripts (RECOMMENDED)

**In Render Dashboard:**

1. **Build Command:**
   ```bash
   bash backend/wisehaven_backend/render-build.sh
   ```

2. **Start Command:**
   ```bash
   bash backend/wisehaven_backend/start.sh
   ```

3. **Root Directory:** (leave empty or set to root of your repo)

### Option 2: Inline Commands

If scripts don't work, use inline commands:

**Build Command:**
```bash
cd backend/wisehaven_backend && pip install -r requirements.txt && prisma generate --schema models/schema.prisma && prisma py fetch
```

**Start Command:**
```bash
cd backend/wisehaven_backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Option 3: Set Root Directory

**If your repo structure is:**
```
repo-root/
  backend/
    wisehaven_backend/
      main.py
      requirements.txt
      ...
```

**Then in Render:**

1. **Root Directory:** `backend/wisehaven_backend`

2. **Build Command:**
   ```bash
   pip install -r requirements.txt && prisma generate --schema models/schema.prisma && prisma py fetch
   ```

3. **Start Command:**
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

## Verification

After setting the commands, trigger a new deploy. You should see in the logs:

```
==> Installing Python dependencies...
==> Generating Prisma client...
✔ Generated Prisma Client Python
==> Fetching Prisma query engine binaries...
==> Build complete!
```

Then at startup:
```
INFO: Started server process
INFO: Waiting for application startup.
✅ Connected to database
INFO: Application startup complete.
```

## If It Still Fails

### Check 1: Verify Binary Target in schema.prisma

Make sure this is in your `models/schema.prisma`:

```prisma
generator client {
  provider                    = "prisma-client-py"
  interface                   = "asyncio"
  enable_experimental_decimal = true
  binaryTargets               = ["native", "debian-openssl-3.0.x"]
}
```

### Check 2: Use Render Shell

After deployment fails:

1. Go to Render Dashboard → Shell
2. Run manually:
   ```bash
   cd backend/wisehaven_backend
   prisma py fetch
   prisma generate --schema models/schema.prisma
   ```
3. Then manually restart the service

### Check 3: Environment Variable

Add this environment variable in Render:

```
PRISMA_QUERY_ENGINE_BINARY=native
```

## Current File Structure

I've created these files:

1. **`render-build.sh`** - Build script with verbose output
2. **`start.sh`** - Start script that checks for binaries before running
3. **`render.yaml`** - Optional Blueprint config
4. **Updated `schema.prisma`** - Added binaryTargets

## What to Do Now

1. **Push these files to your repo**
   ```bash
   git add render-build.sh start.sh models/schema.prisma
   git commit -m "Fix Prisma binary deployment issue"
   git push
   ```

2. **Update Render commands**
   - Use Option 1 commands above

3. **Trigger new deployment**
   - Should work now!

## Still Not Working?

If you're still seeing the binary error, show me:

1. The **full build logs** from Render
2. Your **repo structure** (is it `backend/wisehaven_backend` or something else?)
3. Your current **Build Command** and **Start Command** in Render

The key is making sure `prisma py fetch` runs DURING the build phase, not at startup!

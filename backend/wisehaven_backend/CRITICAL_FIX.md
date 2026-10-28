# 🚨 CRITICAL FIX - Dashboard Override Issue

## The Problem

**Render Dashboard settings are overriding render.yaml!**

Your render.yaml says:
```yaml
startCommand: bash start-server.sh
```

But Render is running:
```
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

This means a Start Command is configured in the Render Dashboard, which **takes precedence** over render.yaml.

## The Solution

### Option 1: Clear Dashboard Settings (RECOMMENDED)

1. Go to Render Dashboard → Your Service → Settings
2. Scroll to **"Build & Deploy"** section
3. Find **"Start Command"** field
4. **DELETE/CLEAR the Start Command** (leave it empty)
5. Click **"Save Changes"**
6. Go to Manual Deploy → Deploy

This will make Render use the render.yaml configuration.

### Option 2: Update Dashboard Directly

If you prefer to configure via Dashboard instead of render.yaml:

1. Go to Render Dashboard → Your Service → Settings
2. **Start Command**: Set to `bash start-server.sh`
3. Click "Save Changes"
4. Deploy

## Why This Matters

The `start-server.sh` script will:
- Automatically fetch Prisma binaries if missing
- Fix permissions
- Show diagnostic logs
- **Make the deployment work**

Without it, you'll keep getting the same Prisma binary error.

## After Fixing

Once you clear the dashboard Start Command and redeploy, you should see:

```
==> Running 'bash start-server.sh'
==> Current directory: /opt/render/project/src/backend/wisehaven_backend
==> Python version: Python 3.11.11
==> Checking Prisma binary:
❌ Prisma client failed - attempting to fetch binaries
Downloaded binaries to /opt/render/.cache/...
✅ Prisma client loaded after fetch
==> Starting uvicorn server...
INFO: Started server process
✅ Connected to database
INFO: Application startup complete
```

## Quick Check

To verify if dashboard settings exist:
1. Go to Settings → Build & Deploy
2. Check if "Start Command" has a value
3. If it does, that's overriding your render.yaml

---

**Action Required**: Clear the Start Command in Render Dashboard, then redeploy.

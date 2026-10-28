# Troubleshooting Render Deployment

## Current Status

**Build Phase**: ✅ Working  
**Startup Phase**: ❌ Failing with exit status 3

## Diagnostic Steps

The `start-server.sh` script will now show detailed diagnostic information during startup.

## Common Issues and Solutions

### 1. Missing Environment Variable

**Symptom**: `CLERK_SECRET_KEY: ` (empty)

**Solution**:
1. Go to Render Dashboard → Your Service → Environment
2. Add `CLERK_SECRET_KEY` with your Clerk secret key
3. Redeploy

### 2. Database Connection Failure

**Symptom**: `❌ Models import failed` or database connection error

**Solution**:
- Verify `DATABASE_URL` is correctly set
- Check that the database service is running
- Verify database credentials match

**Check DATABASE_URL format**:
```
postgresql://username:password@hostname:5432/database
```

### 3. Prisma Binary Not Found

**Symptom**: `❌ Prisma client failed`

**Solution**:
- Clear build cache and redeploy
- Verify `prisma py fetch` ran in build command
- Check `/opt/render/.cache/prisma-python/binaries/` exists

### 4. Import Errors

**Symptom**: `❌ Controllers import failed`

**Possible causes**:
- Missing dependencies in requirements.txt
- Circular imports
- Syntax errors in Python files

**Solution**:
- Check all imports in controllers
- Verify all services are properly defined
- Run `python -m py_compile main.py` locally to check syntax

### 5. Port Configuration

**Symptom**: Server starts but isn't accessible

**Solution**:
- Ensure using `$PORT` environment variable (Render assigns this)
- Command should be: `--port $PORT` (not hardcoded port)

### 6. CORS Issues

**Symptom**: Frontend can't connect

**Solution**:
- Update `allow_origins` in `main.py` to include your frontend URL
- Currently set to `["*"]` (allow all) for testing

## How to Read Diagnostic Output

### Success Pattern
```
✅ Prisma client loaded
✅ Models imported  
✅ Controllers imported
INFO: Application startup complete
```

### Failure Patterns

**Pattern 1: Prisma Binary Missing**
```
❌ Prisma client failed
BinaryNotFoundError: Expected .../prisma-query-engine-debian-openssl-3.0.x
```
→ Solution: Rebuild with cache clear

**Pattern 2: Import Error**
```
✅ Prisma client loaded
❌ Models import failed
ModuleNotFoundError: No module named 'X'
```
→ Solution: Add missing module to requirements.txt

**Pattern 3: Environment Variable Missing**
```
CLERK_SECRET_KEY: 
KeyError: 'CLERK_SECRET_KEY'
```
→ Solution: Add environment variable in Render dashboard

**Pattern 4: Database Connection**
```
✅ Models imported
✅ Controllers imported
INFO: Started server process
ERROR: Connection refused
```
→ Solution: Check DATABASE_URL and database service status

## Quick Fixes

### Force Fresh Build
```bash
# In Render Dashboard
Manual Deploy → Clear build cache & deploy
```

### Check Live Logs
```bash
# In Render Dashboard
Logs tab → Enable "Auto-scroll" → Watch real-time logs
```

### Test Locally First
```bash
cd wisehaven_backend

# Load environment
source .env  # or export manually

# Run startup script
bash start-server.sh
```

## Render Shell Access

If deployment succeeds but something is wrong:

1. Go to Shell tab in Render dashboard
2. Run diagnostic commands:

```bash
# Check working directory
pwd

# List files
ls -la

# Check Python environment
python --version
pip list

# Test Prisma
python -c "from prisma import Prisma; print('OK')"

# Test imports
python -c "from models import connect_db; print('OK')"

# Check environment variables
env | grep -E "(DATABASE|CLERK|PORT)"
```

## Next Steps After Successful Deployment

1. Test health endpoint: `curl https://your-app.onrender.com/health`
2. Test API docs: Visit `https://your-app.onrender.com/docs`
3. Test authentication flow with Clerk token
4. Create test envelopes and allocations
5. Test temporal lock enforcement

## Getting More Help

If issues persist:

1. Copy full error logs from Render
2. Check which diagnostic step fails in startup script
3. Verify environment variables are set
4. Try deploying from a clean branch
5. Check Render status page for platform issues

## Common Error Codes

- **Exit Status 1**: General error (check logs for details)
- **Exit Status 2**: Misuse of shell command
- **Exit Status 3**: Often Python import error or startup failure
- **Exit Status 137**: Out of memory (upgrade plan)
- **Exit Status 143**: Container terminated (timeout or killed)

---

**Current Focus**: Identifying why server exits with status 3 during startup.

The diagnostic script will show exactly which component is failing.

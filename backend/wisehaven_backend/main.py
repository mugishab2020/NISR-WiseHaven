import asyncio
import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

# Import database
from models import connect_db, db, disconnect_db

# Import controllers
from controllers.user_controller import router as user_router
from controllers.wallet_controller import router as wallet_router
from controllers.envelope_controller import router as envelope_router
from controllers.allocation_controller import router as allocation_router
from controllers.transaction_controller import router as transaction_router
from controllers.payee_controller import router as payee_router
from controllers.disbursement_controller import router as disbursement_router
from controllers.notification_controller import router as notification_router
from services.allowance_service import AllowanceService

load_dotenv()
logger = logging.getLogger(__name__)

# ── Rate limiter ──────────────────────────────────────────────────────────────
# Key function: prefer authenticated user ID (from Bearer sub claim) so that
# limits are per-user rather than per-IP (shared NAT, etc.).
# Falls back to remote IP for unauthenticated endpoints (health, docs).

def _get_rate_limit_key(request: Request) -> str:
    """Use Clerk user ID from token as rate-limit key when available."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        try:
            import jwt as pyjwt
            decoded = pyjwt.decode(
                token,
                options={"verify_signature": False},
                algorithms=["RS256", "HS256"],
            )
            sub = decoded.get("sub")
            if sub:
                return f"user:{sub}"
        except Exception:
            pass
    return get_remote_address(request)


RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
FINANCIAL_RATE_LIMIT = f"{RATE_LIMIT_PER_MINUTE}/minute"

limiter = Limiter(key_func=_get_rate_limit_key, default_limits=[FINANCIAL_RATE_LIMIT])


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - startup and shutdown events."""
    await connect_db()
    print("✅ Connected to database")
    allowance_task = asyncio.create_task(_run_allowance_scheduler())
    try:
        yield
    finally:
        allowance_task.cancel()
        try:
            await allowance_task
        except asyncio.CancelledError:
            pass
        await disconnect_db()
        print("👋 Disconnected from database")


async def _run_allowance_scheduler():
    """Release due allowances while the local/API process is running."""
    while True:
        try:
            count = await AllowanceService(db).release_due()
            if count:
                logger.info("Released %s scheduled envelope allowance(s)", count)
        except Exception:
            logger.exception("Allowance scheduler iteration failed")
        await asyncio.sleep(30)


app = FastAPI(
    title="WiseHaven API",
    description="Smart Time-Locked Envelope Wallet Backend API for Rwanda — DEMO MONEY ONLY",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Attach rate limiter state and handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Request body size limit (1 MB) ────────────────────────────────────────────

MAX_BODY_SIZE = int(os.getenv("MAX_BODY_SIZE_BYTES", str(1 * 1024 * 1024)))  # 1 MB


@app.middleware("http")
async def limit_body_size(request: Request, call_next):
    """Reject requests whose body exceeds MAX_BODY_SIZE bytes."""
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_BODY_SIZE:
        return JSONResponse(
            status_code=413,
            content={"detail": "Request body too large (max 1 MB)."},
        )
    return await call_next(request)


# ── Secure HTTP response headers ──────────────────────────────────────────────

_ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security-relevant HTTP headers to every response."""
    response: Response = await call_next(request)

    # Prevent MIME-type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    # Block embedding in iframes
    response.headers["X-Frame-Options"] = "DENY"
    # Limit referrer information
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # Disable browser features not needed by the API
    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=(), payment=()"
    )
    # Content-Security-Policy: API-only, no HTML served
    response.headers["Content-Security-Policy"] = "default-src 'none'"
    # HSTS — only in production so local dev is not affected
    if _ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = (
            "max-age=63072000; includeSubDomains; preload"
        )

    # Authenticated financial API responses must never be cached by a shared
    # or public cache (browsers, CDNs, service workers).
    _static_paths = {"/health", "/", "/docs", "/redoc", "/openapi.json"}
    if request.url.path not in _static_paths:
        response.headers["Cache-Control"] = "no-store"
        response.headers["Pragma"] = "no-cache"

    return response


# ── CORS ──────────────────────────────────────────────────────────────────────
# In development: allow localhost:3000 (Next.js dev server).
# In production: set ALLOWED_ORIGINS env var to a comma-separated list of domains.
# Never use allow_origins=["*"] in production with allow_credentials=True.

_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
)
ALLOWED_ORIGINS: list[str] = [
    o.strip().rstrip("/") for o in _raw_origins.split(",") if o.strip()
]

# Register routers
app.include_router(user_router)
app.include_router(wallet_router)
app.include_router(envelope_router)
app.include_router(allocation_router)
app.include_router(transaction_router)
app.include_router(payee_router)
app.include_router(disbursement_router)
app.include_router(notification_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "WiseHaven API", "auth": "Clerk"}


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "WiseHaven API - Smart Time-Locked Envelope Wallet",
        "version": "0.2.0",
        "auth": "Clerk Authentication",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "endpoints": {
            "users": "/users",
            "wallet": "/wallet",
            "envelopes": "/envelopes",
            "allocation_plans": "/allocation-plans",
            "transactions": "/transactions",
            "payees": "/payees",
            "disbursements": "/disbursements",
            "notifications": "/notifications",
        },
        "notes": {
            "authentication": "Use Clerk for user authentication (register/login handled by frontend)",
            "authorization": "All endpoints require Bearer token from Clerk",
            "user_sync": "User automatically synced to database on first API call",
            "demo": "All financial operations use simulated demo money only",
        },
    }


# Keep CORS outside FastAPI's server-error middleware so unhandled 500 responses
# still carry Access-Control-Allow-Origin and expose the actual backend error.
fastapi_app = app
app = CORSMiddleware(
    app=fastapi_app,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    max_age=600,
)
# Preserve FastAPI state access used by the rate limiter and integrations.
app.state = fastapi_app.state


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
